const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'leads.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf8');
}

/**
 * Guarda un lead ya sanitizado. En producción, esto se reemplaza por un
 * insert a una base de datos (Postgres, etc.) — se deja como archivo
 * local para que el proyecto corra sin infraestructura extra.
 */
function saveLead(lead) {
  ensureStore();
  const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  current.push({ ...lead, receivedAt: new Date().toISOString() });
  fs.writeFileSync(FILE, JSON.stringify(current, null, 2), 'utf8');
}

module.exports = { saveLead };
