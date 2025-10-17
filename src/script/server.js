const crypto = require('crypto');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const initSqlJs = require('sql.js');

const app = express();

// ===== Middlewares
app.use(express.json());
app.use(cors());

// ===== SQL.js local storage (database file inside project)
const DB_FILE = path.join(__dirname, 'database.sqlite');
let SQL; // initSqlJs instance
let db; // sql.js Database instance

async function initDatabase() {
  SQL = await initSqlJs();
  // load existing file if present
  try {
    const file = await fs.readFile(DB_FILE);
    db = new SQL.Database(new Uint8Array(file));
    console.log('✅ Loaded existing SQLite file', DB_FILE);
  } catch (e) {
    db = new SQL.Database();
    console.log('ℹ️ No existing DB file, created in-memory DB');
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // persist DB to file
  // If there's existing JSON data, migrate it into SQLite (one-time)
  const DATA_FILE = path.join(__dirname, 'data.json');
  try {
    const txt = await fs.readFile(DATA_FILE, 'utf8');
    const json = JSON.parse(txt);
    // migrate users
    if (Array.isArray(json.users) && json.users.length > 0) {
      const cur = db.exec('SELECT COUNT(1) as c FROM users');
      const existing = (cur[0] && cur[0].values && cur[0].values[0] && cur[0].values[0][0]) || 0;
      if (!existing) {
        const insUser = db.prepare('INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)');
        for (const u of json.users) {
          try { insUser.run([u.id, u.name, u.email, u.password_hash, u.created_at]); } catch (e) { /* ignore */ }
        }
        // adjust sqlite_sequence
        const maxId = db.exec('SELECT MAX(id) as m FROM users')[0]?.values[0][0] || 0;
        if (maxId) db.run(`INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('users', ${maxId})`);
        console.log(`ℹ️ Migrated ${json.users.length} users from data.json`);
      }
    }
    // migrate feedbacks
    if (Array.isArray(json.feedbacks) && json.feedbacks.length > 0) {
      const curF = db.exec('SELECT COUNT(1) as c FROM feedbacks');
      const existingF = (curF[0] && curF[0].values && curF[0].values[0] && curF[0].values[0][0]) || 0;
      if (!existingF) {
        const insF = db.prepare('INSERT OR IGNORE INTO feedbacks (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)');
        for (const f of json.feedbacks) {
          try { insF.run([f.id, f.name, f.email, f.message, f.created_at]); } catch (e) { /* ignore */ }
        }
        const maxF = db.exec('SELECT MAX(id) as m FROM feedbacks')[0]?.values[0][0] || 0;
        if (maxF) db.run(`INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('feedbacks', ${maxF})`);
        console.log(`ℹ️ Migrated ${json.feedbacks.length} feedbacks from data.json`);
      }
    }
    // migrate password_resets
    if (Array.isArray(json.password_resets) && json.password_resets.length > 0) {
      const curP = db.exec('SELECT COUNT(1) as c FROM password_resets');
      const existingP = (curP[0] && curP[0].values && curP[0].values[0] && curP[0].values[0][0]) || 0;
      if (!existingP) {
        const insP = db.prepare('INSERT OR IGNORE INTO password_resets (id, user_id, token, expires_at, used_at) VALUES (?, ?, ?, ?, ?)');
        for (const p of json.password_resets) {
          try { insP.run([p.id, p.user_id, p.token, p.expires_at, p.used_at]); } catch (e) { /* ignore */ }
        }
        const maxP = db.exec('SELECT MAX(id) as m FROM password_resets')[0]?.values[0][0] || 0;
        if (maxP) db.run(`INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('password_resets', ${maxP})`);
        console.log(`ℹ️ Migrated ${json.password_resets.length} password_resets from data.json`);
      }
    }
  } catch (e) {
    /* no data.json or parse error - ignore */
  }

  await persistDb();
  console.log('✅ SQL.js DB initialized at', DB_FILE);
}

async function persistDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  await fs.writeFile(DB_FILE, buffer);
}

// ===== Helpers
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

// ===== Auth: register
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'dados obrigatórios' });
    }

    const hash = await bcrypt.hash(password, 12);
    // check existing
  // check existing
  const sel = db.prepare('SELECT id FROM users WHERE email = ?');
  const exists = sel.getAsObject([email]).id;
  if (exists) return res.status(409).json({ error: 'e-mail já cadastrado' });

  const created_at = new Date().toISOString();
  const insert = db.prepare('INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)');
  insert.run([name, email, hash, created_at]);
  const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
  await persistDb();
  const user = { id, name, email, created_at };
  res.status(201).json({ user, token: signToken(user) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'e-mail já cadastrado' });
    console.error(e);
    res.status(500).json({ error: 'erro interno' });
  }
});

// ===== Auth: login
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = String(req.body?.password || '');

  const sel = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?');
  const uobj = sel.getAsObject([email]);
  if (!uobj || !uobj.id) return res.status(401).json({ error: 'credenciais inválidas' });
  const u = { id: uobj.id, name: uobj.name, email: uobj.email, password_hash: uobj.password_hash };

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'credenciais inválidas' });

  res.json({ user: { id: u.id, name: u.name, email: u.email }, token: signToken(u) });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'erro interno' });
  }
});

// ===== Feedback

// ===== Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('📩 Feedback recebido:', req.body);

    const { name, email, message } = req.body;

    if (!message) return res.status(400).json({ error: 'mensagem obrigatória' });

  const created_at = new Date().toISOString();
  db.prepare('INSERT INTO feedbacks (name, email, message, created_at) VALUES (?, ?, ?, ?)').run([name || null, email || null, message, created_at]);
  await persistDb();
  console.log('✅ Feedback salvo no SQLite');
  res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'erro interno' });
  }
});

// ===== Forgot password (gera token e imprime link no terminal)
app.post('/api/auth/forgot', async (req, res) => {
  try {
    const norm = String(req.body?.email || '').toLowerCase().trim();
    if (!norm) return res.status(400).json({ error: 'E-mail obrigatório' });

    console.log('POST /api/auth/forgot ->', norm);

  const selUser = db.prepare('SELECT id FROM users WHERE email = ?');
  const uobj = selUser.getAsObject([norm]);
  const user = uobj && uobj.id ? { id: uobj.id } : null;

    // responde OK sempre; só gera link se existir usuário
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

  db.prepare('INSERT INTO password_resets (user_id, token, expires_at, used_at) VALUES (?, ?, ?, NULL)').run([user.id, token, expires]);
  await persistDb();

      const resetUrl = `http://127.0.0.1:5501/src/views/reset.html?token=${token}`;
      console.log('🔗 Link de redefinição:', resetUrl);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ===== Reset password (consome token)
app.post('/api/auth/reset', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');

    if (!token || !password) return res.status(400).json({ error: 'Dados obrigatórios' });

    const selPr = db.prepare('SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token = ?');
    const prObj = selPr.getAsObject([token]);
    if (!prObj || !prObj.id || prObj.used_at || new Date(prObj.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 12);
    const selUserById = db.prepare('SELECT id FROM users WHERE id = ?');
    const userObj = selUserById.getAsObject([prObj.user_id]);
    if (!userObj || !userObj.id) return res.status(400).json({ error: 'Usuário não encontrado' });
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run([hash, prObj.user_id]);
    db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run([new Date().toISOString(), prObj.id]);
    await persistDb();

    res.json({ ok: true });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ===== Start
const PORT = Number(process.env.PORT || 3000);
(async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
  } catch (e) {
    console.error('Erro ao inicializar DB:', e);
    process.exit(1);
  }
})();
