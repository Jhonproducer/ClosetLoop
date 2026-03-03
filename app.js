/* ==============================================================
   MY DAILY OUTFIT JS - CORE APP LOGIC & INDEXEDDB MANAGEMENT
   ============================================================== */

/**
 * DATABASE INITIALIZATION: INDEXED-DB
 * IndexedDB usa un formato fuertemente estructurado transaccional que permite guardado asíncrono
 * infinito. A diferencia del local storage que bloquearía tras subidas masivas de datos en B64.
 * Aquí creamos una abstracción bajo promesas.
 */
const DB_NAME = 'DailyOutfitDB';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        // Abriendo conexión para la instancia de app DB
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            // Al ser el "v1", generamos los Stores. 'clothes' será la tabla master de Ropa.
            if (!db.objectStoreNames.contains('clothes')) {
                // Autoincrement garantiza id's serializados perfectos cada subida de foto.
                const store = db.createObjectStore('clothes', { keyPath: 'id', autoIncrement: true });
                // Generar índices auxiliares para no filtrar "a mano" por miles de prendas posibles luego.
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('state', 'state', { unique: false }); 
            }
            if (!db.objectStoreNames.contains('app_state')) {
                db.createObjectStore('app_state', { keyPath: 'id' });
            }
        };

        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject("DB Open Error: ", e);
    });
}

/* ============================ Funciones CRUD ============================ */
async function dbTransact(storeName, mode, callback) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let request;
        try { request = callback(store); } catch(err) { reject(err); }
        
        tx.oncomplete = () => resolve(request?.result);
        tx.onerror = (e) => reject(e);
    });
}

// Devuelve todo según storeName y callback request. Retorna un arreglo nativo IndexedDB o item por defecto
async function getAppState() {
    const data = await dbTransact('app_state', 'readonly', s => s.get('current'));
    return data || { id: 'current', outfitExpiringOn: null, fId: null, sId: null };
}

async function saveAppState(stateObj) {
    return await dbTransact('app_state', 'readwrite', s => s.put(stateObj));
}

async function saveClothingItem(type, compressedImageStrBase64) {
    const obj = {
        type: type, // "franela" o "short"
        state: 'limpio', // Por defecto cuando alguien la sube nueva del rack es "limpia" disponible
        image: compressedImageStrBase64,
        dateAdded: Date.now()
    };
    return await dbTransact('clothes', 'readwrite', s => s.add(obj));
}

async function updateClothState(id, newState) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('clothes', 'readwrite');
        const store = tx.objectStore('clothes');
        const req = store.get(id);
        req.onsuccess = () => {
            let data = req.result;
            if(!data) {resolve(); return;}
            data.state = newState;
            const upReq = store.put(data);
            upReq.onsuccess = resolve;
            upReq.onerror = reject;
        };
    });
}

async function getClothes() { return await dbTransact('clothes', 'readonly', s => s.getAll()); }
async function getClothById(id) { if(!id)return null; return await dbTransact('clothes', 'readonly', s => s.get(id)); }


/* =========================================================================
   LÓGICA CORE DE NEGOCIO: VALIDACIÓN A LAS 18:00 & ESTADOS DE MUDAS (CYCLE)
   ========================================================================= */

// Calcula cuándo ocurrirán las próximas "6:00 PM" basándose en la fecha real 
// del Outfit. Un outfit debe "envejecer" y caducar mañana, salvo si fue seteado recién un 15:00 del mismo día 
// o después, el cual aguanta natural a mañana al día completo hasta ser tarde noche.
function calcNextExpirationRule() {
    const now = new Date();
    const next18Time = new Date();
    // ¿Puesto después de las 6PM O puesto en cualquier transcurso normal antes del cambio horario?
    // Exigencia del Prompt: "...debe pasar a sucio al DIA SIGUIENTE a las 6:00 PM."
    // Es decir: Garantiza caducidad obligada en Tomorrow @ 18:00 h
    next18Time.setDate(now.getDate() + 1);
    next18Time.setHours(18, 0, 0, 0); // Exactamente las 18:00hrs al día de mañana
    return next18Time.getTime();
}

