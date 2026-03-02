let inventario = JSON.parse(localStorage.getItem('ropa_guardada')) || [];
let outfitSugerido = { superior: null, inferior: null };

window.onload = () => {
    actualizarPantalla();
};

function actualizarPantalla() {
    generarSugerencia();
    verificarLavado();
    renderInventario('superior');
}

function generarSugerencia() {
    let limpiosSuperior = inventario.filter(p => p.tipo === 'superior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));
    let limpiosInferior = inventario.filter(p => p.tipo === 'inferior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));

    limpiosSuperior.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);
    limpiosInferior.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);

    outfitSugerido.superior = limpiosSuperior[0] || null;
    outfitSugerido.inferior = limpiosInferior[0] || null;

    document.getElementById('sugerencia-superior').innerHTML = outfitSugerido.superior 
        ? `<img src="${outfitSugerido.superior.foto}" width="100" style="border-radius:10px;"><br><strong>${outfitSugerido.superior.nombre}</strong>` 
        : "No hay franelas listas";
        
    document.getElementById('sugerencia-inferior').innerHTML = outfitSugerido.inferior 
        ? `<img src="${outfitSugerido.inferior.foto}" width="100" style="border-radius:10px;"><br><strong>${outfitSugerido.inferior.nombre}</strong>` 
        : "No hay shorts listos";
}

function confirmarUso() {
    if (!outfitSugerido.superior || !outfitSugerido.inferior) {
        alert("Falta ropa para armar el outfit completo."); return;
    }
    inventario.forEach(p => { if (p.estado === 'en_uso') p.estado = 'sucio'; });
    outfitSugerido.superior.estado = 'en_uso'; outfitSugerido.superior.usos += 1;
    outfitSugerido.inferior.estado = 'en_uso'; outfitSugerido.inferior.usos += 1;
    guardarDatos();
    alert("¡Registrado! Nos vemos a las 6 PM.");
    actualizarPantalla();
}

function marcarSemiSucio() {
    let inferiorEnUso = inventario.find(p => p.tipo === 'inferior' && p.estado === 'en_uso');
    if (inferiorEnUso) {
        inferiorEnUso.estado = 'semi_sucio'; guardarDatos();
        alert("Pantalón marcado para repetir mañana."); actualizarPantalla();
    } else {
        alert("No hay ningún short en uso ahora.");
    }
}

function verificarLavado() {
    let limpios = inventario.filter(p => p.estado === 'limpio').length;
    let alerta = document.getElementById('lavado-alert');
    limpios <= 4 ? alerta.classList.remove('hidden') : alerta.classList.add('hidden');
}

function abrirModal() { document.getElementById('modal').classList.remove('hidden'); }
function cerrarModal() { document.getElementById('modal').classList.add('hidden'); }

// --- EL ARREGLO: COMPRESOR DE IMÁGENES ---
function guardarPrenda() {
    let nombre = document.getElementById('nombre-prenda').value;
    let tipo = document.getElementById('tipo-prenda').value;
    let archivoFoto = document.getElementById('foto-prenda').files[0];

    if (!nombre || !archivoFoto) { alert("Ponle nombre y sube una foto."); return; }

    let reader = new FileReader();
    reader.onload = function(e) {
        let img = new Image();
        img.onload = function() {
            // Creamos un lienzo para achicar la foto
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let maxWidth = 400; // Tamaño máximo
            let scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;
            
            // Dibujamos y comprimimos la imagen
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            let fotoComprimida = canvas.toDataURL('image/jpeg', 0.6); // 60% de calidad

            let nuevaPrenda = {
                id: Date.now(), nombre: nombre, tipo: tipo,
                foto: fotoComprimida, estado: 'limpio', usos: 0
            };
            inventario.push(nuevaPrenda);
            guardarDatos();
            cerrarModal();
            document.getElementById('nombre-prenda').value = ''; // Limpiar el input
            actualizarPantalla();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(archivoFoto);
}

// --- SISTEMA DE INVENTARIO Y REPARACIÓN ---
function renderInventario(tipoFiltro) {
    let contenedor = document.getElementById('lista-ropa');
    contenedor.innerHTML = '';
    let filtrados = inventario.filter(p => p.tipo === tipoFiltro);
    
    filtrados.forEach(p => {
        let div = document.createElement('div');
        div.className = 'card';
        
        let botonesHTML = '';
        if (p.estado === 'en_reparacion') {
            botonesHTML = `<button class="btn-primary" onclick="volverDeReparacion(${p.id})">🔙 Volvió de costura</button>`;
        } else {
            botonesHTML = `
                <button class="btn-danger" onclick="mandarALavar(${p.id})">🧺 Al Cesto</button>
                <button class="btn-secondary" onclick="mandarAReparar(${p.id})">🪡 Reparar</button>
            `;
        }

        let estadoVisual = p.estado;
        if (p.estado === 'en_reparacion') estadoVisual = '🛠️ En Reparación';
        if (p.estado === 'limpio') estadoVisual = '✨ Limpio';
        if (p.estado === 'sucio') estadoVisual = '🧺 Sucio';
        if (p.estado === 'semi_sucio') estadoVisual = '♻️ Repetible';
        if (p.estado === 'en_uso') estadoVisual = '👕 Usando Hoy';

        div.innerHTML = `
            <img src="${p.foto}" width="100%" style="border-radius:10px; height: 180px; object-fit: cover;">
            <p style="margin: 10px 0;"><strong>${p.nombre}</strong></p>
            <p style="font-size: 0.9em; margin: 5px 0;">Usos: ${p.usos} | <strong>${estadoVisual}</strong></p>
            <div style="display: flex; gap: 5px; margin-top: 10px;">${botonesHTML}</div>
        `;
        contenedor.appendChild(div);
    });
}

function filtrar(tipo) { renderInventario(tipo); }
function mandarALavar(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'sucio'; guardarDatos(); actualizarPantalla(); }
function mandarAReparar(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'en_reparacion'; guardarDatos(); actualizarPantalla(); }
function volverDeReparacion(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'limpio'; guardarDatos(); actualizarPantalla(); }
function guardarDatos() { localStorage.setItem('ropa_guardada', JSON.stringify(inventario)); }
