let inventario = JSON.parse(localStorage.getItem('ropa_guardada')) || [];
let outfitSugerido = { superior: null, inferior: null };
let pestanaActual = 'superior';

window.onload = () => { actualizarPantalla(); };

function actualizarPantalla() {
    generarSugerencia();
    verificarLavado();
    renderInventario(pestanaActual); 
}

function generarSugerencia() {
    let limpiosSup = inventario.filter(p => p.tipo === 'superior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));
    let limpiosInf = inventario.filter(p => p.tipo === 'inferior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));

    limpiosSup.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);
    limpiosInf.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);

    outfitSugerido.superior = limpiosSup[0] || null;
    outfitSugerido.inferior = limpiosInf[0] || null;

    document.getElementById('sugerencia-superior').innerHTML = outfitSugerido.superior 
        ? `<img src="${outfitSugerido.superior.foto}" class="img-prenda"><p class="nombre-prenda">${outfitSugerido.superior.nombre}</p>` 
        : "<p style='margin-top:40px'>No hay franelas</p>";
        
    document.getElementById('sugerencia-inferior').innerHTML = outfitSugerido.inferior 
        ? `<img src="${outfitSugerido.inferior.foto}" class="img-prenda"><p class="nombre-prenda">${outfitSugerido.inferior.nombre}</p>` 
        : "<p style='margin-top:40px'>No hay shorts</p>";
}

function confirmarUso() {
    if (!outfitSugerido.superior || !outfitSugerido.inferior) { alert("Te falta ropa para completar el outfit."); return; }
    inventario.forEach(p => { if (p.estado === 'en_uso') p.estado = 'sucio'; });
    outfitSugerido.superior.estado = 'en_uso'; outfitSugerido.superior.usos += 1;
    outfitSugerido.inferior.estado = 'en_uso'; outfitSugerido.inferior.usos += 1;
    guardarDatos(); actualizarPantalla();
    alert("¡Outfit registrado! Lo que tenías puesto ayer se fue al cesto.");
}

function marcarSemiSucio() {
    let inferiorEnUso = inventario.find(p => p.tipo === 'inferior' && p.estado === 'en_uso');
    if (inferiorEnUso) {
        inferiorEnUso.estado = 'semi_sucio'; guardarDatos(); actualizarPantalla();
        alert("Pantalón guardado para repetir mañana.");
    } else { alert("No tienes ningún short registrado en uso hoy."); }
}

function verificarLavado() {
    let limpios = inventario.filter(p => p.estado === 'limpio').length;
    let alerta = document.getElementById('lavado-alert');
    limpios <= 4 ? alerta.classList.remove('hidden') : alerta.classList.add('hidden');
}

function abrirModal() { document.getElementById('modal').classList.remove('hidden'); }
function cerrarModal() { document.getElementById('modal').classList.add('hidden'); }

function guardarPrenda() {
    let nombre = document.getElementById('nombre-prenda').value;
    let tipo = document.getElementById('tipo-prenda').value;
    let archivoFoto = document.getElementById('foto-prenda').files[0];

    if (!nombre || !archivoFoto) { alert("Falta nombre o foto"); return; }

    let reader = new FileReader();
    reader.onload = function(e) {
        let img = new Image();
        img.onload = function() {
            let canvas = document.createElement('canvas'); let ctx = canvas.getContext('2d');
            let scaleSize = 400 / img.width; canvas.width = 400; canvas.height = img.height * scaleSize;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            let fotoComprimida = canvas.toDataURL('image/jpeg', 0.6); 

            inventario.push({ id: Date.now(), nombre: nombre, tipo: tipo, foto: fotoComprimida, estado: 'limpio', usos: 0 });
            guardarDatos(); cerrarModal(); document.getElementById('nombre-prenda').value = ''; 
            actualizarPantalla();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(archivoFoto);
}

function renderInventario(tipoFiltro) {
    pestanaActual = tipoFiltro;
    
    // Marcar la pestaña activa en el diseño
    document.getElementById('tab-sup').className = tipoFiltro === 'superior' ? 'active' : '';
    document.getElementById('tab-inf').className = tipoFiltro === 'inferior' ? 'active' : '';

    let contenedor = document.getElementById('lista-ropa');
    contenedor.innerHTML = '';
    let filtrados = inventario.filter(p => p.tipo === tipoFiltro);
    
    filtrados.forEach(p => {
        let div = document.createElement('div'); div.className = 'card';
        
        let botonesHTML = p.estado === 'en_reparacion' 
            ? `<button class="btn-primary" onclick="volverDeReparacion(${p.id})">🔙 Volvió</button>`
            : `<div style="display:flex; gap:5px; margin-top:10px;">
                 <button class="btn-danger" onclick="mandarALavar(${p.id})">🧺 Al Cesto</button>
                 <button class="btn-secondary" onclick="mandarAReparar(${p.id})">🪡 Coser</button>
               </div>`;

        let estadoVisual = { 'en_reparacion': '🛠️ Costura', 'limpio': '✨ Limpio', 'sucio': '🧺 Sucio', 'semi_sucio': '♻️ Repite', 'en_uso': '👕 Puesto' }[p.estado];

        div.innerHTML = `
            <img src="${p.foto}" class="img-prenda">
            <p class="nombre-prenda" title="${p.nombre}">${p.nombre}</p>
            <div style="font-size: 0.85em; color: #aaa; margin-bottom: 5px;">Usos: ${p.usos} | <strong>${estadoVisual}</strong></div>
            ${botonesHTML}
            <button class="btn-eliminar" onclick="eliminarPrenda(${p.id})">🗑️ Eliminar</button>
        `;
        contenedor.appendChild(div);
    });
}

function filtrar(tipo) { renderInventario(tipo); }
function mandarALavar(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'sucio'; guardarDatos(); actualizarPantalla(); }
function mandarAReparar(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'en_reparacion'; guardarDatos(); actualizarPantalla(); }
function volverDeReparacion(id) { let p = inventario.find(p => p.id === id); if(p) p.estado = 'limpio'; guardarDatos(); actualizarPantalla(); }

// NUEVA FUNCIÓN PARA BORRAR LOS CLONES
function eliminarPrenda(id) {
    if(confirm("¿Seguro que quieres borrar esta prenda para siempre?")) {
        inventario = inventario.filter(p => p.id !== id);
        guardarDatos(); actualizarPantalla();
    }
}
function guardarDatos() { localStorage.setItem('ropa_guardada', JSON.stringify(inventario)); }