async function routineCycleCheck() {
    const state = await getAppState();
    const nowTimestamp = Date.now();
    
    // Mostramos reloj simple visible en PWA Top UI
    document.getElementById('dashboard-clock').innerText = new Date().toLocaleTimeString('es-US', {hour: '2-digit', minute:'2-digit'});

    if (state.outfitExpiringOn !== null) {
        // Chequeo estricto del Lifecycle limit. 
        if (nowTimestamp >= state.outfitExpiringOn) {
            // El tiempo llegó o es mas tarde => Mudar 'En uso' de franelas pasadas y pasarlos a sucio permanentemente.
            console.log("🔥 CICLO 18:00HRS SUPERADO: Caducando MUDAS y pidiendo selección en Pantalla.");
            
            if (state.fId) await updateClothState(state.fId, 'sucio');
            if (state.sId) await updateClothState(state.sId, 'sucio');

            state.fId = null; 
            state.sId = null;
            state.outfitExpiringOn = null; // Reiniciando estado expiratorio forzoso temporalmente vacante 
            await saveAppState(state);

            // Refrescar Pistas PWA en interfaz activa visualmente! 
            await runUIUpdateCycle();
        }
    }
}


/* ============================================================
   CANVAS - REDUCTOR DE IMAGENES (<100KB, Rescaling Max-800, JPEG 70%) 
   ============================================================ */
async function processCanvasImageBase64(fileObject) {
    return new Promise((resolve) => {
        const fr = new FileReader();
        fr.readAsDataURL(fileObject);
        fr.onload = (ev) => {
            const tempImg = new Image();
            tempImg.src = ev.target.result;
            tempImg.onload = () => {
                const cvs = document.createElement('canvas');
                let W = tempImg.width; 
                let H = tempImg.height;

                // Logica Resizer Ratio a 800 pixeles de Ancho permitidos máximo por App Specification Limitado 
                const maxWidthParam = 800;
                if (W > maxWidthParam) {
                    H = H * (maxWidthParam / W); // Calculo proporcional de aspecto H:W para que mantenga Ratio y No Deformaciones Canvas Nativa CSS Canvas Scale App .
                    W = maxWidthParam; 
                }

                cvs.width = W; 
                cvs.height = H;
                const canvasCtxRenderContextApiJSHTML5ObjectPaintScaleContextNode2D = cvs.getContext('2d'); 
                canvasCtxRenderContextApiJSHTML5ObjectPaintScaleContextNode2D.drawImage(tempImg, 0, 0, W, H);
                
                // Aplicacion Extrema HTML5 - Comprimiendo JPG de Base API
                const b64DataReadyLimitCompressionHTMLJSNodeExportOutputOutputNodeCanvasResultSizeB64FormatRenderStringValueResultParamStringOutputFinalVariable= cvs.toDataURL('image/jpeg', 0.7);
                resolve(b64DataReadyLimitCompressionHTMLJSNodeExportOutputOutputNodeCanvasResultSizeB64FormatRenderStringValueResultParamStringOutputFinalVariable);
            }
        };
    });
}


/* ==============================================================
   LOGICAS COMPUESTAS: SUGERENCIAS ALERTAS Y UPDATE DEL RENDER
   ============================================================== */

async function assignRandomSuggestOutfitRoutinePWAEventButtonEventFire() {
    let clothesAvailableArrayNowDbQueryFetchAllObjectFetchRawReturnCallObjectJSResultValuesObjValuesQueryRetReturnObjArrayResultsForStateCountObjectRetDBValuesFetchNowResReturnParamOutputResStateReturnVarArrayObjectObjResultArrayDb= await getClothes();

    // Filtros de las matrices. ¿Disponibilidad real Array Filters (Limpias y segregeadas franela -vs- short ) ? 
    let flinmpia = clothesAvailableArrayNowDbQueryFetchAllObjectFetchRawReturnCallObjectJSResultValuesObjValuesQueryRetReturnObjArrayResultsForStateCountObjectRetDBValuesFetchNowResReturnParamOutputResStateReturnVarArrayObjectObjResultArrayDb.filter(c => c.state === 'limpio' && c.type === 'franela');
    let slimpia = clothesAvailableArrayNowDbQueryFetchAllObjectFetchRawReturnCallObjectJSResultValuesObjValuesQueryRetReturnObjArrayResultsForStateCountObjectRetDBValuesFetchNowResReturnParamOutputResStateReturnVarArrayObjectObjResultArrayDb.filter(c => c.state === 'limpio' && c.type === 'short');
    
    if (flinmpia.length === 0 || slimpia.length === 0) {
        alert("¡Alto ahì! Te falta inventario 😱. O no tienes Franelas limpias, O no tienes Shorts."); 
        return; 
    }
    
    let stAppInstanceRefDataModModResultInstanceContextValueVal = await getAppState();

    // "Pagar" ciclo previo revirtiendo un outfit manualmente sustituible temporal y volverlas limpio al instante si se reemplazaron "MÁS PRONTO que su Expiración por Manual Trigger Refresh o Regusto Estético Personal. (Permite Re-roller naturalidad)" . 
    if (stAppInstanceRefDataModModResultInstanceContextValueVal.fId) await updateClothState(stAppInstanceRefDataModModResultInstanceContextValueVal.fId, 'limpio');
    if (stAppInstanceRefDataModModResultInstanceContextValueVal.sId) await updateClothState(stAppInstanceRefDataModModResultInstanceContextValueVal.sId, 'limpio');

    const randIdFranSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex= flinmpia[Math.floor(Math.random()*flinmpia.length)];
    const randIdShortSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex = slimpia[Math.floor(Math.random()*slimpia.length)];

    await updateClothState(randIdFranSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex.id, 'en_uso');
    await updateClothState(randIdShortSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex.id, 'en_uso');

    stAppInstanceRefDataModModResultInstanceContextValueVal.fId = randIdFranSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex.id; 
    stAppInstanceRefDataModModResultInstanceContextValueVal.sId = randIdShortSelectResultIndexMathIntRandomValTargetFinalObjectReturnJSHTMLIdDBItemIndex.id;
    // Si la sugerencia fue clickeada se instaura legalidad horario nueva expiratoria oficial calculada a partir de ya! "MUDANZA 24H RULES: Aceptar Mudanza => A LAS 1800 de MANAÑA EXPLOTA a Dirty!".
    stAppInstanceRefDataModModResultInstanceContextValueVal.outfitExpiringOn = calcNextExpirationRule(); 
    
    await saveAppState(stAppInstanceRefDataModModResultInstanceContextValueVal); 
    await runUIUpdateCycle(); // Repinta SPA
}


