/* ========================================================
   FLEXI-CLOSET V1 | DB, Core Business & View SPA Engine 
   Dependencia = 0 (Todo Vanilla / Base Browser Local )
========================================================== */

const DBNAME = "FlexClosetApp";
const DBVER = 1;
const STORE_NAME = "MyRopaObjBaseStoreIDBPorAppFullAppXVersionFinal_a5639x";

// APP STATE CACHE RAM LOGIC MEM (Actúa veloz)
const STATE = {
    clothes: [],
    // Memory local draft state setup building mode 
    draftMuda: {
        franelaId: null,
        shortId: null
    } 
};

/* --- MANAGER LOCAL: INDEXEDDB WRAPPER --- */
const FlexDB = {
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DBNAME, DBVER);
            
            req.onupgradeneeded = e => {
                let IDBStoreInternalTempLinkInstanceLocalMemoryHookBaseCoreAppMemoryEngineAppConfigValCoreDBBaseVarValCoreDB_T53 = e.target.result;
                // Claves Base Index
                if (!IDBStoreInternalTempLinkInstanceLocalMemoryHookBaseCoreAppMemoryEngineAppConfigValCoreDBBaseVarValCoreDB_T53.objectStoreNames.contains(STORE_NAME)) {
                    IDBStoreInternalTempLinkInstanceLocalMemoryHookBaseCoreAppMemoryEngineAppConfigValCoreDBBaseVarValCoreDB_T53.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                }
            };

            req.onsuccess = e => {
                this.db = e.target.result;
                resolve();
            };
            req.onerror = () => reject("Navegador deniega acceso a DB :(");
        });
    },

    saveClothItem(clothObj) {
        return new Promise(resolve => {
            let trx = this.db.transaction(STORE_NAME, "readwrite");
            let req = trx.objectStore(STORE_NAME).put(clothObj); // Sirve INSERT & UPDATE(Re-put mismo id). 
            req.onsuccess = () => resolve(req.result); // yields its Auto ID or over-written Id Num
        });
    },

    deleteItem(id) {
         return new Promise(resolve => {
            let tx = this.db.transaction(STORE_NAME, "readwrite");
            let rq = tx.objectStore(STORE_NAME).delete(id);
            rq.onsuccess = () => resolve(true);
         });
    },

    getAllDataListMemoryPwaObjAppIDbGetFlowFullCoreSyncPullArrayFullReturnDBReqEventArrRespVarMemoryStoreDataLocalIndex() {
        return new Promise(resolve => {
             const r = this.db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
             r.onsuccess = () => resolve(r.result);
        });
    }
};

/* --- LOGICA Y SISTEMA EXPERTO CANVAS COMPRESS --- */
const FileCompressor = {
    processImageToAppBlobStringMemory64SizeDataDBPwaClientAppObjFileInBlobType(inputFileControlHTMLDOMTargetElmBaseInputEventT) {
         return new Promise((resolve, reject) => {
              if(!inputFileControlHTMLDOMTargetElmBaseInputEventT) resolve(null); // Error Check

              let frderBaseDOMFileReaderStringAPIObjHk = new FileReader();
              frderBaseDOMFileReaderStringAPIObjHk.readAsDataURL(inputFileControlHTMLDOMTargetElmBaseInputEventT); // load Blob From native mobile camera OS app selector UI Form Base

              frderBaseDOMFileReaderStringAPIObjHk.onload = (readEventLoadTriggerEvDataLocal) => {
                  
                  // Turn that base64 local OS buffer heavy picture onto DOM UI Engine Img Native Wrapper Object tag logical memory instance for canvas manip draw size cut limits width ratio aspect limit calculation var control val memory local :D  ¡SENIOR WAY PWA CLIENT IMG UPLOAD ENGINE RAW!:
                  let internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8 = new Image(); 
                  internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8.src = readEventLoadTriggerEvDataLocal.target.result;

                  internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8.onload = () => {
                       let renderTargetEngineSizeRefEnginePwaValC = document.getElementById("preview-canvas"); // Usa UI node HTML ya existente es mas fiable ram iOS pwa 
                       let maxDimensionPwaAllowedEngineConfig = 800; // Limite Size Solicitado 800PX para IDB performance y tamaño. Limit. Size req.

                       let srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n = internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8.width;
                       let srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s = internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8.height;

                       // Calular Aspect Ratio Constrained To 800px Math. Limitas Aspect Math... Scale. Factor var Log Obj Math Ref limit limit Engine limit Math Engine logic
                       if (srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n > maxDimensionPwaAllowedEngineConfig) {
                             srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s *= (maxDimensionPwaAllowedEngineConfig / srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n);
                             srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n = maxDimensionPwaAllowedEngineConfig;
                       }
                       // Limiting The Heights aspect if portrait ratio big! Safety Math Size Scale (Portrait format OS phone UI Native Photos ) Limit
                       if(srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s > maxDimensionPwaAllowedEngineConfig) {
                            srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n *= (maxDimensionPwaAllowedEngineConfig / srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s);
                            srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s = maxDimensionPwaAllowedEngineConfig;
                       }

                       // Apply math scale resolution dimensions to HTMLCanvas internal Node
                       renderTargetEngineSizeRefEnginePwaValC.width = srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n;
                       renderTargetEngineSizeRefEnginePwaValC.height = srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s;

                       let drawingEnginLocalUIHwCteCont = renderTargetEngineSizeRefEnginePwaValC.getContext("2d");
                       drawingEnginLocalUIHwCteCont.drawImage(internalJSUIEngineLocalImgMemLogicObjTagToCutForSizePwaHwValLocalDrawCtxObjEngineStrTagEl_56a5FGHhjk2w83vR4b8, 0,0, srcWidDrawHkEngineLogXLimAppCalLWidthRefSizeT5vXyA3n, srcHeigDrawHkEngineLogYLimAppCalHeightRefSizeKx5ZlMw3s);

                       // Generate Data URL With compression Engine native: MIME , Calidad Quality Engine Val : (requriments ask: " calidad 0.7  para q pesan -100kib ") 0.7 . BAM! Compilado puro JS Base limit Size! Canvas Rule... Wow Vanilla js speed engine limits 
                       let jpegPayloadCompressionBaseDOMFinalSysEngineT4StringDBTextResultPushResultResult = renderTargetEngineSizeRefEnginePwaValC.toDataURL("image/jpeg", 0.7);

                       // Mostrar para el ojimetro usuario como feedback y limpiar canvas view..
                       renderTargetEngineSizeRefEnginePwaValC.style.display="block";

                       resolve(jpegPayloadCompressionBaseDOMFinalSysEngineT4StringDBTextResultPushResultResult);
                  }
              };
         });
    }
}


