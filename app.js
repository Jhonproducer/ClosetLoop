let inventario = [];
let pestanaActiva = 'limpio';

// INICIO DE LA APLICACIÓN (Con Base de Datos Real)
window.onload = async () => {
    // localforage reemplaza al localStorage que se colgaba
    let datosGuardados = await localforage.getItem('bd_rotaropa');
    if (datosGuardados) { inventario = datosGuardados; }
    actualizarPantalla();
};

async function guardarDatos() {
    await localforage.setItem('bd_rotaropa', inventario);
}

function actualizarPantalla() {
    renderOutfitActual();
    renderOutfitSugerido();
    renderInventario();
    revisarCesto();
}

// ==========================================
// LÓGICA DE LA DUCHA (EL CICLO DIARIO)
// ==========================================
function meVoyABanar(repetirShort) {
    let franelaActual = inventario.find(p => p.estado === 'puesto' && p.tipo === 'superior');
    let shortActual = inventario.find(p => p.estado === 'puesto' && p.tipo === 'inferior');

    let sugerencia = obtenerSugerencia();
    if (!sugerencia.superior) { alert("¡No tienes franelas limpias para cambiarte!"); return; }

    // 1. Lo que teníamos puesto se va al cesto (o se repite)
    if (franelaActual) franelaActual.estado = 'sucio';
    
    if (shortActual) {
        if (repetirShort) {
            shortActual.estado = 'puesto'; // Se queda puesto
        } else {
            shortActual.estado = 'sucio'; // Se va al cesto
        }
    }

    // 2. Nos ponemos la ropa nueva sugerida
    sugerencia.superior.estado = 'puesto';
    sugerencia.superior.usos += 1; // Sumamos un uso histórico

    if (!repetirShort && sugerencia.inferior) {
        sugerencia.inferior.estado = 'puesto';
        sugerencia.inferior.usos += 1;
    }

    guardarDatos();
    actualizarPantalla();
    alert(repetirShort ? "¡Listo! Franela al cesto. Repites short." : "¡Muda completa al cesto! Te pusiste lo nuevo.");
}

function obtenerSugerencia() {
    let limpios = inventario.filter(p => p.estado === 'limpio');
    
    // Ordenar por prendas que MENOS usos tienen (para ahorrar tela)
    let supLimpios = limpios.filter(p => p.tipo === 'superior').sort((a, b) => a.usos - b.usos);
    let infLimpios = limpios.filter(p => p.tipo === 'inferior').sort((a, b) => a.usos - b.usos);

    return { superior: supLimpios[0] || null, inferior: infLimpios[0] || null };
}

// ==========================================
// DIBUJAR EN PANTALLA
// ==========================================
function renderOutfitActual() {
    let franela = inventario.find(p => p.estado === 'puesto' && p.tipo === 'superior');
    let short = inventario.find(p => p.estado === 'puesto' && p.tipo === 'inferior');

    document.getElementById('outfit-actual').innerHTML = `
        <div class="prenda-card">
            ${franela ? `<img src="${franela.foto}"><p>${franela.nombre}</p>` : `<div style="height:130px; line-height:130px; background:#111; border-radius:8px;">Sin franela</div>`}
        </div>
        <div class="prenda-card">
            ${short ? `<img src="${short.foto}"><p>${short.nombre}</p>` : `<div style="height:130px; line-height:130px; background:#111; border-radius:8px;">Sin short</div>`}
        </div>
    `;
}

function renderOutfitSugerido() {
    let sugerencia = obtenerSugerencia();
    
    document.getElementById('outfit-sugerido').innerHTML = `
        <div class="prenda-card" style="border: 2px dashed var(--primary);">
            ${sugerencia.superior ? `<span class="badge-usos">${sugerencia.superior.usos} usos</span><img src="${sugerencia.superior.foto}"><p>${sugerencia.superior.nombre}</p>` : `<p style="margin-top:50px">Nada limpio</p>`}
        </div>
        <div class="prenda-card" style="border: 2px dashed var(--primary);">
            ${sugerencia.inferior ? `<span class="badge-usos">${sugerencia.inferior.usos} usos</span><img src="${sugerencia.inferior.foto}"><p>${sugerencia.inferior.nombre}</p>` : `<p style="margin-top:50px">Nada limpio</p>`}
        </div>
    `;
}

