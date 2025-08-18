// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderCases();
    
    // ===== NUEVO CÓDIGO AÑADIDO (PASO 4) =====
    document.querySelectorAll('.case-btn').forEach(button => {
        button.addEventListener('click', function() {
            const caseId = this.getAttribute('data-id');
            
            // Guardar en memoria el caso seleccionado
            sessionStorage.setItem('casoSeleccionado', caseId);
            
            // Redirigir a la pantalla de caso clínico
            window.location.href = 'caso.html';
        });
    });
    // ===== FIN DEL NUEVO CÓDIGO =====
});
