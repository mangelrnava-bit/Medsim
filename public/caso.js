// ARCHIVO: caso.js

// Elementos del DOM
const timeDisplay = document.getElementById('timeDisplay');
const decreaseBtn = document.getElementById('decreaseTime');
const increaseBtn = document.getElementById('increaseTime');
const startBtn = document.getElementById('startButton');
const configBtn = document.getElementById('configBtn');

// Variables
let tiempoSeleccionado = 20; // Valor inicial en minutos

// Actualizar display del tiempo
function actualizarTiempo() {
    timeDisplay.textContent = `${tiempoSeleccionado} min`;
}

// Event Listeners
decreaseBtn.addEventListener('click', () => {
    if (tiempoSeleccionado > 5) {
        tiempoSeleccionado -= 5;
        actualizarTiempo();
    }
});

increaseBtn.addEventListener('click', () => {
    if (tiempoSeleccionado < 60) {
        tiempoSeleccionado += 5;
        actualizarTiempo();
    }
});

startBtn.addEventListener('click', () => {
    // Guardar tiempo seleccionado para usar en la simulación
    sessionStorage.setItem('tiempoSimulacion', tiempoSeleccionado);
    
    // Redirigir a la simulación (la crearemos después)
    alert(`¡Simulación iniciada! Tienes ${tiempoSeleccionado} minutos.`);
    // window.location.href = 'simulacion.html';
});

configBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Menú de configuración (próximamente)');
});

// Inicializar
actualizarTiempo();