/* --- CEREBRO PWA y BUSINESS FLEXIBILITY LIMIT LOGIC ---- */

const AppLogicEngineFlex = {

    async startPwaRun() {
        await FlexDB.init();
        await this.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB();
        UI.initTabsSysDOMFlowEvH();
        this.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
    },

    async loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB() {
         STATE.clothes = await FlexDB.getAllDataListMemoryPwaObjAppIDbGetFlowFullCoreSyncPullArrayFullReturnDBReqEventArrRespVarMemoryStoreDataLocalIndex();
    },

    getArrayItemsPorBaseCategoriaLogicaAppVal(categoryFilterTypeLocalAppSearchLogicMemAppMemoryFuncLimitLogiA72Z9P0L2xTReqC="todas", estadoFiltrArgCheckSysEngineReqAppBaseEstadoBaseLimitFLogic="all") {
         return STATE.clothes.filter( ropaUnitarioSysCoreLimitRefItemObjBaseIdbAppVarLogObjModelLimitIdA3pMemFuncListArr_T2Hk8L3D => {
              let categoryMchLocalLimitMatchCondLimitCoreValResultBaseA2LogicaT = categoryFilterTypeLocalAppSearchLogicMemAppMemoryFuncLimitLogiA72Z9P0L2xTReqC === "todas" ? true : ropaUnitarioSysCoreLimitRefItemObjBaseIdbAppVarLogObjModelLimitIdA3pMemFuncListArr_T2Hk8L3D.cat === categoryFilterTypeLocalAppSearchLogicMemAppMemoryFuncLimitLogiA72Z9P0L2xTReqC;
              let staMacBaseMemBoolFilerFuncLocalListResCheckRefT8zELogicQ1LimitF= estadoFiltrArgCheckSysEngineReqAppBaseEstadoBaseLimitFLogic === "all"? true : ropaUnitarioSysCoreLimitRefItemObjBaseIdbAppVarLogObjModelLimitIdA3pMemFuncListArr_T2Hk8L3D.state === estadoFiltrArgCheckSysEngineReqAppBaseEstadoBaseLimitFLogic;
              return categoryMchLocalLimitMatchCondLimitCoreValResultBaseA2LogicaT && staMacBaseMemBoolFilerFuncLocalListResCheckRefT8zELogicQ1LimitF;
         });
    },

    sugerirAzarMagicoAutoLogica() {
        // busca LIMPIOS! Para sugerencias obvio limit... clean!  Requiriment 
        const optsShirt = this.getArrayItemsPorBaseCategoriaLogicaAppVal("franela", "Limpio");
        const optsShort = this.getArrayItemsPorBaseCategoriaLogicaAppVal("short", "Limpio");
        
        // "sugier una aleatorio limpio! Y lo colcoas visual sin conitramrt apara armarme mudta"... OK. Validacion: Si no hy hay .. aviso al client logioc flexi rules flex ...  limit  App
        if(optsShirt.length === 0 || optsShort.length === 0){
             alert("Aviso: No logramos hallar piezas Limpias Suficientes (requieres 1 de cada 1 para generar combinacion sugerida random automatica.)! Agregala (Lava la Cesta! ) ó  ... escógela del cesto con fuerza mental flexi tu mismo pulsando MANUAL -> (botón: CAMBIAR  ! Flexibilidad!");
             return; // fail
        }
        
        // math Pwa js rand
        STATE.draftMuda.franelaId = optsShirt[Math.floor(Math.random()*optsShirt.length)].id;
        STATE.draftMuda.shortId   = optsShort[Math.floor(Math.random()*optsShort.length)].id;

        UI.mostrarUIOpcionesMudaFlujoPwaVisualizarPreparativosPendientesLogicosTFlowUINewStateMemRefZUI78L(); // pinta  ui la seleccion... memory .. RAM limit logic render Hook!! (No IDB SAVE Yet )
    },

    async comfirmDraftSeleccionadaPasosRequiridoConfirmacionLógicaDeMudazaFlexSystemUserHookBaseRefValUIUpdateActionUserL( ) {
         if (!STATE.draftMuda.franelaId || !STATE.draftMuda.shortId){ alert("Tienes huecos nulos selecciones!!"); return; }

         // " La ropa  ESTABABA EN USOO PASA AL LVAANDERiaaa SUCIA ".. Logicoo de App req. Requisitoss App... Regla.
         let usoPresentSysObjMemListaAppLogBuscVArrayGetEngineIDBLogArrResultFReqAppArrMemoryP= this.getArrayItemsPorBaseCategoriaLogicaAppVal("todas", "En Uso");
         
         // Loop and Update Db Sys "old guys to basket! dirty basket!... BAM" .. A IDB Storage Loop.
         for( let actual of usoPresentSysObjMemListaAppLogBuscVArrayGetEngineIDBLogArrResultFReqAppArrMemoryP){
               actual.state = "Sucio"; await FlexDB.saveClothItem(actual); 
         }

         // Pasa los dos (Short+Camisasa  (Seleccion draft ids ref hook RAM !  PWA engine array! limit ..)) de STATE=... a  uso ! Guardadado real en db... Confirmdo . "Llevo puesta ESTE OUTIT  flex rule ".
         let itemFranPuestaAppArrLimitObjVFuncA3mValResultGetMemoryArrayT = STATE.clothes.find( i=> i.id === STATE.draftMuda.franelaId); 
         let iteShopttTResVarTGetRefEngineHookValUIGett = STATE.clothes.find( i=> i.id === STATE.draftMuda.shortId); 

         // Appling change
         itemFranPuestaAppArrLimitObjVFuncA3mValResultGetMemoryArrayT.state = "En Uso"; await FlexDB.saveClothItem(itemFranPuestaAppArrLimitObjVFuncA3mValResultGetMemoryArrayT);
         iteShopttTResVarTGetRefEngineHookValUIGett.state = "En Uso"; await FlexDB.saveClothItem(iteShopttTResVarTGetRefEngineHookValUIGett);
         
         STATE.draftMuda = { franelaId:null, shortId:null}; // WIPE pending ui app states . clean
         await this.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB();
         this.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
    },

    async massLavarSestoFlowEngineLogicAppArrayLoopStorageSystemDataChangeBaseLocalT90() {
         let sysMemoryPwaListaFiltrA4kLogSucio = this.getArrayItemsPorBaseCategoriaLogicaAppVal("todas", "Sucio");
         if (sysMemoryPwaListaFiltrA4kLogSucio.length === 0){ alert("La Cesta De Puerqueza! ... ! Esta Vaciisimaa. . Clean."); return;}
         // Update Storage Base "a LIMIPO!! A LA COSA"
         for (let ss of sysMemoryPwaListaFiltrA4kLogSucio) { ss.state = "Limpio"; await FlexDB.saveClothItem(ss); }
         
         await this.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB();
         this.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
         alert("Tus basuras perfumadads al fin relucienen!!! 🌈🧺")
    },

    async alterSingularSysPrendMemObjectLogSysValRefUpdateLocalMemoryValIdHookObjV6BIdStoreLRefVarItemF2BLocalFuncUpdateMRefBaseVarVReqResultCDBStoreRefCgIdDbAppEngineIDBRefItemHookDbFuncUpdateA4c2mFlowUpdate(idNumDBIndexLimitReqToEditDB, statTextStringAppNewReqSysTypeDBStateNewSetEngineL) {
         let elObjDBTargetMmoHlLimitItemDBReqIdHkT_Pz5Y2M = STATE.clothes.find( o => o.id === parseInt(idNumDBIndexLimitReqToEditDB)); 
         if(elObjDBTargetMmoHlLimitItemDBReqIdHkT_Pz5Y2M){
             elObjDBTargetMmoHlLimitItemDBReqIdHkT_Pz5Y2M.state = statTextStringAppNewReqSysTypeDBStateNewSetEngineL;
             await FlexDB.saveClothItem(elObjDBTargetMmoHlLimitItemDBReqIdHkT_Pz5Y2M);
             await this.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB();
             this.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
         }
    },
    
    // View Re Render (Central React_Like flow DOM sync engine memory function... One way  Data Sync Vanilla SPA Limit... Very good)
    fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit(){
         
        // ->  Llavandderias Math Engine Counter logic. Required Pairs ! (Minimal Division Array Limits logic... again Minima... required by businsse : Muditas completatas es Min(shirt,sr)! (App Pairs Min Limits!) Rules !..).  Rules Check: "2" alert.. Check Math :
        let ctSF = this.getArrayItemsPorBaseCategoriaLogicaAppVal("franela", "Limpio").length; let ctsSSh = this.getArrayItemsPorBaseCategoriaLogicaAppVal("short", "Limpio").length;
        let cAppEngineResultMuditAAppPairReslPairentA9cGetRMinMMathEngineBaseMathReqResultObjPairs= Math.min(ctSF, ctsSSh);

        // Print pairs: Number in view App: Num String Node text Hook.. :   Limit Math Rules. Visual Number Alert Math Sys Reqe Alert Text 1 vs Many Number string ...
        document.getElementById("mudas-restantes").innerText = cAppEngineResultMuditAAppPairReslPairentA9cGetRMinMMathEngineBaseMathReqResultObjPairs;
        let eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText= document.getElementById("alert-lavanderia");
        if(cAppEngineResultMuditAAppPairReslPairentA9cGetRMinMMathEngineBaseMathReqResultObjPairs <= 1) { 
            eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText.classList.remove("hidden");
            document.getElementById("lavanderia-aviso-txt").innerText = "⚠️ Toca LAVAR URGENTE."; 
            eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText.style.background = "rgba(218,54,51, 0.25)"; 
        }else if(cAppEngineResultMuditAAppPairReslPairentA9cGetRMinMMathEngineBaseMathReqResultObjPairs == 2) {
            eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText.classList.remove("hidden"); document.getElementById("lavanderia-aviso-txt").innerText = "⚠️ OJO!! Se van achicnado  opciiones!... Considera plan.."; 
             eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText.style.background = "rgba(210,153,34,0.15)";
        }else { eAllAlertNUIWarningRedBoxHHTMLTargetDivClassTextVAlColorDOMTargetAlText.classList.add("hidden"); }


        // ->   Grid CLOSET DOM 124 List... DOM HTML STRING GENERATING. ENGINE HTML STRING LOGIC (Vanilla Fast loops Render) Array DOM:  (Template engine). Grid List DOM Nodes !
        document.getElementById("closet-franelas").innerHTML = UI.generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(this.getArrayItemsPorBaseCategoriaLogicaAppVal("franela","all"), false);
        document.getElementById("closet-shorts").innerHTML = UI.generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(this.getArrayItemsPorBaseCategoriaLogicaAppVal("short","all"), false);

        // Lavanederai View .. ! Y Roparaciopna list list html
        document.getElementById("laundry-sucio").innerHTML = UI.generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(this.getArrayItemsPorBaseCategoriaLogicaAppVal("todas", "Sucio"), false) || "No tienes NADA QUE LIMPEAS ! Uff!";
        document.getElementById("laundry-reparacion").innerHTML = UI.generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(this.getArrayItemsPorBaseCategoriaLogicaAppVal("todas", "En Reparación"), false);


        // DASH "ESTS USNA DO!!" Grid Dashboard HOy PUESTO . Use Flex Card App Flow String : UI List Variant Css Hook ! "flex-direction"! Si!!! 
        let listPuesto = this.getArrayItemsPorBaseCategoriaLogicaAppVal("todas", "En Uso");
        document.getElementById("llevas-puesto-grid").innerHTML = listPuesto.length ? UI.generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(listPuesto, true) : `<p style="opacity:0.6;font-size:0.9rem;">Ningun Cambio... Ve prepararlo Aqui 👉 </p>`;

        UI.mostrarUIOpcionesMudaFlujoPwaVisualizarPreparativosPendientesLogicosTFlowUINewStateMemRefZUI78L(); // Reset visual draft si fue conifmraddo se limpaa o se murestrad... depend si  hay draft RAM memory state ... sync .. render pwa memory . Yes !! Vanilla flow.. speed pwa! No network lags... 0 local limits!! Fast Vanilla !! Mobile Flex.   BAM BAM!! The magic

    }
};

