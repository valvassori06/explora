const API = 'http://localhost:3000';

// pega o token da URL ?token=...
const params = new URLSearchParams(location.search);
const token = params.get('token');

if (!token) {
  alert('Link inválido. Solicite uma nova redefinição.');
  location.href = '../views/cadastro.html';
}

document.querySelector('#form-reset')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const pass1 = document.querySelector('#pass1').value;
  const pass2 = document.querySelector('#pass2').value;

  if (pass1.length < 6) return alert('A senha deve ter pelo menos 6 caracteres.');
  if (pass1 !== pass2) return alert('As senhas não conferem.');

  try {
    const r = await fetch(`${API}/api/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ token, password: pass1 })
    });

    if (!r.ok) {
      const { error } = await r.json().catch(() => ({}));
      throw new Error(error || 'Erro ao redefinir a senha');
    }

    alert('Senha alterada com sucesso! Faça login novamente.');
    location.href = '../views/cadastro.html';
  } catch (err) {
    alert(err.message);
  }
});
