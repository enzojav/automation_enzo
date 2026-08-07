const express = require('express');
const { body, validationResult } = require('express-validator');
const { cleanText, cleanEmail } = require('../utils/sanitize');
const { saveLead } = require('../utils/leadsStore');
const { contactLimiter } = require('../middleware/rateLimiters');
const verifyOrigin = require('../middleware/verifyOrigin');
const { sendLeadMail } = require('../services/mail');

const router = express.Router();

const validations = [
    body('nombre').isString().trim().isLength({ min: 2, max: 120 }),
    body('empresa').isString().trim().isLength({ min: 2, max: 120 }),
    body('email').isString().trim().isEmail(),
    body('equipo').optional({ checkFalsy: true }).isString().trim().isLength({ max: 20 }),
    body('alcance').optional({ checkFalsy: true }).isString().trim().isLength({ max: 60 }),
    body('mensaje').optional({ checkFalsy: true }).isString().trim().isLength({ max: 1000 }),
    body('checklist').optional().isBoolean(),
    body('website').optional({ checkFalsy: true }).isString(),
];

router.post(
    '/',
    contactLimiter,
    verifyOrigin,
    validations,
    async (req, res) => {

        // Honeypot
        if (req.body.website) {
            return res.status(200).json({ ok: true });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: 'Revisá los datos del formulario.',
                details: errors.array().map((e) => ({
                    field: e.path,
                    message: e.msg,
                })),
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
            return res.status(400).json({
                ok: false,
                error: 'El email no es válido.',
            });
        }

        try {

            saveLead(lead);

            await sendLeadMail(lead);

            return res.status(201).json({
                ok: true,
                message: 'Solicitud recibida correctamente.',
            });

        } catch (err) {

            console.error('Error enviando correo:', err);

            return res.status(500).json({
                ok: false,
                message: 'No se pudo enviar el correo.',
            });

        }

    }
);

module.exports = router;