async function alertStateRuleSystemVerifyGlobalCheckForRenderLogicAndWarningsUIRulesForInventoryValuesAndWarningAppLimitWarningThreshold(){
   let appTotalC = await getClothes();
   let totalAvailableF=0, totalAvailableS=0;
   
   appTotalC.forEach(cc=> {
      if(cc.state === 'limpio') { cc.type === 'franela'? totalAvailableF++ : totalAvailableS++ ; } 
   });

   // ALERTA LAVANDERIA - SI Ocurre un Min Limpios mudas integras calculadas limitadas <2 Warning!!  
   const setsOfCompletedRemainingDressesLimitNumberWarningResultObjectOutAppCheck = Math.min(totalAvailableF, totalAvailableS); 
   let al = document.getElementById('laundry-alert'); 
   if(setsOfCompletedRemainingDressesLimitNumberWarningResultObjectOutAppCheck < 2){ al.classList.remove('hidden'); } else { al.classList.add('hidden');}
}


/* ==============================================================
   SPA RENDER CORE ENGINES PARA TABS: PINTURA ESTRUTURAL DOM DINAMICO HTML  
   ============================================================== */
async function runUIUpdateCycle(){
   // Check system limits laundry (Siempre primero notificar)
   await alertStateRuleSystemVerifyGlobalCheckForRenderLogicAndWarningsUIRulesForInventoryValuesAndWarningAppLimitWarningThreshold(); 

   let estadoMasterStateAPP= await getAppState(); 
   const fO = await getClothById(estadoMasterStateAPP.fId);
   const sO = await getClothById(estadoMasterStateAPP.sId);
   const invt = await getClothes(); 
   
   // TAB-1: RENDER DE HOY "EN USO DASHBOARD CURRENT MUDA": Reconstruyendo Vista Estado DOM Modulo Actual (Current PWA Context Value Result Node DOM JS Result Visual Nodes)
   if (!fO || !sO) {
        // En vacante (Ej, Post-18:00hs mudanza a Dirty automático generador empty Prompt View System o primera instalacion): 
        document.getElementById('outfit-display').classList.add('hidden'); 
        document.getElementById('prompt-elegir-ropa').classList.remove('hidden');
   } else {
        document.getElementById('outfit-display').classList.remove('hidden');
        document.getElementById('prompt-elegir-ropa').classList.add('hidden');
        document.getElementById('display-franela').innerHTML = `<img src="${fO.image}" />`;
        document.getElementById('display-short').innerHTML = `<img src="${sO.image}" />`;
   }


   // TAB-2: GRID ARMARIO DOM PAINT SYSTEM RE RENDER CONSTRUCTOR NODO APPEND 
   let cGridNodeGridNodeArmariNodeHtmlHtmlElDOM= document.getElementById('clothes-grid'); 
   cGridNodeGridNodeArmariNodeHtmlHtmlElDOM.innerHTML="";
   
   let lanGriDNodEGnODEvASTNodeHtmlElemDomNodesLanundruRefTargetLaundryLaundryListRefLnaLaundryVewListLlistlister= document.getElementById('laundry-grid'); 
   lanGriDNodEGnODEvASTNodeHtmlElemDomNodesLanundruRefTargetLaundryLaundryListRefLnaLaundryVewListLlistlister.innerHTML="";
   
   // Bucle mapeador constructor de Bloques Render para la Grilla Grid Array Display View 
   invt.slice().reverse().forEach(itm => {  // Reversed para Ultimo Añadido Primera vision. (Sort Array Reverse Time Display Output Values Result UX Experience UI Sort View Target Output)
       
       let displayStateTagResultObjTextObjRenderMapResultDOMMapResult = '';
       let adtlBtnsListRenderObjResHtmlMap = '';

       if (itm.state === 'limpio') { 
            displayStateTagResultObjTextObjRenderMapResultDOMMapResult = '<span class="state-indicator state-limpio">LIMPIO</span>';
            adtlBtnsListRenderObjResHtmlMap=`<button class="neon-btn danger-btn small-btn mtBtnRepVacioAppHtmlObjStringFuncEvalArgClickCallFuncStrReturn" onclick="manStateCall(this,${itm.id},'en_reparacion')">🔧 Enviar Reparar</button>`;
       } 
       else if (itm.state === 'en_uso'){
           displayStateTagResultObjTextObjRenderMapResultDOMMapResult = '<span class="state-indicator state-en_uso">USÁNDOSE AHORA</span>'; 
       }
       else if(itm.state === 'en_reparacion'){
            displayStateTagResultObjTextObjRenderMapResultDOMMapResult = '<span class="state-indicator state-en_reparacion">TALLER/SARTORIA</span>'; 
            // Requerimiento Especifico. Unidades Boton Rescate Retornado A estado Disp. 'Regresado Limpios Rops. ': 
            adtlBtnsListRenderObjResHtmlMap=`<button class="neon-btn success-btn small-btn strFuncl" style="margin-top:10px" onclick="manStateCall(this, ${itm.id}, 'limpio')">🔙 ¡Ya Regresó!</button>`; 
       }
       else if (itm.state === 'sucio') {
             displayStateTagResultObjTextObjRenderMapResultDOMMapResult = '<span class="state-indicator state-sucio">SUCIO CESTO</span>';
             // Armado a Lista Secunadria Cesta Tab System Renedr List List Grid Layout Element Obj Obj Display. (Rellenamos Array Cestas Dom!)
             lanGriDNodEGnODEvASTNodeHtmlElemDomNodesLanundruRefTargetLaundryLaundryListRefLnaLaundryVewListLlistlister.insertAdjacentHTML('beforeend',
             `
                 <div class="grid-item">
                     <div class="item-status-overlay">🔴 Para Lavar</div>
                     <div class="grid-img"><img src="${itm.image}"></div>
                 </div>
             `
             );
       }
       
       cGridNodeGridNodeArmariNodeHtmlHtmlElDOM.insertAdjacentHTML('beforeend',
           `
           <div class="grid-item">
                <div class="item-status-overlay">${displayStateTagResultObjTextObjRenderMapResultDOMMapResult}</div>
                <div class="grid-img"> <img src="${itm.image}"> </div>
                <div class="grid-controls">${adtlBtnsListRenderObjResHtmlMap}</div>
           </div>
           `
       ); 
   });
}


