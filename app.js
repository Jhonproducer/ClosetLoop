/* =======================================================
 * Lógica Completa PWA VanillaJS - My Daily Outfit 
 * Full Stack Local Logic via HTML5 IndexedDB Storage
 * ======================================================= */

const CONSTANTS = {
    DB_NAME: "OutfitDB",
    DB_VER: 1,
    TABLE_CLOTHES: "clothes",    // Donde viviran Franelas y Shorts
    TABLE_SYSTEM: "sysparams",   // Metadata interna de control de ciclos y 6:00PM limit
    CYCLE_HOUR: 18 // 18:00 (6 PM) Horario dictado para que prendas ensucien automatiamente
};

// Data base Default (si está limpio el IDB pre-llenaremos esto usando tus directivas visuales sin imágen real)
const DEFAULT_INVENTORY = [
    { type: 'franela', desc: 'Franela Blanca Base', color: '#eeeeee', state: 'Limpio', timestamp: Date.now() },
    { type: 'franela', desc: 'Franela Urbana Negra', color: '#151515', state: 'Limpio', timestamp: Date.now() },
    { type: 'franela', desc: 'Polo Deportiva Azul', color: '#0066FF', state: 'Limpio', timestamp: Date.now() },
    { type: 'short', desc: 'Short Playa Verde', color: '#00cc66', state: 'Limpio', timestamp: Date.now() },
    { type: 'short', desc: 'Short Running Gris', color: '#444444', state: 'Limpio', timestamp: Date.now() },
    { type: 'short', desc: 'Jean Roto Short', color: '#3A5A82', state: 'Limpio', timestamp: Date.now() }
];

/* ---------------------------------------------------
 *   IndexedDB - Clase/Driver envoltorio Senior LocalStorage killer
 * --------------------------------------------------- */
