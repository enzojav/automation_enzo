const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimiters');
const contactRoute = require('./routes/contact');
const { verifyMailer } = require('./utils/mailer');

const app = express();

// Necesario en Railway/plataformas detrás de proxy para que el rate
// limiter y los logs vean la IP real del cliente, no la del proxy.
app.set('trust proxy', 1);

// --- Cabeceras de seguridad ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Google Fonts es el único recurso externo que carga el sitio.
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

// --- CORS restringido al dominio propio, no abierto a "*" ---
app.use(
  cors({
    origin: env.allowedOrigin,
    methods: ['GET', 'POST'],
  })
);

// --- Body parsing con límite de tamaño (mitiga payloads gigantes) ---
app.use(express.json({ limit: '10kb' }));

// --- Logging (sin loguear cuerpos de request, que podrían tener datos personales) ---
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// --- Rate limit general para toda la API ---
app.use('/api', globalLimiter);

// --- Rutas de la API ---
app.use('/api/contact', contactRoute);

// --- Frontend estático ---
const frontendPath = path.join(__dirname, '..', 'public');

const fs = require("fs");

console.log(frontendPath);
console.log("Existe frontend:", fs.existsSync(frontendPath));

if (fs.existsSync(frontendPath)) {
  console.log(fs.readdirSync(frontendPath));
}

app.use(express.static(frontendPath, { extensions: ['html'], index: 'index.html' }));

// --- 404 para rutas de API no encontradas ---
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Recurso no encontrado.' });
});

// --- Manejador de errores central: nunca expone stack traces al cliente ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
});

app.listen(env.port, () => {
  console.log(`Servidor corriendo en http://localhost:${env.port} [${env.nodeEnv}]`);
  verifyMailer();
});