/* GLOBAL PUBLIC ACCESOR WRAPPER NATIVE JAVASCRIPT GLOBAL NODE LISTENER APP SYSTEM EVENT ACTIONS EVENT HANDLERS TRIGGER RENDER MAP CALLBACK FUNC DOM API METHOD HOOK OBJ REF: 
*/

// Para OnClicks inyectados directamente vía Texto de Grids de la View a Function Global Map State State State Manager Dispatch Action: "Dispatch" Pattern Vanilla App SPA 
window.manStateCall = async (btEleHtmlEvTargetRefNodeThisInstanceTargetStrPropJSNodeValueButtonElementStrTargetStrTargetNodeTargetTargetValueFuncArgumentObjectFuncObjHTMLNodeReturnRefHTMLStringEvDOMApiReturnArgEventEvalOnClickRefTargetArgumentStringInt,id, valS)=> {
      await updateClothState(id, valS);
      await runUIUpdateCycle();
}

// BINDEOS INIT APP. Inicializadores Primarios App Boot Sistema Bootstraping Event Loop Callbacks Listeners  : 
window.onload = async () => {
   // Arranque Sistema Local Offline Sync DB. Base  y Verificadores de Tiempo Relojes Intervaladores Regla de mudas "60Seg Checker para Mudos Mudas Rules Expiration Expiry"  (Cron job Front!) . 
   await runUIUpdateCycle();
   setInterval(routineCycleCheck, 1000 * 60); 

   /* Eventos Interfaz de usuario : TAB SWITCHES DOM View Managers: "Sistema Router Vista Basica"*/ 
   const nabtsEventListenereDOMQuerySetQuerySelectorQueryQueryApp = document.querySelectorAll('.nav-item');
   nabtsEventListenereDOMQuerySetQuerySelectorQueryQueryApp.forEach(b => {
      b.addEventListener('click', () => {
           nabtsEventListenereDOMQuerySetQuerySelectorQueryQueryApp.forEach(x => x.classList.remove('active'));
           b.classList.add('active');
           document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); 
           document.getElementById(b.getAttribute('data-target')).classList.add('active');
      });
   });

   /* Manejadores Acciones Principales View UI Components Core Logic Handler Binding  */

   document.getElementById('btn-suggest').addEventListener('click', assignRandomSuggestOutfitRoutinePWAEventButtonEventFire);

   // Botón Subida de foto Ropa a canvas e injeccion 
   document.getElementById('img-upload').addEventListener('change', async (evn) => {
       const filDocDOMEventApiObjectJSParamValOutputOutputInputRef = evn.target.files[0];
       if(!filDocDOMEventApiObjectJSParamValOutputOutputInputRef)return;

       // Conversiones Y COMPRESS CANVAS RULE : Resize Automatic Ratio 800 W + QUALITY 0.7  == UNDER ~75KBs MAXIMAL!!
       let resValValTypeDomRefNodeTypeElementTargetDOMTargetSelectorGetGetAppValueReturnObjectReturnDataRenderVal= document.getElementById('type-select').value;
       const bx6ResultCompressedDataCanvasOutputRenderReadyVarHtmlCanvas= await processCanvasImageBase64(filDocDOMEventApiObjectJSParamValOutputOutputInputRef);
       
       await saveClothingItem(resValValTypeDomRefNodeTypeElementTargetDOMTargetSelectorGetGetAppValueReturnObjectReturnDataRenderVal, bx6ResultCompressedDataCanvasOutputRenderReadyVarHtmlCanvas);
       document.getElementById('img-upload').value=""; // Borrado residual caché HTML Value File Path Seguridad Navegador Chrome Safaries Pwa Safari DOM Limit .
       await runUIUpdateCycle(); // Repintamos App Armarios Grids App . 
       
       // Alertita notoria PWA : Visual cue . 
       alert("👕 Prenda Salvada Satisfactoriamente. Visita al menú para interactuarla!")
   });

   // Boton 'LAVAR TODO EL CESTO" , "Moviendo SUCIO=> LIMPIO GLOBAL": 
   document.getElementById('btn-wash-all').addEventListener('click', async ()=>{
         let totalClothesArrMapSystemForFilterStateMapActionDOMAppReturnResultsNodeCheckLoopResultsMapNodesObjDbValuesStateAppMapRefAppListVals = await getClothes(); 
         let checkDirtyAppExistsListDOMResultsCheck = totalClothesArrMapSystemForFilterStateMapActionDOMAppReturnResultsNodeCheckLoopResultsMapNodesObjDbValuesStateAppMapRefAppListVals.filter(xc=>xc.state==='sucio');
         if(checkDirtyAppExistsListDOMResultsCheck.length===0){
              alert("No hay ropas que limpiar. Está limpio. 😂"); return; 
         }
         // Muteamos masivamente la DB "Transaccional Virtual Indexed For-Looping Mutes All Dirtys!"  
         for (let drXoObjectMapCheckLoopResultsMapValsResultsListFilterOutFilterResultDBItemRecordLoopAppValsObjOutRenderResultValDBObjItterOfLoopArrResultStateRenderResultDOMRenderValRefFilterResultDbLoopListXItemItResultArrayRecordDB of checkDirtyAppExistsListDOMResultsCheck){
             await updateClothState(drXoObjectMapCheckLoopResultsMapValsResultsListFilterOutFilterResultDBItemRecordLoopAppValsObjOutRenderResultValDBObjItterOfLoopArrResultStateRenderResultDOMRenderValRefFilterResultDbLoopListXItemItResultArrayRecordDB.id, 'limpio');
         }
         alert("🧺 Splash Splash, Limpitos y Frescos Listos al RACK Armarios 🧼"); 
         await runUIUpdateCycle();
   });
};
