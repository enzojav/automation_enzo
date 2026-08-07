// --- header con fondo al hacer scroll ---
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// --- iconos lucide ---
if (window.lucide) lucide.createIcons();

// --- reveal on scroll ---
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// --- contadores animados ---
const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('es-AR');
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach((el) => countObserver.observe(el));

// --- proceso: cards clickeables, actualizan el entregable ---
const PROCESS_DELIVERABLES = [
  ['Descubrimiento', 'Nos sentamos con tu equipo y mapeamos cómo se mueve el trabajo hoy: cada traspaso, planilla y copiar-pegar.'],
  ['Diseño', 'Elegimos el cambio más pequeño con el mayor efecto y acordamos en números qué significa "listo".'],
  ['Construcción', 'Conectores, lógica y pasos de IA sobre los sistemas que ya tienes. Sin reemplazar nada.'],
  ['Operación', 'Monitoreo, traspaso de propiedad y una revisión trimestral de qué eliminar después.'],
];
const processCards = document.querySelectorAll('.process-card');
const processDeliverable = document.getElementById('processDeliverable');
processCards.forEach((card) => {
  card.addEventListener('click', () => {
    processCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    const [title, text] = PROCESS_DELIVERABLES[card.dataset.step];
    processDeliverable.innerHTML = `<strong>Entregable de ${title} —</strong> ${text}`;
  });
});

// --- integraciones: tabs ---
const INTEGRATION_GROUPS = {
  negocio: ['Salesforce', 'HubSpot', 'Dynamics 365', 'SAP', 'Odoo', 'NetSuite'],
  entorno: ['Microsoft 365', 'Google Workspace', 'Teams', 'Slack', 'SharePoint', 'WhatsApp Business'],
  datos: ['SQL Server', 'PostgreSQL', 'BigQuery', 'Power BI', 'Azure OpenAI', 'Claude'],
};
const integrationTabs = document.querySelectorAll('#integrationTabs .tab');
const integrationsGrid = document.getElementById('integrationsGrid');

function renderIntegrations(group) {
  integrationsGrid.innerHTML = INTEGRATION_GROUPS[group]
    .map((name) => `<div class="integration-chip"><i data-lucide="plug-zap"></i><span>${name}</span></div>`)
    .join('');
  if (window.lucide) lucide.createIcons();
}
integrationTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    integrationTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    renderIntegrations(tab.dataset.group);
  });
});
renderIntegrations('negocio');

// --- formulario de contacto: validación básica + envío real al backend ---
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

function setMsg(text, kind) {
  formMsg.textContent = text;
  formMsg.className = `form-msg ${kind || ''}`;
}

function clearFieldErrors() {
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}


  e.preventDefault();
  clearFieldErrors();
  setMsg('', '');

  const nombre = form.nombre.value.trim();
  const empresa = form.empresa.value.trim();
  const email = form.email.value.trim();
  const equipo = form.equipo.value;
  const alcance = form.alcance.value;
  const mensaje = form.mensaje.value.trim();
  const checklist = form.checklist.checked;

  // Validación básica del lado del cliente. La validación real,
  // que no se puede saltear, vuelve a hacerse en el servidor.
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
        `mailto:TUEMAIL@gmail.com?subject=${subject}&body=${body}`;

    submitBtn.textContent = 'Abriendo correo...';

    setTimeout(() => {

        submitBtn.textContent = 'Solicitar el diagnóstico';
        form.reset();

        setMsg(
            'Si no se abrió ninguna aplicación de correo, escribinos por WhatsApp.',
            'success'
        );

    }, 1500);

});