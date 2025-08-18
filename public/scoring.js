// scoring.js
export const PUNT_MAX = 100;

let puntuacion = 0;
const acciones = new Set();
// pasos obligatorios para poder alcanzar 100
const pasosRequeridosParaMax = new Set(['correcto_presentacion','sintomas']);

export function hasAction(name) {
  return acciones.has(name);
}

export function canReachMax() {
  for (const req of pasosRequeridosParaMax) if (!acciones.has(req)) return false;
  return true;
}

function clamp() {
  if (puntuacion < 0) puntuacion = 0;
  if (puntuacion > PUNT_MAX) {
    puntuacion = canReachMax() ? PUNT_MAX : (PUNT_MAX - 1);
  }
}

function updateUI() {
  const el = document.getElementById('puntuacionValor');
  if (el) el.textContent = puntuacion;
}

/**
 * Registra una acción (solo la primera vez) y aplica puntos.
 * @param {string} actionName
 * @param {number} points
 * @returns {boolean} true si la acción fue registrada ahora; false si ya existía
 */
export function registerAction(actionName, points = 0) {
  if (!acciones.has(actionName)) {
    acciones.add(actionName);
    puntuacion += points;
    clamp();
    updateUI();
    return true;
  }
  return false;
}

/** Agrega puntos sin crear una acción */
export function addPoints(n) {
  puntuacion += n;
  clamp();
  updateUI();
}

/** Devuelve puntuación actual */
export function getScore() {
  return puntuacion;
}

/** Devuelve listado de acciones (útil para debug) */
export function listActions() {
  return Array.from(acciones);
}

