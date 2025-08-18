// ui.js
import { registerAction, addPoints, hasAction, getScore, canReachMax, PUNT_MAX, listActions } from './scoring.js';

document.addEventListener('DOMContentLoaded', () => {
  const fb = document.getElementById('feedbackContainer');
  function mostrarFeedback(msg, esError = false) {
    if (!fb) return;
    fb.textContent = msg;
    fb.style.borderLeftColor = esError ? 'var(--danger)' : 'var(--success)';
    fb.classList.add('visible');
    clearTimeout(fb._t);
    fb._t = setTimeout(() => fb.classList.remove('visible'), 2000);
  }

  const dialogoContainer = document.getElementById('dialogoContainer');
  const dialogoTexto = document.getElementById('dialogoTexto');
  const audioIndicator = document.getElementById('audioIndicator');

  function mostrarDialogo(texto, conAudio = false) {
    if (!dialogoContainer) return;
    dialogoTexto.textContent = texto;
    dialogoContainer.classList.add('visible');
    dialogoContainer.setAttribute('aria-hidden', 'false');
    if (conAudio) {
      audioIndicator.style.display = 'inline-block';
      reproducirAudio(texto);
    } else {
      audioIndicator.style.display = 'none';
    }
  }

  function reproducirAudio(texto) {
    audioIndicator.textContent = '🔈 Reproduciendo audio...';
    const palabras = (texto || '').split(/\s+/).length;
    const ms = Math.max(600, palabras * 450);
    setTimeout(() => {
      audioIndicator.textContent = '🔈 Audio completado';
    }, ms);
  }

  document.getElementById('cerrarDialogo')?.addEventListener('click', () => {
    dialogoContainer.classList.remove('visible');
    dialogoContainer.setAttribute('aria-hidden', 'true');
  });

  const powerButtons = Array.from(document.querySelectorAll('.power-btn'));
  const vitals = {
    glucemia: {
      card: document.getElementById('glucemiaCard'),
      valorEl: document.getElementById('glucemiaValor'),
      unitEl: document.getElementById('glucemiaUnit'),
      value: document.getElementById('glucemiaCard')?.dataset?.value,
      unit: document.getElementById('glucemiaCard')?.dataset?.unit
    },
    fc: {
      card: document.getElementById('fcCard'),
      valorEl: document.getElementById('fcValor'),
      unitEl: document.getElementById('fcUnit'),
      value: document.getElementById('fcCard')?.dataset?.value,
      unit: document.getElementById('fcCard')?.dataset?.unit
    },
    pa: {
      card: document.getElementById('paCard'),
      valorEl: document.getElementById('paValor'),
      unitEl: document.getElementById('paUnit'),
      value: document.getElementById('paCard')?.dataset?.value,
      unit: document.getElementById('paCard')?.dataset?.unit
    },
    sat: {
      card: document.getElementById('satCard'),
      valorEl: document.getElementById('satValor'),
      unitEl: document.getElementById('satUnit'),
      rrEl: document.getElementById('rrText'),
      value: document.getElementById('satCard')?.dataset?.value,
      unit: document.getElementById('satCard')?.dataset?.unit,
      rr: 18
    }
  };

  function setOff(v) {
    if (!v || !v.card) return;
    v.card.classList.add('off');
    v.card.classList.remove('critico');
    const power = v.card.querySelector('.power-btn');
    if (power) { power.classList.remove('on'); power.classList.add('off'); power.setAttribute('aria-pressed', 'false'); }
    v.valorEl && (v.valorEl.textContent = '—');
    v.unitEl && (v.unitEl.textContent = '—');
    if (v.rrEl) v.rrEl.textContent = 'FR: — rpm';
  }
  Object.values(vitals).forEach(setOff);

  function setOn(v, key) {
    if (!v || !v.card) return;
    v.card.classList.remove('off');
    const power = v.card.querySelector('.power-btn');
    if (power) { power.classList.remove('off'); power.classList.add('on'); power.setAttribute('aria-pressed', 'true'); }
    if (key === 'sat') {
      v.valorEl.textContent = v.value;
      v.unitEl.textContent = v.unit;
      v.rrEl.textContent = `FR: ${v.rr} rpm`;
    } else {
      v.valorEl.textContent = v.value;
      v.unitEl.textContent = v.unit;
    }
    if (v.card.id === 'glucemiaCard') {
      const num = parseFloat(v.value);
      if (!isNaN(num) && num < 70) v.card.classList.add('critico');
      else v.card.classList.remove('critico');
    }
    const actName = `on_${key}`;
    const registered = registerAction(actName, 5);
    if (registered) mostrarFeedback(`🔌 Monitor ${v.card.querySelector('.vital-nombre').textContent} encendido (+5)`);
    else mostrarFeedback(`🔌 Monitor ${v.card.querySelector('.vital-nombre').textContent} ya estaba encendido`);
  }

  powerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;
      const mapping = { glucemiaCard: 'glucemia', fcCard: 'fc', paCard: 'pa', satCard: 'sat' };
      const key = mapping[targetId];
      if (!key) return;
      const v = vitals[key];
      const card = document.getElementById(targetId);
      const isOff = card.classList.contains('off');
      if (isOff) {
        btn.disabled = true;
        mostrarFeedback(`⌛ Obteniendo lectura de ${v.card.querySelector('.vital-nombre').textContent}...`);
        setTimeout(() => { setOn(v, key); btn.disabled = false; }, 600);
      } else {
        setOff(v);
        mostrarFeedback(`🔌 Monitor ${v.card.querySelector('.vital-nombre').textContent} apagado`);
      }
    });
  });

  const exploracionBtn = document.querySelector('.categoria-btn[data-categoria="exploracion"]');
  const menuExploracion = document.getElementById('menuExploracionFlotante');
  const cerrarMenuExpl = document.getElementById('cerrarMenuExpl');
  const opcionesExpl = Array.from(menuExploracion.querySelectorAll('.opcion'));
  const totalOpcionesMenu = 5;
  const menuClicks = new Set();

  if (exploracionBtn) {
    exploracionBtn.addEventListener('click', () => {
      document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('activo'));
      exploracionBtn.classList.add('activo');
      document.querySelectorAll('.acciones-container').forEach(c => c.classList.remove('visible'));
      const cont = document.getElementById('exploracionAcciones');
      if (cont) cont.classList.add('visible');

      const opening = !menuExploracion.classList.contains('visible');
      if (opening) {
        menuExploracion.classList.add('visible'); menuExploracion.setAttribute('aria-hidden', 'false');
      } else {
        menuExploracion.classList.remove('visible'); menuExploracion.setAttribute('aria-hidden', 'true');
      }
    });
  }
  cerrarMenuExpl?.addEventListener('click', () => {
    menuExploracion.classList.remove('visible'); menuExploracion.setAttribute('aria-hidden', 'true');
  });

  opcionesExpl.forEach(btn => {
    btn.addEventListener('click', function () {
      const accion = this.dataset.accion;
      const accionReal = accion === 'neurologica_expl' ? 'neurologica' : accion;
      realizarAccion(accionReal);
      if (!this.classList.contains('selected')) {
        this.classList.add('selected'); menuClicks.add(accion);
      }
      if (menuClicks.size >= totalOpcionesMenu) {
        mostrarFeedback('✅ Exploración completa: todas las opciones revisadas');
        setTimeout(() => { menuExploracion.classList.remove('visible'); menuExploracion.setAttribute('aria-hidden', 'true'); }, 350);
      }
    });
  });
  
  const btnQuimica = document.getElementById('btnQuimica');
  const reporteQuimica = document.getElementById('reporteQuimica');
  const cerrarReporte = document.getElementById('cerrarReporte');

  btnQuimica?.addEventListener('click', () => {
    const registered = registerAction('visto_quimica', 10);
    if (registered) mostrarFeedback('📄 Mostrando reporte de Química Sanguínea (+10)');
    else mostrarFeedback('📄 Reporte de Química Sanguínea (ya visto)');
    reporteQuimica.classList.add('visible'); reporteQuimica.setAttribute('aria-hidden', 'false');
  });
  cerrarReporte?.addEventListener('click', () => {
    reporteQuimica.classList.remove('visible'); reporteQuimica.setAttribute('aria-hidden', 'true');
  });

  const btnInterrogatorio = document.getElementById('btnInterrogatorio');
  const btnPresentacion = document.getElementById('btnPresentacion');
  const btnSintomas = document.getElementById('btnSintomas');
  const gridInterrogatorio = document.getElementById('gridInterrogatorio');

  btnInterrogatorio?.addEventListener('click', () => {
    document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('activo'));
    btnInterrogatorio.classList.add('activo');
    document.querySelectorAll('.acciones-container').forEach(c => c.classList.remove('visible'));
    const cont = document.getElementById('interrogatorioAcciones');
    if (cont) cont.classList.add('visible');

    if (btnPresentacion.style.display === 'none' || btnPresentacion.style.display === '') {
      btnPresentacion.style.display = 'flex';
      if (gridInterrogatorio && btnSintomas) gridInterrogatorio.insertBefore(btnPresentacion, btnSintomas);
    }
  });

  document.querySelectorAll('.accion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.getAttribute('data-accion');
      realizarAccion(accion);
    });
  });

  document.getElementById('pausaBtn')?.addEventListener('click', () => mostrarFeedback('⏸️ Simulación en pausa'));
  document.getElementById('volverBtn')?.addEventListener('click', () => {
    if (confirm('¿Terminar simulación? El progreso se perderá.')) window.location.href = 'index.html';
  });

  function realizarAccion(accion) {
    const repetibles = ['padecimiento', 'presentacion', 'sintomas_detalle'];

    if (hasAction && hasAction(accion) && repetibles.indexOf(accion) === -1) {
      mostrarFeedback('⚠️ Esta acción ya fue realizada');
      return;
    }

    switch (accion) {
      case 'sintomas':
        document.getElementById('sintomasAcciones')?.classList.add('visible');
        if (registerAction('sintomas', 5)) mostrarFeedback('✅ Abrió Síntomas Actuales (+5)');
        else mostrarFeedback('✅ Síntomas Actuales ya abierto');
        break;

      case 'presentacion':
        if (!hasAction('correcto_presentacion')) {
          const nombreMedico = "Dr. Simulador";
          const mensaje = `Hola, buenos días señor Miguel Rodríguez. Soy el médico que lo va a atender hoy.`;
          mostrarDialogo(mensaje, true);
          registerAction('correcto_presentacion', 5);
          mostrarFeedback('✅ Presentación realizada correctamente (+5)');
        } else mostrarFeedback('✅ Presentación ya realizada');
        break;

      case 'padecimiento':
        mostrarDialogo('Cuénteme señor, ¿qué lo trae por acá?', true);
        setTimeout(() => {
          mostrarDialogo('No lo sé doctor, desperté en el automóvil, mi hijo me trajo al hospital. Se veía muy asustado. Me siento mareado y muy débil.', true);
          setTimeout(() => {
            document.getElementById('sintomasAcciones')?.classList.remove('visible');
            document.getElementById('interrogatorioAcciones')?.classList.add('visible');
          }, 4000);
        }, 1200);
        break;

      case 'historia':
        if (registerAction('correcto_historia', 5)) mostrarFeedback('✅ Tomando historia clínica: Paciente con diabetes tipo 2 (+5)');
        else mostrarFeedback('✅ Historia ya tomada');
        break;

      case 'glucemia':
        if (registerAction('correcto_glucemia', 10)) mostrarFeedback('🩸 Glucemia capilar solicitada / registrada (+10)');
        else mostrarFeedback('🩸 Glucemia capilar ya solicitada');
        break;

      case 'quimica_sanguinea':
        if (registerAction('visto_quimica', 10)) mostrarFeedback('📄 Química sanguínea consultada (+10)');
        else mostrarFeedback('📄 Química sanguínea ya consultada');
        document.getElementById('reporteQuimica')?.classList.add('visible');
        break;

      case 'ecg':
        if (registerAction('incorrecto_estudio', -5)) mostrarFeedback('❌ ECG no necesario (-5)', true);
        else mostrarFeedback('❌ ECG ya solicitado (penalización aplicada)');
        break;

      case 'soluciones':
        mostrarFeedback('Selecciona la solución a administrar');
        break;

      case 'glucosa_50':
        if (hasAction('glucosa_50')) { mostrarFeedback('💉 Glucosada 50% ya administrada'); break; }
        registerAction('glucosa_50', 0);
        const prereq = hasAction('on_glucemia') || hasAction('correcto_glucemia') || hasAction('visto_quimica');
        if (prereq) {
          addPoints(50);
          mostrarFeedback('✅ Administrada Glucosada 50% 50cc (+50)');
        } else {
          addPoints(-20);
          mostrarFeedback('⚠️ Administrada sin datos previos (-20 penalización)', true);
        }
        if (hasAction('on_glucemia')) {
          const v = document.getElementById('glucemiaValor');
          if (v) v.textContent = '75';
          document.getElementById('glucemiaCard')?.classList.remove('critico');
        }
        break;

      case 'glucagon':
        if (registerAction('glucagon', 15)) mostrarFeedback('💉 Glucagón administrado (+15)');
        else mostrarFeedback('💉 Glucagón ya administrado');
        if (hasAction('on_glucemia')) {
          const v = document.getElementById('glucemiaValor');
          if (v) v.textContent = '70';
          document.getElementById('glucemiaCard')?.classList.remove('critico');
        }
        break;

      case 'via_aerea':
      case 'ventilacion':
      case 'circulacion':
      case 'neurologica':
      case 'exposicion': {
        const actName = `correcto_${accion}`;
        if (registerAction(actName, 5)) mostrarFeedback(`✅ ${accion.replace('_', ' ')} realizado (+5)`);
        else mostrarFeedback(`✅ ${accion.replace('_', ' ')} ya realizado`);
        break;
      }

      default:
        mostrarFeedback(`Acción '${accion}' no configurada`);
    }
  }

  window.UI = window.UI || {};
  window.UI.realizarAccion = realizarAccion;
  window.UI.mostrarFeedback = mostrarFeedback;
  window.UI.mostrarDialogo = mostrarDialogo;
  window.UI.listActions = listActions;

});
