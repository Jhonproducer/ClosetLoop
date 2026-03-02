// ==========================================
// NUEVA VERSIÓN: INVENTARIO CON REPARACIÓN
// ==========================================

function renderInventario(tipoFiltro) {
    let contenedor = document.getElementById('lista-ropa');
    contenedor.innerHTML = ''; // Limpiamos la pantalla antes de mostrar
    
    let filtrados = inventario.filter(p => p.tipo === tipoFiltro);
    
    filtrados.forEach(p => {
        let div = document.createElement('div');
        div.className = 'card';
        
        // Decidimos qué botones mostrar según el estado de la prenda
        let botonesHTML = '';
        if (p.estado === 'en_reparacion') {
            // Si está en reparación, solo mostramos el botón para traerla de vuelta
            botonesHTML = `<button onclick="volverDeReparacion(${p.id})" style="padding:8px; background:var(--primary); color:white; border:none; border-radius:5px; margin-top:5px; width:100%;">🔙 Volvió (Lista para usar)</button>`;
        } else {
            // Si está normal, podemos lavarla o mandarla a reparar
            botonesHTML = `
                <button onclick="mandarALavar(${p.id})" style="padding:8px; background:var(--danger); color:white; border:none; border-radius:5px; margin-top:5px; width:48%;">🧺 Lavar</button>
                <button onclick="mandarAReparar(${p.id})" style="padding:8px; background:var(--light); color:black; border:none; border-radius:5px; margin-top:5px; width:48%;">🪡 Reparar</button>
            `;
        }

        // Hacemos que el texto de estado sea más visual
        let estadoVisual = p.estado;
        if (p.estado === 'en_reparacion') estadoVisual = '🛠️ En Reparación';
        if (p.estado === 'limpio') estadoVisual = '✨ Limpio';
        if (p.estado === 'sucio') estadoVisual = '🧺 Sucio';
        if (p.estado === 'semi_sucio') estadoVisual = '♻️ En uso / Repetible';

        // Dibujamos la tarjeta de la ropa
        div.innerHTML = `
            <img src="${p.foto}" width="100%" style="border-radius:10px; max-height: 200px; object-fit: cover;">
            <p><strong>${p.nombre}</strong></p>
            <p>Usos totales: ${p.usos}</p>
            <p>Estado: <strong>${estadoVisual}</strong></p>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                ${botonesHTML}
            </div>
        `;
        contenedor.appendChild(div);
    });
}

// Función para enviar a la costurera
function mandarAReparar(id) {
    let prenda = inventario.find(p => p.id === id);
    if(prenda) prenda.estado = 'en_reparacion';
    guardarDatos();
    actualizarPantalla();
}

// Función para cuando la prenda vuelve a estar disponible
function volverDeReparacion(id) {
    let prenda = inventario.find(p => p.id === id);
    // Asumimos que si la reparaste, vuelve limpia al closet
    if(prenda) prenda.estado = 'limpio'; 
    guardarDatos();
    actualizarPantalla();
}
