const nodemailer = require('nodemailer');
const env = require('../config/env');

// Transporter único, reutilizado entre requests (no se crea uno por mail).
// Usa Gmail con contraseña de aplicación: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
  // Sin esto, si el puerto SMTP está bloqueado o filtrado (pasa en algunos
  // hostings), la conexión queda colgada sin error ni éxito. Con timeouts
  // cortos, el fallo aparece rápido y claro en los logs.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Verifica la conexión SMTP al arrancar el server, para detectar
 * credenciales mal configuradas antes de que llegue el primer lead.
 */
async function verifyMailer() {
  console.log('Verificando conexión SMTP...');
  try {
    await transporter.verify();
    console.log('SMTP listo: los mails se van a poder enviar.');
  } catch (err) {
    console.error('SMTP no verificado — revisá SMTP_USER/SMTP_PASS:', err.message);
  }
}

/**
 * Manda la notificación del lead a NOTIFY_EMAIL. El texto ya viene
 * sanitizado (validator.escape) desde routes/contact.js, así que acá solo
 * se arma el mail; no hay riesgo de inyectar HTML/JS en el cuerpo.
 */
async function sendLeadNotification(lead) {
  console.log(`Intentando enviar mail de notificación a ${env.notifyEmail}...`);
  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${lead.nombre}</p>
    <p><strong>Empresa:</strong> ${lead.empresa}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    ${lead.equipo ? `<p><strong>Equipo:</strong> ${lead.equipo}</p>` : ''}
    ${lead.alcance ? `<p><strong>Alcance:</strong> ${lead.alcance}</p>` : ''}
    ${lead.mensaje ? `<p><strong>Mensaje:</strong><br>${lead.mensaje}</p>` : ''}
    <p><strong>Checklist solicitada:</strong> ${lead.checklist ? 'Sí' : 'No'}</p>
  `;

  await transporter.sendMail({
    from: `"Formulario de contacto" <${env.smtpUser}>`,
    to: env.notifyEmail,
    replyTo: lead.email,
    subject: `Nuevo contacto: ${lead.empresa}`,
    html,
  });
  console.log('Mail de notificación enviado con éxito.');
}

module.exports = { transporter, verifyMailer, sendLeadNotification };
