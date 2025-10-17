console.log("✅ feedback.js carregado com sucesso!");

// API: usa localhost durante desenvolvimento (ou file://), caso contrário usa rota relativa
const API = (['localhost', '127.0.0.1', ''].includes(location.hostname))
  ? 'http://localhost:3000/api/feedback'
  : '/api/feedback';

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
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (!r.ok) {
        const payload = await r.json().catch(() => ({}));
        const errMsg = payload?.error || payload?.message || 'Erro ao enviar feedback';
        throw new Error(errMsg);
      }

      form.reset();
      alert('Obrigado! Seu feedback foi enviado.');
    } catch (err) {
      console.log('Erro ao enviar feedback:', err);
      alert(err.message || 'Não foi possível enviar o feedback.');
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
