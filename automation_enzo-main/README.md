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

## Notificación por email

Cada lead se guarda en `leads.json` **y además** se manda por mail vía Gmail
(`src/utils/mailer.js`, con `nodemailer`). Si el envío del mail falla (Gmail
caído, credenciales vencidas, etc.) el lead no se pierde: ya quedó guardado
en el archivo antes de intentar mandar el mail, y el usuario igual recibe la
confirmación de que su mensaje llegó.

Para que funcione hace falta:

1. Activar verificación en 2 pasos en la cuenta de Gmail que va a enviar.
2. Generar una contraseña de aplicación en
   https://myaccount.google.com/apppasswords
3. Completar `SMTP_USER` (la cuenta de Gmail) y `SMTP_PASS` (la contraseña de
   aplicación, 16 caracteres sin espacios) en `.env`.
4. Opcional: `NOTIFY_EMAIL` si querés que el aviso llegue a una casilla
   distinta de `SMTP_USER`.

Al levantar el servidor se loguea si la conexión SMTP quedó bien configurada
o no (`verifyMailer` en `server.js`), para detectar el problema antes de que
llegue el primer lead real.

Lo que falta si esto pasa a producción con tráfico real: HTTPS (lo da la
plataforma de hosting) y reemplazar `leads.json` por una base de datos.

## Cómo correrlo local

```bash
cd backend
cp .env.example .env      # completá ALLOWED_ORIGIN y las variables SMTP_*
npm install
npm run dev                # o npm start
```

Abrí `http://localhost:3000`.

## Deploy en Railway

1. Subí el repo a GitHub.
2. En Railway, "New Project" → "Deploy from GitHub repo".
3. Root directory: `backend`. Start command: `npm start`.
4. Variables de entorno en Railway: `PORT` (Railway lo inyecta solo),
   `NODE_ENV=production`, `ALLOWED_ORIGIN=https://tu-dominio.com`,
   `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` (opcional).
