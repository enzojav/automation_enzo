const dotenv = require('dotenv');
dotenv.config();

const required = ['PORT', 'ALLOWED_ORIGIN'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Falla rápido y explícito en vez de arrancar con configuración incompleta.
  console.error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  console.error('Copiá backend/.env.example a backend/.env y completalo.');
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigin: process.env.ALLOWED_ORIGIN,
  notifyEmail: process.env.NOTIFY_EMAIL || null,
  isProduction: process.env.NODE_ENV === 'production',
};
