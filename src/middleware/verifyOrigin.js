const { allowedOrigin } = require('../config/env');

/**
 * El endpoint de contacto no usa sesiones ni cookies, así que no aplica CSRF
 * clásico — pero sí queremos rechazar llamadas que no vengan del propio sitio
 * (por ejemplo, un script externo abusando del endpoint). Se valida Origin
 * y, si no está presente, Referer como respaldo.
 */
function verifyOrigin(req, res, next) {
  const origin = req.get('origin') || req.get('referer');

  if (!origin || !origin.startsWith(allowedOrigin)) {
    return res.status(403).json({
      ok: false,
      error: 'Origen no permitido.',
    });
  }

  next();
}

module.exports = verifyOrigin;
