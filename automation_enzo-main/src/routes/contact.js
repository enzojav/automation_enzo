const express = require('express');
const { body, validationResult } = require('express-validator');
const { cleanText, cleanEmail } = require('../utils/sanitize');
const { saveLead } = require('../utils/leadsStore');
const { sendLeadNotification } = require('../utils/mailer');
const { contactLimiter } = require('../middleware/rateLimiters');
const verifyOrigin = require('../middleware/verifyOrigin');

const router = express.Router();

const validations = [
  body('nombre').isString().trim().isLength({ min: 2, max: 120 }),
  body('empresa').isString().trim().isLength({ min: 2, max: 120 }),
  body('email').isString().trim().isEmail(),
  body('equipo').optional({ checkFalsy: true }).isString().trim().isLength({ max: 20 }),
  body('alcance').optional({ checkFalsy: true }).isString().trim().isLength({ max: 60 }),
  body('mensaje').optional({ checkFalsy: true }).isString().trim().isLength({ max: 1000 }),
  body('checklist').optional().isBoolean(),
  // Campo trampa: invisible para personas, atractivo para bots. Si viene
  // relleno, es un bot — se responde 200 igual para no revelar la defensa.
  body('website').optional({ checkFalsy: true }).isString(),
];

router.post('/', contactLimiter, verifyOrigin, validations, async (req, res) => {
  // Honeypot: si el campo trampa tiene contenido, se descarta en silencio.
  if (req.body.website) {
    return res.status(200).json({ ok: true });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los datos del formulario.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const lead = {
    nombre: cleanText(req.body.nombre, { maxLength: 120 }),
    empresa: cleanText(req.body.empresa, { maxLength: 120 }),
    email: cleanEmail(req.body.email),
    equipo: cleanText(req.body.equipo || '', { maxLength: 20 }),
    alcance: cleanText(req.body.alcance || '', { maxLength: 60 }),
    mensaje: cleanText(req.body.mensaje || '', { maxLength: 1000 }),
    checklist: Boolean(req.body.checklist),
  };

  if (!lead.email) {
    return res.status(400).json({ ok: false, error: 'El email no es válido.' });
  }

  try {
    saveLead(lead);
  } catch (err) {
    // No se filtran detalles internos del error al cliente.
    console.error('Error guardando lead:', err.message);
    return res.status(500).json({ ok: false, error: 'No se pudo procesar el mensaje. Probá de nuevo.' });
  }

  // El lead ya está guardado en leads.json, así que respondemos ya mismo:
  // el usuario no debe esperar a que Gmail conteste. El envío del mail
  // sigue en segundo plano; si falla (SMTP caído, credenciales vencidas),
  // el lead no se pierde, solo no llega el aviso por mail.
  res.status(201).json({ ok: true, message: 'Mensaje recibido. Te respondo a la brevedad.' });

  sendLeadNotification(lead).catch((err) => {
    console.error('Error enviando mail de notificación:', err.message);
  });
});

module.exports = router;
