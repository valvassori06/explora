const crypto = require('crypto');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// ===== Middlewares
app.use(express.json());
app.use(cors());

// ===== Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Teste rápido de conexão com DB na inicialização para dar feedback imediato
pool.query('SELECT 1')
  .then(() => console.log('✅ Conexão com Postgres OK'))
  .catch((err) => console.error('❌ Falha ao conectar no Postgres:', err.stack || err));

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
    const { rows } = await pool.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,created_at',
      [name, email, hash]
    );
    const user = rows[0];
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

    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const u = rows[0];
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

    await pool.query(
      'INSERT INTO feedbacks (name,email,message) VALUES ($1,$2,$3)',
      [name || null, email || null, message]
    );

    console.log('✅ Feedback salvo no banco');
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

    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [norm]);
    const user = rows[0];

    // responde OK sempre; só gera link se existir usuário
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await pool.query(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)',
        [user.id, token, expires]
      );

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

    const { rows } = await pool.query(
      'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token=$1',
      [token]
    );
    const pr = rows[0];

    if (!pr || pr.used_at || new Date(pr.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, pr.user_id]);
    await pool.query('UPDATE password_resets SET used_at=now() WHERE id=$1', [pr.id]);

    res.json({ ok: true });
  } catch (e) {
    console.error(e.stack || e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ===== Start
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