function revisarCesto() {
    let sucios = inventario.filter(p => p.estado === 'sucio').length;
    let limpios = inventario.filter(p => p.estado === 'limpio').length;
    let alerta = document.getElementById('estado-cesto');

    if (limpios <= 2 && inventario.length > 0) {
        alerta.innerHTML = `⚠️ ¡LAVA HOY! Solo te quedan ${limpios} prendas limpias. Tienes ${sucios} en el cesto.`;
        alerta.className = 'alerta-cesto urgente';
    } else {
        alerta.innerHTML = `🧺 Cesto: ${sucios} prendas sucias`;
        alerta.className = 'alerta-cesto normal';
    }
}

// ==========================================
// INVENTARIO Y CESTO
// ==========================================
function verPestana(tipo) {
    pestanaActiva = tipo;
    document.getElementById('tab-limpio').className = tipo === 'limpio' ? 'active' : '';
    document.getElementById('tab-sucio').className = tipo === 'sucio' ? 'active' : '';
    renderInventario();
}

function renderInventario() {
    let contenedor = document.getElementById('lista-ropa');
    contenedor.innerHTML = '';
    
    let prendas = inventario.filter(p => p.estado === pestanaActiva);

    if (pestanaActiva === 'sucio' && prendas.length > 0) {
        contenedor.innerHTML = `<button class="btn-lavar-todo" onclick="lavarTodo()">🧼 Ya lavé todo el cesto (Pasar a limpio)</button>`;
    }

    prendas.forEach(p => {
        contenedor.innerHTML += `
            <div class="prenda-card">
                <span class="badge-usos">Usado ${p.usos}x</span>
                <img src="${p.foto}">
                <p title="${p.nombre}">${p.nombre}</p>
                <button class="btn-borrar" onclick="eliminarPrenda(${p.id})">🗑️ Borrar</button>
            </div>
        `;
    });
}

function lavarTodo() {
    inventario.forEach(p => { if (p.estado === 'sucio') p.estado = 'limpio'; });
    guardarDatos(); actualizarPantalla();
}

function eliminarPrenda(id) {
    if(confirm("¿Borrar esta prenda definitivamente?")) {
        inventario = inventario.filter(p => p.id !== id);
        guardarDatos(); actualizarPantalla();
    }
}

// ==========================================
// GUARDAR FOTOS SIN QUE SE CUELGUE EL CELULAR
// ==========================================
function abrirModal() { document.getElementById('modal').classList.remove('hidden'); }
function cerrarModal() { document.getElementById('modal').classList.add('hidden'); }

function guardarPrenda() {
    let nombre = document.getElementById('nombre-prenda').value;
    let tipo = document.getElementById('tipo-prenda').value;
    let archivoFoto = document.getElementById('foto-prenda').files[0];

    if (!nombre || !archivoFoto) { alert("Por favor ponle un nombre corto y sube una foto."); return; }

    let reader = new FileReader();
    reader.onload = function(e) {
        let img = new Image();
        img.onload = function() {
            // Achicamos la foto internamente para que la app vuele de rápido
            let canvas = document.createElement('canvas'); let ctx = canvas.getContext('2d');
            let maxW = 500; let scale = maxW / img.width; 
            canvas.width = maxW; canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            let fotoOptimizada = canvas.toDataURL('image/jpeg', 0.7); 

            // Se guarda como 'limpio' por defecto
            inventario.push({ id: Date.now(), nombre: nombre, tipo: tipo, foto: fotoOptimizada, estado: 'limpio', usos: 0 });
            
            guardarDatos(); 
            document.getElementById('nombre-prenda').value = ''; 
            cerrarModal(); 
            actualizarPantalla();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(archivoFoto);
}
