const crypto = require('crypto');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// ===== Middlewares
app.use(express.json());
app.use(cors());

// ===== Local JSON storage
const DATA_FILE = path.join(__dirname, 'data.json');

async function readData() {
  const txt = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(txt);
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// quick check that data file exists and is valid
(async () => {
  try {
    await readData();
    console.log('✅ Data file OK');
  } catch (e) {
    console.error('❌ Data file missing or invalid:', e.message || e);
  }
})();

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
    const data = await readData();
    // check existing
    if (data.users.find((u) => u.email === email)) {
      return res.status(409).json({ error: 'e-mail já cadastrado' });
    }
    const id = (data.users[data.users.length - 1]?.id || 0) + 1;
    const created_at = new Date().toISOString();
    const user = { id, name, email, password_hash: hash, created_at };
    data.users.push(user);
    await writeData(data);
    res.status(201).json({ user: { id, name, email, created_at }, token: signToken(user) });
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

  const data = await readData();
  const u = data.users.find((x) => x.email === email);
  if (!u) return res.status(401).json({ error: 'credenciais inválidas' });

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

    const data = await readData();
    const id = (data.feedbacks[data.feedbacks.length - 1]?.id || 0) + 1;
    const created_at = new Date().toISOString();
    data.feedbacks.push({ id, name: name || null, email: email || null, message, created_at });
    await writeData(data);

    console.log('✅ Feedback salvo localmente');
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

    const data = await readData();
    const user = data.users.find((u) => u.email === norm);

    // responde OK sempre; só gera link se existir usuário
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

      const id = (data.password_resets[data.password_resets.length - 1]?.id || 0) + 1;
      data.password_resets.push({ id, user_id: user.id, token, expires_at: expires, used_at: null });
      await writeData(data);

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

    const data = await readData();
    const pr = data.password_resets.find((p) => p.token === token);

    if (!pr || pr.used_at || new Date(pr.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = data.users.find((u) => u.id === pr.user_id);
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });
    user.password_hash = hash;
    pr.used_at = new Date().toISOString();
    await writeData(data);

    res.json({ ok: true });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ===== Start
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
