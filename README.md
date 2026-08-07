# Enzo — Automatizaciones para banca y empresas

Sitio con backend propio (no una plantilla estática): el formulario de contacto
pasa por validación, sanitización y protecciones anti-abuso reales en el servidor.

## Estructura

```
enzo-automations/
├── backend/
│   ├── src/
│   │   ├── server.js            # arma la app: seguridad, estáticos, rutas
│   │   ├── config/env.js        # carga y valida variables de entorno
│   │   ├── middleware/
│   │   │   ├── rateLimiters.js  # límites de peticiones (anti-spam/DoS)
│   │   │   └── verifyOrigin.js  # rechaza llamadas desde otros orígenes
│   │   ├── routes/contact.js    # valida, sanea y guarda el lead
│   │   └── utils/
│   │       ├── sanitize.js      # escapa HTML, valida email
│   │       └── leadsStore.js    # persistencia (JSON local, reemplazable por DB)
│   ├── data/leads.json          # se genera solo, no se versiona
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
└── .gitignore
```

El backend sirve el frontend como estático, así que en producción es un solo
proceso (útil para Railway u otro host de un solo servicio).

## Seguridad implementada

- **Cabeceras HTTP (Helmet)**: Content-Security-Policy restrictiva (solo permite
  Google Fonts como recurso externo), sin `unsafe-inline` en scripts, sin
  `X-Powered-By`, `Referrer-Policy` estricta.
- **CORS cerrado**: solo acepta peticiones del dominio configurado en
  `ALLOWED_ORIGIN`, no `*`.
- **Verificación de origen** en `/api/contact`: rechaza con 403 cualquier
  llamada cuyo `Origin`/`Referer` no sea el sitio propio.
- **Rate limiting en dos niveles**: 100 req/15min para toda la API, 5 req/15min
  específicamente para el envío de contacto.
- **Validación de entrada** (`express-validator`): tipo, longitud y formato de
  cada campo antes de procesar nada.
- **Sanitización anti-XSS**: todo texto se escapa (`validator.escape`) antes de
  guardarse, así que no puede inyectar HTML/JS aunque pase la validación.
- **Honeypot anti-bot**: campo oculto que un bot completa y una persona no ve;
  si llega relleno, se descarta en silencio (responde 200 igual, para no
  revelar la defensa).
- **Límite de tamaño del body** (`10kb`) para evitar payloads abusivos.
- **Manejo de errores centralizado**: nunca se devuelve un stack trace ni un
  mensaje interno al cliente; todo error real queda solo en el log del server.
- **Variables de entorno**: `.env` nunca se commitea (está en `.gitignore`);
  el servidor no arranca si falta una variable obligatoria.
- **`trust proxy`**: configurado para que el rate limiter vea la IP real
  detrás de un proxy (Railway, Render, etc.) y no la del proxy.

Lo que falta si esto pasa a producción con tráfico real: HTTPS (lo da la
plataforma de hosting), reemplazar `leads.json` por una base de datos, y
mandar el lead por email/CRM en vez de (o además de) guardarlo en archivo.

## Cómo correrlo local

```bash
cd backend
cp .env.example .env      # completá ALLOWED_ORIGIN si hace falta
npm install
npm run dev                # o npm start
```

Abrí `http://localhost:3000`.

## Deploy en Railway

1. Subí el repo a GitHub.
2. En Railway, "New Project" → "Deploy from GitHub repo".
3. Root directory: `backend`. Start command: `npm start`.
4. Variables de entorno en Railway: `PORT` (Railway lo inyecta solo),
   `NODE_ENV=production`, `ALLOWED_ORIGIN=https://tu-dominio.com`.