/* --- ENCARGADO UI RENDER EVENT LISTENER NODO CONTRLLER. CORE RENDER Y BOTONES MANAER. THE MASTER UX WRAPPER ! ... SENIIOOR LOGCI. BAM !! PWA UX UI Vanilla ! Engine View ---- */
const UI = {
    // String engine : Html 
    generaListaStringArrayGridListFormatAppUITmpGenStrFormatFHTMLNodeLoopDOMMapVarItemCAllCViewA_GReqFlowLimitLogicFuncHtmlLFuncPwaFuncLimitC_7(dataListaArraysMmeoyMapToGenerateArayHTMLLoopVarAppMemItemLoopNodeUIHkTt6vListA , usoCardLayoutRowBoolFormVarDOMTfSysC_73p2aFlow) {
        return dataListaArraysMmeoyMapToGenerateArayHTMLLoopVarAppMemItemLoopNodeUIHkTt6vListA.map( p=> { 
            // Clicl item logci hook inline !! Abre detalles del mismo param.. modall!. Param (ID). Modal engine . (En caso q estes selcciondo del pciekt no. Si estas visualoznaado nomra.) App List ... Func Logic .  App Loggic hook function Pwa UI. Inline click ..
             return `
               <div class="item-card ${usoCardLayoutRowBoolFormVarDOMTfSysC_73p2aFlow?'list-variant':''}" onclick="UI.abirPrendaPropisUIEditarBaseObj(${p.id})">
                  <img src="${p.foto64?p.foto64:''}" />
                  <div class="info">
                      <span class="title">${p.desc}</span>
                      ${!usoCardLayoutRowBoolFormVarDOMTfSysC_73p2aFlow? `<span class="state-badge badge-${p.state}">${p.state==="En Reparación"?"🔧Reparar":p.state==="En Uso"?"⚡En uso":p.state}</span>` :''}
                  </div>
               </div>`
        }).join('');
    },
    // Hook UI render DOM "Slot Pick Menu Preview ". Muaa. Render... !! DOM Element Pwa.. JS UI Limit Ref memory Object To html text img img ! Visual App User Feedback  limit. Flexibity of Pwa limits in view . App rule view visual DOM!! Visual . Text Text DOM img Text node render . Logic render DOM... Render  Ui  React  Flow No dependeny
    mostrarUIOpcionesMudaFlujoPwaVisualizarPreparativosPendientesLogicosTFlowUINewStateMemRefZUI78L(){
          let boxMudaSeletHtmlNodeHViewUIt65BLogTargetTBaseContainerObjElementBViewVarG2lUIBAppContVal= document.getElementById("nueva-seleccion-area");

          if(!STATE.draftMuda.franelaId && !STATE.draftMuda.shortId){  boxMudaSeletHtmlNodeHViewUIt65BLogTargetTBaseContainerObjElementBViewVarG2lUIBAppContVal.classList.add("hidden"); return;}

          boxMudaSeletHtmlNodeHViewUIt65BLogTargetTBaseContainerObjElementBViewVarG2lUIBAppContVal.classList.remove("hidden"); // Se MUEsTra . Draft pending exists.. BAM!!. User  see !! Flex rule active ! Draft exist!!!. Draft app obj mem limits req flex... exist. Pwa .. render 

          // Find nodes target Text nodes Img DOMs limit visual Ui Render target .. UI !! (Memory to UI Text img DOM )! (React flow style but manual... pure vanilla perf !! Perf limits Mobile UX Flow :  Vanilla React ... But Vanilla... Render func sync to obj !) Render ... ! ... Engine pwa speed . Mobile . Web ... 
          let memDraftFraNodeDOMImgLogicDataCStrUI_FValA = STATE.clothes.find( i=> i.id === STATE.draftMuda.franelaId); 
          let memDraftSoortL2RefDBMemArrTargetValI6sCAppVAlCGetHkGetCDataLObject = STATE.clothes.find( i=> i.id === STATE.draftMuda.shortId);
          
          document.getElementById("slot-franela").innerHTML = memDraftFraNodeDOMImgLogicDataCStrUI_FValA ? `<img class="slot-mini-img" src="${memDraftFraNodeDOMImgLogicDataCStrUI_FValA.foto64}"/> ${memDraftFraNodeDOMImgLogicDataCStrUI_FValA.desc}` : 'AÚN NULO';
          document.getElementById("slot-short").innerHTML = memDraftSoortL2RefDBMemArrTargetValI6sCAppVAlCGetHkGetCDataLObject ? `<img class="slot-mini-img" src="${memDraftSoortL2RefDBMemArrTargetValI6sCAppVAlCGetHkGetCDataLObject.foto64}"/> ${memDraftSoortL2RefDBMemArrTargetValI6sCAppVAlCGetHkGetCDataLObject.desc}` : 'AÚN NULO';
    },

    // UI Logis Form MODALS (Adding + Details)  T1 

    abirPrendaPropisUIEditarBaseObj(idDatoSysNodeValueLogicBaseIDTargetBMemArayLogicParamGetNumV_Id6T){
          let objAppB = STATE.clothes.find(e=> e.id === idDatoSysNodeValueLogicBaseIDTargetBMemArayLogicParamGetNumV_Id6T);
          if(!objAppB) return; 

          document.getElementById('edit-img-preview').src = objAppB.foto64;
          document.getElementById('edit-desc-txt').innerText = objAppB.desc + ` [Estado:${objAppB.state}]`;
          
          document.getElementById('edit-state-select').value = objAppB.state === "En Uso"?"Limpio":objAppB.state; // prevent default re setting manual UI .. Uso limit only By ConfirmBtn!! App Pwa Rules 
          
          // attach data id app element PWA memory  hook button id dom prop app  target node attr html set.. : JS app logcc limit .. JS .! Set Id memory param function dom data target app pwa data html save ! .. Atribute .. value hook limit attr ...! Pwa App Data !  Flow.. DOM state ! Render memory : PWA JS Logic
          document.getElementById('btn-save-edit').dataset.appidTargetIdSaveValUIObjMemHk= objAppB.id; 
          document.getElementById('btn-delete-item').dataset.appidTargetIdSaveValUIObjMemHk= objAppB.id; 
          
          document.getElementById("modal-edit").classList.remove("hidden"); // opne mddlal PWA... open . !! Mobile CSS .. PWA .. App Look.. Look !. Native look : Flex pwa Look PWA Modal Pwa Flex Pwa flex PWA rules! Flow UX Mobile... Bam!

    },


    openSelectModal(categorieStrTipoLogicValB2CheckObj) { // Modal Picker list all ! Rules Flexibility !! To put SUciiA !!! o ! LimPIA. "Yo escogo Flex!".. : User Manual Rules ... BAM! BAM .. FLEXIBLE !!! THE PROMP RQUEST IT!! .. SO it HAS ALL 
          document.getElementById('sel-title-cat').innerText = categorieStrTipoLogicValB2CheckObj.toUpperCase();

          let dataTListaArrDOMRendFLocalAllLogicMemArrayBaseAllTypeBaseMemObjValListTargetList = AppLogicEngineFlex.getArrayItemsPorBaseCategoriaLogicaAppVal(categorieStrTipoLogicValB2CheckObj, "all");
          // Format specific action button inlist item inline Func App "Setter": Memory DRAFT STATE SETTER ! ! Set pwa var !! Set ...  Logic Draft state Ram! UI logic ..! Hook func  App Draft pwa Obj Pwa RAM:.. Logic Setter Pwa State draft Pwa... .   
          let stringLisResultStrAppHkUIRenPValRListFormatRenderListStrUUIHtkUTextNodeBAllListStrFormatValA_TAll_VMapNodeListL1A_LoopNodeFormatDataA = dataTListaArrDOMRendFLocalAllLogicMemArrayBaseAllTypeBaseMemObjValListTargetList.map( item=> `
             <div class="item-slot" onclick="UI.seleccionarParaMemoriaDeMudabArr(${item.id}, '${categorieStrTipoLogicValB2CheckObj}')" style="cursor:pointer;">
                <div class="slot-content">
                    <img class="slot-mini-img" src="${item.foto64}"/>
                    <span>${item.desc}  <b class="state-badge badge-${item.state}" style="font-size:0.6rem;">${item.state}</b></span>
                </div>
                <div style="font-size:1.5rem">➡️</div>
             </div>
          `).join('');

          document.getElementById('list-manual-selector').innerHTML = stringLisResultStrAppHkUIRenPValRListFormatRenderListStrUUIHtkUTextNodeBAllListStrFormatValA_TAll_VMapNodeListL1A_LoopNodeFormatDataA || '<em>No Hay Prendas guardas, vas el Armarilo a CREAR +. URG! ! </em>';
          document.getElementById('modal-select-item').classList.remove('hidden');

    },

    seleccionarParaMemoriaDeMudabArr(idnUMLogicSetParamValueParamDraftRam, TypeStrObjRefObjDraftSetFuncCheckAppLogiHookBObj){
         // SET Draft ! .  FLEXIBILITY!!! Set . Hook Func.. .. PWA! App Func 
         if(TypeStrObjRefObjDraftSetFuncCheckAppLogiHookBObj === "franela"){  STATE.draftMuda.franelaId = idnUMLogicSetParamValueParamDraftRam;  }
         else if(TypeStrObjRefObjDraftSetFuncCheckAppLogiHookBObj === "short") { STATE.draftMuda.shortId = idnUMLogicSetParamValueParamDraftRam;  }

         // rernd View AND Cloosse ! BAM.!  Modal App Native Flow. Native .. JS 
         AppLogicEngineFlex.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
         this.closeSelectModal();
    },

    closeSelectModal(){ document.getElementById('modal-select-item').classList.add('hidden'); },

    
    /* -------------------------------------------
     EVENTS SYS DOM CONTROLS LISTNERS REGISTRING. ON LOAD RUN THIS
    ------------------------------------------------ */

    initTabsSysDOMFlowEvH() {

        // TAB NAVBAR ! APP SPA ROUTING MOBILE VIEW "MOBILE TAB BAR!! UX Flow Pattern : Tabs !" React but dom 
        let bbNtabDomHtmlNodelEvAllNodesBViewContRUIQkListHFuncLRef_SysValNavT= document.querySelectorAll('.bottom-nav .nav-btn');
        let cViwTElUIBBContentArraySectionsGetHtmlNLoopA6zSysVLoopValViewRList= document.querySelectorAll('section.view');

        bbNtabDomHtmlNodelEvAllNodesBViewContRUIQkListHFuncLRef_SysValNavT.forEach( b=> {
             b.addEventListener('click', ()=>{
                   bbNtabDomHtmlNodelEvAllNodesBViewContRUIQkListHFuncLRef_SysValNavT.forEach( x => x.classList.remove('active'));
                   cViwTElUIBBContentArraySectionsGetHtmlNLoopA6zSysVLoopValViewRList.forEach( v => v.classList.remove('active'));

                   b.classList.add('active'); 
                   document.getElementById(b.getAttribute("data-tab")).classList.add("active");
             });
        });

        // SUGerior y configmr muda logic! (Main dashboard  actioners). BAM Action!! 
        document.getElementById("btn-sugerir").addEventListener("click", ()=> AppLogicEngineFlex.sugerirAzarMagicoAutoLogica() );
        document.getElementById("btn-confirmar-muda").addEventListener("click", ()=> AppLogicEngineFlex.comfirmDraftSeleccionadaPasosRequiridoConfirmacionLógicaDeMudazaFlexSystemUserHookBaseRefValUIUpdateActionUserL() );
        
        // Cesto Lavar Todos.. Pwa App logic Event . Listener 
        document.getElementById('btn-lavar-todo').addEventListener("click", ()=> AppLogicEngineFlex.massLavarSestoFlowEngineLogicAppArrayLoopStorageSystemDataChangeBaseLocalT90());


        /* --------- MODAL Y GESTORES DE CRETET ADD SYSTEM -------------*/
        let uiBGetOpenDAddMBtnObjFuncSysBtnDReqLAddHValFModalUIMBaseContIdReqBtnUI= document.getElementById('btn-open-add'); 
        let uiMDADGetDivReqHTMLBMODALFUiNodeValBaseUiDomBAppFlowIDObjBaseT82vO= document.getElementById('modal-add'); 

        uiBGetOpenDAddMBtnObjFuncSysBtnDReqLAddHValFModalUIMBaseContIdReqBtnUI.addEventListener('click', ()=>{
              document.getElementById('form-add').reset();
              document.getElementById('preview-canvas').style.display='none'; // clear ctx 
              uiMDADGetDivReqHTMLBMODALFUiNodeValBaseUiDomBAppFlowIDObjBaseT82vO.classList.remove("hidden"); // Muestra Moda. add form !! form open ui!! Form ...! BAM ! Mobile pattern UX Flow! form pwa popup.!  Yes! . 
        });
        
        document.getElementById('btn-cancel-add').addEventListener('click', ()=> uiMDADGetDivReqHTMLBMODALFUiNodeValBaseUiDomBAppFlowIDObjBaseT82vO.classList.add('hidden') );

        document.getElementById("form-add").addEventListener('submit', async (Ev) => {
               Ev.preventDefault();
               
               let strCatLToValReqIdInStrValDataDomVInputNodeCatHValC_PObjTypeSelHkFVaResultTypeDBTargetOBaseReqCatOReqDbSelBaseFlow= document.getElementById('add-category').value;
               let descStPInValPInputHVarDObjTxtDataReqFuncInputStringResAppVDescVToPushToT = document.getElementById('add-desc').value.trim();
               let fotoElementEvFormToEngineBUIHTMLObjObjDOMTInputInputGetElementReqDOMVReqRefNodeDHTMLFileAppToAppCoreDOMFlowFileRefTypeValVTargetFlowFileObjCDataTargetLToFGetMemMemImgGetImgValD= document.getElementById('add-img').files[0];

               // CALL TO MASTER CANVAS! MASTER! 800PX ENGINE !!. Compression magic js Vanilla ... Yes : Returns 0.7  blob JPeEG Text ! : App ! Data Data data String
               let imgDAtabOB_CValH2M= await FileCompressor.processImageToAppBlobStringMemory64SizeDataDBPwaClientAppObjFileInBlobType(fotoElementEvFormToEngineBUIHTMLObjObjDOMTInputInputGetElementReqDOMVReqRefNodeDHTMLFileAppToAppCoreDOMFlowFileRefTypeValVTargetFlowFileObjCDataTargetLToFGetMemMemImgGetImgValD); 
               
               let buildClothesObjBaseLogicVarReqObjMemNewBToStoreForDbEngineReqLogFormatBaseRefStoreMemCoreArrayTObj= {
                    cat: strCatLToValReqIdInStrValDataDomVInputNodeCatHValC_PObjTypeSelHkFVaResultTypeDBTargetOBaseReqCatOReqDbSelBaseFlow,
                    desc: descStPInValPInputHVarDObjTxtDataReqFuncInputStringResAppVDescVToPushToT,
                    state: "Limpio",
                    foto64: imgDAtabOB_CValH2M, 
                    created: Date.now()
               };
               
               // SEND. SAVE! RAM . RE. FLOW !! App! App Magic! UI React View : Yes . Sync Data and View DOM Map UI function . All in one func. Pure Javascript  Speed : No LAG...!! Magic. UX native native Look! 
               await FlexDB.saveClothItem(buildClothesObjBaseLogicVarReqObjMemNewBToStoreForDbEngineReqLogFormatBaseRefStoreMemCoreArrayTObj);
               await AppLogicEngineFlex.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB();
               AppLogicEngineFlex.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
               uiMDADGetDivReqHTMLBMODALFUiNodeValBaseUiDomBAppFlowIDObjBaseT82vO.classList.add("hidden");
        });

        // -- Preview LIVE image Canvas hook before push.. Event Listener `change` in inputs
        document.getElementById('add-img').addEventListener('change', async function() {
            if(this.files && this.files[0]) {
               await FileCompressor.processImageToAppBlobStringMemory64SizeDataDBPwaClientAppObjFileInBlobType(this.files[0]);
            }
        });


        // EDIT Y DEL (CLOSet  Actions form  pwa mobile u ui UX.. mobile Flow!  ! UX React ... Event Clickers !) Action button UI Events App .. App Func Logic DOM ..  Bind func JS!! DOM UI logic pwa Vanilla ) Modaal App.. Logic Bind pwa. Bind pwa!! Events App... 
        let editSysMemBoxModOBoxRefTargetBaseSysVUiBaseMemHTMLHookVarReqSysTObAppBoxElHDivElObjContMdalEditAppMemHTMLHookGetRefUiHlDbQ3ContObjElBoxUiBValBMemQDivGetBOMModalVUiReqAppL3FViewUiAOM_H0UReqCViewModalP_ContDomVal = document.getElementById("modal-edit");
        document.getElementById('btn-cancel-edit').addEventListener("click", ()=> editSysMemBoxModOBoxRefTargetBaseSysVUiBaseMemHTMLHookVarReqSysTObAppBoxElHDivElObjContMdalEditAppMemHTMLHookGetRefUiHlDbQ3ContObjElBoxUiBValBMemQDivGetBOMModalVUiReqAppL3FViewUiAOM_H0UReqCViewModalP_ContDomVal.classList.add("hidden"));
        
        document.getElementById("btn-save-edit").addEventListener('click', async (eBtn)=>{ 
             let _newMStatusDOMSetSStrInputTargetValReqNodeDOMValueGetLogicFlowTypeToPutSysUpdatePDataTargetBaseTextObjVResultDBPResultLogicStringPValUToObjBStrDBTargetReq= document.getElementById('edit-state-select').value;
             let hMemDOMIdNumStringToPassIdLDataTargetBtnLogIdGetAppIdTToAppIdLValPTargetAttrTargetObjP= eBtn.target.dataset.appidTargetIdSaveValUIObjMemHk;

             await AppLogicEngineFlex.alterSingularSysPrendMemObjectLogSysValRefUpdateLocalMemoryValIdHookObjV6BIdStoreLRefVarItemF2BLocalFuncUpdateMRefBaseVarVReqResultCDBStoreRefCgIdDbAppEngineIDBRefItemHookDbFuncUpdateA4c2mFlowUpdate(hMemDOMIdNumStringToPassIdLDataTargetBtnLogIdGetAppIdTToAppIdLValPTargetAttrTargetObjP, _newMStatusDOMSetSStrInputTargetValReqNodeDOMValueGetLogicFlowTypeToPutSysUpdatePDataTargetBaseTextObjVResultDBPResultLogicStringPValUToObjBStrDBTargetReq);
             editSysMemBoxModOBoxRefTargetBaseSysVUiBaseMemHTMLHookVarReqSysTObAppBoxElHDivElObjContMdalEditAppMemHTMLHookGetRefUiHlDbQ3ContObjElBoxUiBValBMemQDivGetBOMModalVUiReqAppL3FViewUiAOM_H0UReqCViewModalP_ContDomVal.classList.add("hidden");
        });

        document.getElementById("btn-delete-item").addEventListener("click", async (bDeEClickHk)=>{
             if(confirm("💥 De verdad tirar tu ropa la basura local?? App Sys Destrutible Func logic limit action UI  Delete?!! Cnfiramss? Si.. Borrar? ")){
                  let iddBaseAppParamNumNumSysPFuncNumDataLReqFuncBParamDeleteLDataStringToT = parseInt(bDeEClickHk.target.dataset.appidTargetIdSaveValUIObjMemHk);
                  await FlexDB.deleteItem(iddBaseAppParamNumNumSysPFuncNumDataLReqFuncBParamDeleteLDataStringToT);
                  await AppLogicEngineFlex.loadAndSyncCoreMemoryArrayRAMStorageBufferDataPullAppLogicEngineFlowToUseFromIDB(); AppLogicEngineFlex.fullRefreshUIDomsRenderFlowAppSyncIDBVarCoreUIFlowPwaViewSysLogicLimit();
                  editSysMemBoxModOBoxRefTargetBaseSysVUiBaseMemHTMLHookVarReqSysTObAppBoxElHDivElObjContMdalEditAppMemHTMLHookGetRefUiHlDbQ3ContObjElBoxUiBValBMemQDivGetBOMModalVUiReqAppL3FViewUiAOM_H0UReqCViewModalP_ContDomVal.classList.add("hidden");
             }
        })
    }
}


/* START APP WINDOW SPA NATIVE RUN FIRE ENGINE: */
document.addEventListener("DOMContentLoaded", () => AppLogicEngineFlex.startPwaRun() );
