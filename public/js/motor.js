class SimuladorMedico {
  constructor(config) {
    this.config = config;
    this.paciente = {...config.signos_iniciales};
    this.accionesRealizadas = new Set();
    this.eventos = {};
  }

  // Sistema de eventos Pub/Sub
  on(evento, callback) {
    this.eventos[evento] = this.eventos[evento] || [];
    this.eventos[evento].push(callback);
  }

  emit(evento, datos) {
    (this.eventos[evento] || []).forEach(cb => cb(datos));
  }

  // Realizar acción médica
  realizarAccion(accionId) {
    const accion = this.obtenerAccion(accionId);
    if (!accion) return;
    
    // Verificar prerrequisitos
    if (accion.requiere && !this.accionesRealizadas.has(accion.requiere)) {
      this.emit('feedback', `❌ Requiere: ${this.obtenerNombreAccion(accion.requiere)}`);
      return;
    }
    
    // Aplicar efectos
    if (accion.efecto) {
      Object.keys(accion.efecto).forEach(signo => {
        this.paciente[signo] = accion.efecto[signo];
      });
      this.emit('signos_actualizados', this.paciente);
    }
    
    // Registrar acción
    this.accionesRealizadas.add(accionId);
    this.emit('accion_realizada', accion);
  }

  obtenerAccion(accionId) {
    for (const categoria in this.config.acciones) {
      const accion = this.config.acciones[categoria].find(a => a.id === accionId);
      if (accion) return accion;
    }
    return null;
  }

  obtenerNombreAccion(accionId) {
    const accion = this.obtenerAccion(accionId);
    return accion ? accion.texto : "Acción desconocida";
  }
}