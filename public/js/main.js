// --- formulario de contacto ---
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

function setMsg(text, kind) {
    formMsg.textContent = text;
    formMsg.className = `form-msg ${kind || ''}`;
}

function clearFieldErrors() {
    form.querySelectorAll('.invalid').forEach((el) => {
        el.classList.remove('invalid');
    });
}

form.addEventListener('submit', (e) => {

    e.preventDefault();

    clearFieldErrors();
    setMsg('', '');

    const nombre = form.nombre.value.trim();
    const empresa = form.empresa.value.trim();
    const email = form.email.value.trim();
    const equipo = form.equipo.value;
    const alcance = form.alcance.value;
    const mensaje = form.mensaje.value.trim();

    if (nombre.length < 2) {
        form.nombre.classList.add('invalid');
        setMsg('Ingresá tu nombre.', 'error');
        return;
    }

    if (empresa.length < 2) {
        form.empresa.classList.add('invalid');
        setMsg('Ingresá el nombre de tu empresa.', 'error');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.email.classList.add('invalid');
        setMsg('Ingresá un email válido.', 'error');
        return;
    }

    const subject = encodeURIComponent(
        `Consulta Nexxo Automation - ${empresa}`
    );

    const body = encodeURIComponent(
`Hola Enzo,

Quiero solicitar un diagnóstico.

Nombre: ${nombre}

Empresa: ${empresa}

Email: ${email}

Equipo:
${equipo}

Alcance:
${alcance}

Mensaje:

${mensaje}`
    );

    window.location.href =
        `mailto:NexoInformationTechnologies@gmail.com?subject=${subject}&body=${body}`;

    submitBtn.textContent = 'Abriendo correo...';

    setTimeout(() => {

        submitBtn.textContent = 'Solicitar el diagnóstico';
        submitBtn.disabled = false;

        setMsg(
            'Si no se abrió tu aplicación de correo, escribinos por WhatsApp.',
            'success'
        );

        form.reset();

    }, 1500);

});