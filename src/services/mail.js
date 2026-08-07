const nodemailer = require("nodemailer");
const dns = require("dns");

// Fuerza a Node.js a usar IPv4 antes que IPv6
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

    family: 4,

    tls: {
        rejectUnauthorized: false,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

async function sendLeadMail(lead) {

    try {

        console.log("Verificando conexión SMTP...");

        await transporter.verify();

        console.log("✅ SMTP conectado correctamente");

        const info = await transporter.sendMail({
            from: `"Nexxo Automation" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFY_EMAIL,

            subject: `🚀 Nuevo contacto - ${lead.nombre}`,

            html: `
                <h2>Nuevo contacto desde Nexxo Automation</h2>

                <p><b>Nombre:</b> ${lead.nombre}</p>
                <p><b>Empresa:</b> ${lead.empresa}</p>
                <p><b>Email:</b> ${lead.email}</p>
                <p><b>Equipo:</b> ${lead.equipo}</p>
                <p><b>Alcance:</b> ${lead.alcance}</p>

                <hr>

                <p>${lead.mensaje}</p>
            `,
        });

        console.log("✅ Correo enviado");
        console.log(info);

    } catch (err) {

        console.error("❌ Error enviando correo:");
        console.error(err);

        throw err;

    }

}

module.exports = { sendLeadMail };