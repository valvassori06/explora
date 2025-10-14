// Espera o conteúdo da página ser totalmente carregado antes de rodar o código
document.addEventListener('DOMContentLoaded', ()=>{

  // Pega o nome do arquivo atual do endereço da página (por exemplo: "index.html")
  // "location.pathname" é o caminho da URL
  // "split('/')" separa o caminho em partes
  // "pop()" pega a última parte (o nome do arquivo)
  // se não houver nada, assume que o nome é "index.html"
  const here = location.pathname.split('/').pop() || 'index.html';

  // Seleciona todos os links (<a>) que estão dentro do menu de navegação (.navbar nav)
  document.querySelectorAll('.navbar nav a').forEach(a=>{

    // Pega o valor do atributo "href" de cada link (ou seja, o destino do link)
    const href = a.getAttribute('href');

    // Verifica se o link corresponde à página atual
    // - "here === ''" significa que estamos na página inicial (sem nome no caminho)
    // - "href === 'index.html'" significa o link da página inicial
    // - "href === here" verifica se o link é igual ao nome da página atual
    if ((here === '' && href==='index.html') || href === here){

      // Se for o link da página atual, sublinha o texto (textDecoration = "underline")
      a.style.textDecoration = 'underline';
    }
  });
});
