console.log("✅ feedback.js carregado com sucesso!");
const API = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('fb-name').value.trim();
    const email = document.getElementById('fb-email').value.trim();
    const message = document.getElementById('fb-message').value.trim();

    if (!message) {
      alert('Escreva sua mensagem.');
      return;
    }

    try {
      const r = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (!r.ok) {
        const { error } = await r.json().catch(() => ({}));
        throw new Error(error || 'Erro ao enviar feedback');
      }

      form.reset();
      alert('Obrigado! Seu feedback foi enviado.');
    } catch (err) {
      alert(err.message);
    }
  });
});
