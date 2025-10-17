// animação dos painéis
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

try {
  signUpButton?.addEventListener('click', () => container.classList.add('right-panel-active'));
  signInButton?.addEventListener('click', () => container.classList.remove('right-panel-active'));
} catch { /* ignore */ }

const API = 'http://localhost:3000';

// ===== CADASTRO
async function cadastrar(e) {
  e.preventDefault();
  const name  = document.querySelector('#cad-nome')?.value.trim();
  const email = document.querySelector('#cad-email')?.value.trim();
  const password = document.querySelector('#cad-senha')?.value;

  if (!name || !email || !password) return alert('Preencha todos os campos do cadastro.');

  try {
    const r = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erro no cadastro');

    localStorage.setItem('token', data.token);
    alert('Cadastro concluído! Faça login para continuar.');
  } catch (err) {
    alert(err.message);
  }
}

// ===== LOGIN
async function logar(e) {
  e.preventDefault();
  const email = document.querySelector('#log-email')?.value.trim();
  const password = document.querySelector('#log-senha')?.value;

  if (!email || !password) return alert('Informe e-mail e senha.');

  try {
    const r = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Erro no login');

    localStorage.setItem('token', data.token);
    alert(`Bem-vindo, ${data.user.name}!`);
  } catch (err) {
    alert(err.message);
  }
}

// ===== ESQUECEU A SENHA
document.querySelector('#forgot-link')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = prompt('Digite o e-mail cadastrado:')?.trim();
  if (!email) return;

  try {
    const r = await fetch(`${API}/api/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!r.ok) {
      const { error } = await r.json().catch(() => ({}));
      throw new Error(error || 'Erro ao solicitar redefinição.');
    }
    alert('Verifique o terminal da API para o link de redefinição.');
  } catch (err) {
    alert(err.message);
  }
});

// liga os forms
document.querySelector('#form-cadastro')?.addEventListener('submit', cadastrar);
document.querySelector('#form-login')?.addEventListener('submit', logar);
