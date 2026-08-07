const validator = require('validator');

/**
 * Escapa HTML y recorta espacios. Se aplica a todo texto que venga del
 * usuario antes de guardarlo o de usarlo en cualquier notificación,
 * para que nunca se interprete como HTML/JS (XSS almacenado).
 */
function cleanText(value, { maxLength = 500 } = {}) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().slice(0, maxLength);
  return validator.escape(trimmed);
}

function cleanEmail(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase();
  return validator.isEmail(trimmed) ? trimmed : '';
}

module.exports = { cleanText, cleanEmail };
