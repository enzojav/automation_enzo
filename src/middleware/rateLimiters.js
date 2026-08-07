const rateLimit = require('express-rate-limit');

// Límite general para toda la API: evita escaneos y abuso masivo.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiadas peticiones. Probá de nuevo más tarde.' },
});

// Límite estricto solo para el envío de contacto: evita que un bot
// mande cientos de mensajes por minuto.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Ya enviaste varios mensajes. Esperá unos minutos antes de volver a intentar.' },
});

module.exports = { globalLimiter, contactLimiter };
