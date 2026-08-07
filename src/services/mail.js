// Railway bloquea el tráfico SMTP saliente (puertos 587/465), así que en vez
// de nodemailer usamos la API HTTP de Resend (https://resend.com), que viaja
// por el puerto 443 igual que cualquier request web y nunca queda bloqueada.
//
// Variables de entorno necesarias:
//   RESEND_API_KEY  -> la API key que te da Resend al crear la cuenta
//   MAIL_FROM       -> remitente. Mientras no verifiques un dominio propio en
//                      Resend, tenés que usar "onboarding@resend.dev" (su
//                      dirección de pruebas). Con dominio propio verificado,
//                      podés poner algo como "Nexxo Automation <hola@tudominio.com>".
//   NOTIFY_EMAIL    -> a qué email te llega el aviso de cada lead (ya existía).
//
// OJO con el modo sandbox: si NO verificaste un dominio propio en Resend,
// solo vas a poder mandar correos a la MISMA dirección con la que te
// registraste en Resend. Para mandar a cualquier NOTIFY_EMAIL hace falta
// verificar un dominio (gratis, tarda unos minutos, se hace desde el panel
// de Resend agregando registros DNS).

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendLeadMail(lead) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM || "onboarding@resend.dev";
    const to = process.env.NOTIFY_EMAIL;

    if (!apiKey) {
        throw new Error("Falta la variable de entorno RESEND_API_KEY.");
    }
    if (!to) {
        throw new Error("Falta la variable de entorno NOTIFY_EMAIL.");
    }

    try {
        console.log("Enviando correo vía Resend...");

        const res = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: from.includes("<") ? from : `Nexxo Automation <${from}>`,
                to: [to],
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
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("❌ Error enviando correo (Resend):", data);
            throw new Error(data?.message || "Error enviando correo con Resend.");
        }

        console.log("✅ Correo enviado:", data.id);

    } catch (err) {
        console.error("❌ Error enviando correo:");
        console.error(err);
        throw err;
    }
}

module.exports = { sendLeadMail };