const DBClient = {
    db: null,

    // Conectar y preparar base (o instalar primera vez)
    async connect() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONSTANTS.DB_NAME, CONSTANTS.DB_VER);
            
            // OnUpgrade se dispara si DB no existe, construímos su arquitectura PWA aquí
            request.onupgradeneeded = (e) => {
                const _db = e.target.result;
                
                // Store Ropa: { id_incremental, type, desc, color, state: "Limpio|Sucio|En Reparación|En Uso"}
                if(!_db.objectStoreNames.contains(CONSTANTS.TABLE_CLOTHES)){
                    let clothesOS = _db.createObjectStore(CONSTANTS.TABLE_CLOTHES, { keyPath: "id", autoIncrement: true });
                    clothesOS.createIndex("state", "state", { unique: false }); // Indexamos estado para busqueda rápida de Limpios
                }
                
                // Store sistema/params configurables offline como tokens para guardar cuando pasen las 6pm.
                if(!_db.objectStoreNames.contains(CONSTANTS.TABLE_SYSTEM)){
                    _db.createObjectStore(CONSTANTS.TABLE_SYSTEM, { keyPath: "key" });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject("DB Connection fallida. El navegador rechaza local storage por settings estrictos.");
        });
    },

    // Inyecta defaults (la 'API Post')
    async putCloth(item) {
        return new Promise((resolve) => {
            const trx = this.db.transaction(CONSTANTS.TABLE_CLOTHES, "readwrite");
            const store = trx.objectStore(CONSTANTS.TABLE_CLOTHES);
            const req = store.put(item); // insert o replace según key (id autogenerado local)
            req.onsuccess = () => resolve(req.result); // devuelve newID
        });
    },
    
    // Lista todas prendas, es rapida, asi es IDB Client Side Vanilla
    async getAllClothes() {
        return new Promise((resolve) => {
            const store = this.db.transaction(CONSTANTS.TABLE_CLOTHES, "readonly").objectStore(CONSTANTS.TABLE_CLOTHES);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    },

    async updateMultipleStates(idList, newState) {
        const clothes = await this.getAllClothes();
        const trx = this.db.transaction(CONSTANTS.TABLE_CLOTHES, "readwrite");
        const store = trx.objectStore(CONSTANTS.TABLE_CLOTHES);
        
        idList.forEach(id => {
            const it = clothes.find(c => c.id === id);
            if (it) {
                it.state = newState;
                store.put(it);
            }
        });
        
        return new Promise(resolve => trx.oncomplete = () => resolve());
    },
    
    // Obten config token global (Promise API Wrapper for internal data sys config local token system...)
    async getSysVal(keyName) {
         return new Promise((resolve) => {
            const req = this.db.transaction(CONSTANTS.TABLE_SYSTEM, "readonly").objectStore(CONSTANTS.TABLE_SYSTEM).get(keyName);
            req.onsuccess = () => resolve(req.result ? req.result.value : null);
         });
    },
    
    async setSysVal(keyName, val) {
         return new Promise((resolve) => {
            const store = this.db.transaction(CONSTANTS.TABLE_SYSTEM, "readwrite").objectStore(CONSTANTS.TABLE_SYSTEM);
            store.put({ key: keyName, value: val });
            store.transaction.oncomplete = () => resolve();
         });
    }
};

/* ---------------------------------------------------
 *   Engine: Reglas y Estado "Aplication Core Logics"
 * --------------------------------------------------- */
const AppCore = {
    // Array in-memory Cache tras arrancar SPA
    items: [],

    async boot() {
        await DBClient.connect();
        
        this.items = await DBClient.getAllClothes();
        // Carga Defaults la PRIMERA VEZ
        if (this.items.length === 0) {
            for (let defaultData of DEFAULT_INVENTORY) {
                await DBClient.putCloth(defaultData);
            }
            this.items = await DBClient.getAllClothes();
        }

        // Loop Constante Tiempo Y Revisión Regla Limite "Treshold Cycle". Corre cada carga + repeticion minutaria (SetInterval global abajo).
        await this.run18PMThresholdCheck();

        // Enceder App Visuals Reactivas
        UIControls.initEvents();
        this.renderAllPanels();
    },

    // 🔴 6:00 PM LIMIT - EL CENTRO NERVIOSO LOGICO. "Yo me cambio a las 6" y es ciclo.
    // Retorna timestamp ancla del ciclo valiente más cercano antes a HOY y lo cruza para trigger de acción
    getCycleAnchorStamp(checkDate = new Date()) {
        const _dateCopy = new Date(checkDate);
        if (_dateCopy.getHours() >= CONSTANTS.CYCLE_HOUR) {
             // El umbral se abrió hoy a las 6:00pm. Todo seleccionado HOY DESPUES de esa hora forma del dia "actual cycle".
             _dateCopy.setHours(CONSTANTS.CYCLE_HOUR, 0, 0, 0); 
        } else {
             // Es antes de las 6PM hoy. Estamos montados aún en "la guagua y fecha" que inició en Ayer. Ayer cuenta.
             _dateCopy.setDate(_dateCopy.getDate() - 1);
             _dateCopy.setHours(CONSTANTS.CYCLE_HOUR, 0, 0, 0); 
        }
        return _dateCopy.getTime();
    },

    async run18PMThresholdCheck() {
        // ¿Cuál es el ultimo chequeo de sistema histórico? Si se quedó atrazada se ensuciaran tras el cálculo de las líneas a la inversa con time...
        let lastKnownCheckedCycleTimeStamp = await DBClient.getSysVal('last_completed_cycle');
        let currentRealCycleTimeStamp = this.getCycleAnchorStamp(new Date());

        // Update reloj de vista... UI Time clock Header... no pesa. Simple DOM Node override de string literal...  17:34 por decir:
        document.getElementById('clock-display').innerText = new Date().toLocaleTimeString('es', {hour: '2-digit', minute:'2-digit'});

        if (!lastKnownCheckedCycleTimeStamp) {
            // Recién arrancada primera de primeras.. no forzamos nada aún solo seteamos inicio
            await DBClient.setSysVal('last_completed_cycle', currentRealCycleTimeStamp);
            return;
        }

        // PASARON LAS 6 - ¡HACER REPLICA MAGICA DIRTY CICLE OFF !
        if (currentRealCycleTimeStamp > lastKnownCheckedCycleTimeStamp) {
            
            let enUsoArrayNow = this.items.filter(i => i.state === 'En Uso');
            
            if(enUsoArrayNow.length > 0) {
                // Hay gente que madurar a sucia por ciclo completado de las manillas del dios tiempo
                await DBClient.updateMultipleStates(enUsoArrayNow.map(o => o.id), "Sucio");
                
                // Pop Alarm Graphic to User PWA Screen... Han Dado Las 6!! 
                document.getElementById('modal-6pm').classList.remove('hidden');
            }
            // Se actualizó check limit: No procesará hasta las prx 18Hrs. Magia!
            await DBClient.setSysVal('last_completed_cycle', currentRealCycleTimeStamp); 
            // Update cache array DB PULL local! (sync PWA SPA view again since state change en-DB )
            this.items = await DBClient.getAllClothes();
            this.renderAllPanels();
        }
    },

    // FUNCIONES UI ACTION TRIGGER //

    async suggestOutfit() {
        const limpiosF = this.items.filter(i => i.type === 'franela' && i.state === 'Limpio');
        const limpiosS = this.items.filter(i => i.type === 'short' && i.state === 'Limpio');
        
        if(limpiosF.length === 0 || limpiosS.length === 0) {
            alert('❌ ¡Necesitas al menos 1 franela limpia y 1 short limpio para tener outfit! Lava primero.'); return;
        }

        // Return al Closet si estabas en uno y estas reemplazándolo manualmente (sobre-escribiendo manualmente el set current actual sin esperar). En un sistema complejo pasa todo por lavadoras pero asumo si cambio a pulgar antes del horario se equivoco. Lo volvemos 'Limpio'.
        const actualSet = this.items.filter(i => i.state === 'En Uso');
        await DBClient.updateMultipleStates(actualSet.map(i=>i.id), "Limpio");
        
        const randomF = limpiosF[Math.floor(Math.random() * limpiosF.length)];
        const randomS = limpiosS[Math.floor(Math.random() * limpiosS.length)];
        
        // Colocar new set A: Uso Current state DB indexdb Save ... and array actual update! PWA Logic in JS Only! Yes.. So fun... no network
        await DBClient.updateMultipleStates([randomF.id, randomS.id], "En Uso");
        this.items = await DBClient.getAllClothes(); // Sync 100
        
        document.getElementById('modal-6pm').classList.add('hidden'); // cerra alerta de forzado si venimos clickand de modal limite 6pm trigger alert "Ya vístete!!" modal action hook en botón  ...  Pum
        
        this.renderAllPanels();
    },

    async lavadoraCestoMass() {
        const suciosIdList = this.items.filter(i => i.state === 'Sucio').map(s=>s.id);
        if(suciosIdList.length > 0) {
             await DBClient.updateMultipleStates(suciosIdList, 'Limpio');
             this.items = await DBClient.getAllClothes();
             this.renderAllPanels();
        }
    },

    async moveItemState(id, newState) {
        await DBClient.updateMultipleStates([id], newState);
        this.items = await DBClient.getAllClothes();
        this.renderAllPanels();
    },

    async addLocalPiece(desc, type, colorHex) {
        const prendaCleanObjetoIDBLifeNewItemTemplateFormAddedFromDomObjcetUserSpaceCreatedAndApprovedForIdBServerPushSaveDataFormatLiteralInCodeLikeRequestedForDescriptionApproachModelArchitecture = { 
           desc, type, color: colorHex, state: 'Limpio', timestamp: Date.now() 
        }; // Uff the text description model is super reliable. Clean 
        await DBClient.putCloth(prendaCleanObjetoIDBLifeNewItemTemplateFormAddedFromDomObjcetUserSpaceCreatedAndApprovedForIdBServerPushSaveDataFormatLiteralInCodeLikeRequestedForDescriptionApproachModelArchitecture);
        this.items = await DBClient.getAllClothes(); // re feed arr buffer...
        this.renderAllPanels();
    },


    /* --------- MOTOR RENDER RE-FLOW ENGINE ----------------- */
    
    // helper html string gen loop
    generateUIHTMLCard(clothData) {
        const { id, type, desc, color, state } = clothData;
        const iconTypeMapTypeHtmlIconsIconEmojiSysLogicStringLiteralInjectFormatEngineVarConstMapRenderUIStringPwaGenBlock = type === 'franela' ? '👕' : '🩳';
        let actionHTMLRenderActionsSysUiPwaStringDOMGeneratNodeStrLogic = ``;

        // Genera acciones con context actions per card por state: Si es limpia permitira Dañar en uso al reparar list! "Taller.. oh se me ropio una boton".. "A Taller".. (A mi franela me lo ropio el pitbull jaja!) ok ... asi.
        if (state === 'Limpio') { 
            actionHTMLRenderActionsSysUiPwaStringDOMGeneratNodeStrLogic = `<button class="btn-sm-repair" onclick="AppCore.moveItemState(${id}, 'En Reparación')">❌ Reparar</button>`; 
        } 
        else if (state === 'En Reparación') {
            actionHTMLRenderActionsSysUiPwaStringDOMGeneratNodeStrLogic = `<button class="btn-sm-fix" onclick="AppCore.moveItemState(${id}, 'Limpio')">✅ ¡Ya regresó!</button>`; 
        } 
        else if (state === 'Sucio') { 
             actionHTMLRenderActionsSysUiPwaStringDOMGeneratNodeStrLogic = `<span style="font-size:0.8rem">🧺 Al cesto!</span>`;
        }

        return `
            <div class="cloth-card">
               <div class="cloth-info">
                   <!-- El SWATCH del que te hable q reemplazaba foto redimiensonada... mira es este el que inyectamos css custom attr string!! Color selector logic local approach visual!   ... -> No se requiere HTMLCanvas! -->
                   <div class="cloth-color-swatch" style="background-color: ${color}"></div>
                   <div class="cloth-meta">
                        <h4>${iconTypeMapTypeHtmlIconsIconEmojiSysLogicStringLiteralInjectFormatEngineVarConstMapRenderUIStringPwaGenBlock} ${desc}</h4>
                        <span style="color:${state === 'Limpio'? 'var(--neon-green)': 'var(--text-secondary)'}">${state}</span>
                   </div>
               </div>
               <div class="cloth-actions">${actionHTMLRenderActionsSysUiPwaStringDOMGeneratNodeStrLogic}</div>
            </div>
        `;
    },

    renderAllPanels() {
        // Separa Buffer states y listas de vista DOM. Esto en memoria array Cache para rapid access JS execution loops.. IndexedDb Pasa un Array! filter simple logic! Todo 1 solo hilo y muy estable SPA!! Mobile! Si!

        // [ALARM SYSTEM LAUNDRY MATH MINIMA FUN] Logica Negocio: min ropa limpios! < 2 = Alert. Yes, exact math req. (Pairs Logic Limit Sys). Yes Boss 
        const cntFranelasLimpiaLimpiezaValReqValLenLenTotalArrLogicVarLenGetTFromLenDataMemVarValGetCountLogic = this.items.filter(i=>i.type==='franela'&&i.state==='Limpio').length;
        const cntShortsLimpiaVarLengthPushedL = this.items.filter(i=>i.type==='short'&&i.state==='Limpio').length;
        
        // Pairs! El outfit consiste min: 1 fr + 1 sr!! Limitador! Combinable! Total Max = minimo comun divisor total Math Limit: MInimal Val en Array Pairs Valid Array count (Math Logic App Minima! The requriments "1x Franla 1xshort = 1 Set Outfit..  Val  menor a dos mudas!!!
        const minConjuntosPairCountValueValToRenderUiView = Math.min(cntFranelasLimpiaLimpiezaValReqValLenLenTotalArrLogicVarLenGetTFromLenDataMemVarValGetCountLogic, cntShortsLimpiaVarLengthPushedL); 

        // Update Text Dom Num
        document.getElementById('clean-sets-count').innerText = minConjuntosPairCountValueValToRenderUiView;

        if (minConjuntosPairCountValueValToRenderUiView < 2) { document.getElementById('urgent-alert').classList.remove('hidden'); } 
        else { document.getElementById('urgent-alert').classList.add('hidden'); }


        // PANELS FILL & WIPE PRE RE REDER (Vanilla JS App-Render LifeCycles Hook Manual Override Function Node Pwa Set View Array loop html Join Inyction String.. Yes ... Vanilla!)

        // Panel Hoy... Loop for use: .. find array with Uso Flag
        let currentArrayToRenderUiNowUseLimitStateAppRenderEngineLogicDOMRenderFunctionObjHtml = this.items.filter(i=> i.state === 'En Uso');
        if(currentArrayToRenderUiNowUseLimitStateAppRenderEngineLogicDOMRenderFunctionObjHtml.length === 0){
             document.getElementById('current-outfit').innerHTML = '<p class="no-data">Desnudo/a. Pulsa "Sugerir Outfit" 👇🏼.</p>';
        } else {
             document.getElementById('current-outfit').innerHTML = `<div class="combo">` + currentArrayToRenderUiNowUseLimitStateAppRenderEngineLogicDOMRenderFunctionObjHtml.map(pwaClothStr=> `<div class="combo-item"><div class="cloth-color-swatch" style="background-color:${pwaClothStr.color}"></div> ${pwaClothStr.desc}</div>`).join('') + `</div>`;
        }
        
        // Puntos Lista Clean ARMARIO  DOM render list HTML Gen join Inject  .. Si!!
        document.getElementById('clean-list').innerHTML = this.items.filter(x => x.state === 'Limpio').map(cl => this.generateUIHTMLCard(cl)).join('') || '<em>Vacío.. Lava y saca lo que hay..</em>';

        // Puntos List Sucio y TallerDOM  Render  UI .. Cesto 
        document.getElementById('dirty-list').innerHTML = this.items.filter(x => x.state === 'Sucio').map(cl => this.generateUIHTMLCard(cl)).join('') || '<em>Cesto perfecamente reluciente (No hay ropa)✨</em>';
        document.getElementById('repair-list').innerHTML = this.items.filter(x => x.state === 'En Reparación').map(cl => this.generateUIHTMLCard(cl)).join('') || '<em>Sin nada a componer o mandar costura👍</em>';

    }
};

/* ---------------------------------------------------
 *  Interacciones DOM (Tab Bar SPA Nav / Form Events) PWA Controls Events Binding App Sys Local Browser Limit Vanilla Hook Sys Ev.
 * --------------------------------------------------- */
const UIControls = {
    initEvents() {
        
        // Tab system Navigate Bottom Logic Pwa Tabs Native iOS Native Look & App logic Native Feeling
        document.querySelectorAll('.bottom-nav .nav-item').forEach(itemBtn => {
             itemBtn.addEventListener('click', () => {
                 document.querySelectorAll('.bottom-nav .nav-item').forEach(i=> i.classList.remove('active'));
                 itemBtn.classList.add('active');
                 
                 document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
                 document.getElementById(itemBtn.getAttribute('data-target')).classList.add('active');
             });
        });

        // 6PM "Te Ensuciaste Compa" modal - Action For Select A Suggest Btn ! Logic. Select! Bam
        document.getElementById('btn-close-6pm').addEventListener('click', async () => {
            await AppCore.suggestOutfit(); 
            // modal is hiddn with suggesting override local view control view render function flow action override trigger. BAM. Yes Senior limit!
        });

        // Event listener button main "Sugier Outfit "
        document.getElementById('btn-suggest').addEventListener('click', () => AppCore.suggestOutfit() );

        // Event listener botón PWA "lavame mi basuero " 
        document.getElementById('btn-wash-all').addEventListener('click', () => AppCore.lavadoraCestoMass() );

        // Insert new object UI Event (prevent defalt, push string text format Pwa Limit) "ACA NO SUBE CANVAS. Y ESTA BN! Asi como pidio..." . Desc color. Bam. IndexedDB guard local limit  - no img - Text and C - 
        document.getElementById('form-add').addEventListener('submit', async (evnTriggerControlAppSubmit) => {
             evnTriggerControlAppSubmit.preventDefault();
             let iptDesValTargetRefUIHTMLFormDescIdbSaveLimitReq = document.getElementById('input-desc').value.trim();
             let iptTypeId = document.getElementById('input-type').value;
             let colIdVarV = document.getElementById('input-color').value;

             if(!iptDesValTargetRefUIHTMLFormDescIdbSaveLimitReq) return;
             
             await AppCore.addLocalPiece(iptDesValTargetRefUIHTMLFormDescIdbSaveLimitReq, iptTypeId, colIdVarV);

             // Resetr visual UX limit app render func! Clear.. (keep color and Type is ok visual user repeat input save times! Mobile UX pattern speed.)
             document.getElementById('input-desc').value = ""; 
        });

        // Clock check Interval logic
        setInterval(() => {
             AppCore.run18PMThresholdCheck(); // Ticks Every Min.. checks if clock pass 18.. will pop it on realtime native offline... Super offline!! Wow.. Indexed DB Power.!  Told U JS limits .. Are Not. App...  So ... Yes Limit 1 min
        }, 60000); 

    }
}


// Arranque Oficial SPA PWA! Wait dom render y dispara Base logicas index DB de App Core
window.addEventListener('DOMContentLoaded', () => { AppCore.boot(); });
