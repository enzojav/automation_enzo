const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendLeadMail(lead) {
    await transporter.sendMail({
        from: `"Nexxo Automation" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `🚀 Nuevo contacto - ${lead.name}`,
        html: `
            <h2>Nuevo contacto</h2>

            <p><b>Nombre:</b> ${lead.name}</p>
            <p><b>Email:</b> ${lead.email}</p>
            <p><b>Empresa:</b> ${lead.company}</p>
            <p><b>Teléfono:</b> ${lead.phone}</p>

            <hr>

            <p>${lead.message}</p>
        `,
    });
}

module.exports = { sendLeadMail };