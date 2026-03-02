// Base de datos local (se guarda en la memoria de tu navegador)
let inventario = JSON.parse(localStorage.getItem('ropa_guardada')) || [];
let outfitSugerido = { superior: null, inferior: null };

// Al iniciar la app, cargamos todo
window.onload = () => {
    actualizarPantalla();
};

function actualizarPantalla() {
    generarSugerencia();
    verificarLavado();
    renderInventario('superior'); // Por defecto mostramos las franelas
}

// ==========================================
// 1. LÓGICA DE ROTACIÓN Y SUGERENCIA
// ==========================================
function generarSugerencia() {
    let limpiosSuperior = inventario.filter(p => p.tipo === 'superior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));
    let limpiosInferior = inventario.filter(p => p.tipo === 'inferior' && (p.estado === 'limpio' || p.estado === 'semi_sucio'));

    // Ordenar por menos usos. Si hay semi-sucios, los pone de primero para gastarlos.
    limpiosSuperior.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);
    limpiosInferior.sort((a, b) => (a.estado === 'semi_sucio' ? -1 : 1) - (b.estado === 'semi_sucio' ? -1 : 1) || a.usos - b.usos);

    outfitSugerido.superior = limpiosSuperior[0] || null;
    outfitSugerido.inferior = limpiosInferior[0] || null;

    // Mostrar en pantalla
    document.getElementById('sugerencia-superior').innerHTML = outfitSugerido.superior 
        ? `<img src="${outfitSugerido.superior.foto}" width="80"><br>${outfitSugerido.superior.nombre}` 
        : "No hay franelas limpias";
        
    document.getElementById('sugerencia-inferior').innerHTML = outfitSugerido.inferior 
        ? `<img src="${outfitSugerido.inferior.foto}" width="80"><br>${outfitSugerido.inferior.nombre}` 
        : "No hay shorts limpios";
}

function confirmarUso() {
    if (!outfitSugerido.superior || !outfitSugerido.inferior) {
        alert("No tienes ropa suficiente para un outfit completo.");
        return;
    }

    // Toda la ropa que estaba "en uso" pasa a "sucia" (al cesto)
    inventario.forEach(p => {
        if (p.estado === 'en_uso') p.estado = 'sucio';
    });

    // La nueva ropa sugerida pasa a "en uso" y le sumamos 1 a su contador de desgaste
    outfitSugerido.superior.estado = 'en_uso';
    outfitSugerido.superior.usos += 1;
    outfitSugerido.inferior.estado = 'en_uso';
    outfitSugerido.inferior.usos += 1;

    guardarDatos();
    alert("¡Outfit confirmado! Nos vemos mañana a las 6 PM.");
    actualizarPantalla();
}

function marcarSemiSucio() {
    // Si el short/pantalón que tenías hoy aguanta otra puesta, no lo mandamos a sucio
    let inferiorEnUso = inventario.find(p => p.tipo === 'inferior' && p.estado === 'en_uso');
    if (inferiorEnUso) {
        inferiorEnUso.estado = 'semi_sucio';
        guardarDatos();
        alert("Pantalón marcado para repetir. Se priorizará mañana.");
        actualizarPantalla();
    } else {
        alert("No tienes ningún short en uso ahora mismo.");
    }
}

// ==========================================
// 2. ALERTA DE LAVADO
// ==========================================
function verificarLavado() {
    let limpios = inventario.filter(p => p.estado === 'limpio').length;
    let alerta = document.getElementById('lavado-alert');
    
    // Si quedan 2 mudas o menos, lanza la alerta
    if (limpios <= 4) { // 4 prendas = 2 franelas y 2 shorts aprox
        alerta.classList.remove('hidden');
    } else {
        alerta.classList.add('hidden');
    }
}

// Agregamos un botón invisible en el HTML para lavar todo (puedes llamarlo desde la consola)
function lavarTodaLaRopa() {
    inventario.forEach(p => p.estado = 'limpio');
    guardarDatos();
    alert("¡Toda la ropa está limpia de nuevo!");
    actualizarPantalla();
}

// ==========================================
// 3. INTERFAZ Y CAMARA (AÑADIR ROPA)
// ==========================================
function abrirModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal').classList.add('hidden');
}

function guardarPrenda() {
    let nombre = document.getElementById('nombre-prenda').value;
    let tipo = document.getElementById('tipo-prenda').value;
    let archivoFoto = document.getElementById('foto-prenda').files[0];

    if (!nombre || !archivoFoto) {
        alert("Ponle nombre y toma una foto.");
        return;
    }

    // Convertimos la foto a texto para guardarla sin base de datos externa
    let reader = new FileReader();
    reader.onload = function(e) {
        let nuevaPrenda = {
            id: Date.now(),
            nombre: nombre,
            tipo: tipo,
            foto: e.target.result, // La imagen en formato Base64
            estado: 'limpio', // 'limpio', 'en_uso', 'sucio', 'semi_sucio'
            usos: 0
        };
        inventario.push(nuevaPrenda);
        guardarDatos();
        cerrarModal();
        actualizarPantalla();
    };
    reader.readAsDataURL(archivoFoto);
}

function filtrar(tipo) {
    renderInventario(tipo);
}

function renderInventario(tipoFiltro) {
    let contenedor = document.getElementById('lista-ropa');
    contenedor.innerHTML = '';
    
    let filtrados = inventario.filter(p => p.tipo === tipoFiltro);
    
    filtrados.forEach(p => {
        let div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${p.foto}" width="100%" style="border-radius:10px;">
            <p><strong>${p.nombre}</strong></p>
            <p>Usos: ${p.usos} | <span style="color:var(--light)">${p.estado}</span></p>
            <button onclick="mandarALavar(${p.id})" style="padding:5px; background:var(--danger); color:white; border:none; border-radius:5px;">Lavar</button>
        `;
        contenedor.appendChild(div);
    });
}

function mandarALavar(id) {
    let prenda = inventario.find(p => p.id === id);
    if(prenda) prenda.estado = 'sucio';
    guardarDatos();
    actualizarPantalla();
}

function guardarDatos() {
    localStorage.setItem('ropa_guardada', JSON.stringify(inventario));
}