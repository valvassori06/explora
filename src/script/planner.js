// Espera todo o conteúdo da página carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // Cria um objeto (tipo uma lista organizada) com as cidades e seus dados
  const destinos = {
    // Cada cidade tem latitude, longitude, hotéis, casas e dicas de passeios
    'Foz do Iguaçu': { lat:-25.5161, lon:-54.5850,
      hotels:[{nome:'Hotel Cataratas',preco:300},{nome:'Eco Hotel',preco:250},{nome:'Pousada das Águas',preco:200}],
      casas:[{nome:'Casa Iguaçu',preco:180},{nome:'Apto Centro',preco:150},{nome:'Casa das Flores',preco:220}],
      dicas:['Cataratas do Iguaçu','Passeio de barco','Parque das Aves','Itaipu'] },

    // Repete a estrutura para cada destino
    'Curitiba': { lat:-25.4284, lon:-49.2733,
      hotels:[{nome:'Hotel Jardim Botânico',preco:220},{nome:'Curitiba Palace',preco:280},{nome:'Pousada do Centro',preco:180}],
      casas:[{nome:'Casa Batel',preco:160},{nome:'Apto Centro Cívico',preco:140},{nome:'Casa Vista Alegre',preco:170}],
      dicas:['Jardim Botânico','Trem Morretes','MON','Parques Barigui/Tanguá'] },

    'Florianópolis': { lat:-27.5949, lon:-48.5482,
      hotels:[{nome:'Hotel Beira-Mar',preco:280},{nome:'Pousada Praia Mole',preco:220},{nome:'Eco Hotel Lagoa',preco:200}],
      casas:[{nome:'Casa Jurerê',preco:300},{nome:'Apto Lagoa',preco:220},{nome:'Casa Campeche',preco:250}],
      dicas:['Joaquina','Lagoa da Conceição','Lagoinha do Leste','Costa da Lagoa'] },

    'Gramado': { lat:-29.3750, lon:-50.8731,
      hotels:[{nome:'Hotel das Hortênsias',preco:320},{nome:'Pousada do Lago',preco:260},{nome:'Hotel Alemão',preco:280}],
      casas:[{nome:'Chalé do Centro',preco:200},{nome:'Casa Canela',preco:180},{nome:'Casa Vale',preco:220}],
      dicas:['Lago Negro','Mini Mundo','Fondue','Maria Fumaça'] },

    'Brasília': { lat:-15.7939, lon:-47.8828,
      hotels:[{nome:'Hotel Planalto',preco:250},{nome:'Pousada Lago Paranoá',preco:200},{nome:'Hotel Catedral',preco:220}],
      casas:[{nome:'Apto Asa Sul',preco:180},{nome:'Casa Lago Norte',preco:230},{nome:'Apto Asa Norte',preco:190}],
      dicas:['Catedral/Congresso','Lago Paranoá','Parque da Cidade','Arquitetura'] },

    'Salvador': { lat:-12.9718, lon:-38.5011,
      hotels:[{nome:'Hotel Pelourinho',preco:260},{nome:'Pousada Barra',preco:240},{nome:'Hotel Farol',preco:300}],
      casas:[{nome:'Casa Itapuã',preco:200},{nome:'Apto Rio Vermelho',preco:180},{nome:'Casa Stella Maris',preco:220}],
      dicas:['Pelourinho','Farol da Barra','Acarajé','Morro de SP'] },

    'Porto Seguro': { lat:-16.4513, lon:-39.0645,
      hotels:[{nome:'Hotel Taperapuã',preco:220},{nome:'Pousada Arraial',preco:200},{nome:'Hotel Porto Plaza',preco:240}],
      casas:[{nome:'Casa Mutá',preco:180},{nome:'Apto Arraial',preco:170},{nome:'Casa Trancoso',preco:250}],
      dicas:['Centro Histórico','Praias','Escuna Arraial/Trancoso','Aldeia Pataxó'] },

    'Fortaleza': { lat:-3.7319, lon:-38.5267,
      hotels:[{nome:'Hotel Beira Mar',preco:270},{nome:'Pousada Iracema',preco:230},{nome:'Hotel Praia do Futuro',preco:250}],
      casas:[{nome:'Casa Meireles',preco:190},{nome:'Apto Mucuripe',preco:170},{nome:'Casa Cumbuco',preco:210}],
      dicas:['Beira Mar','Praia do Futuro','Dragão do Mar','Jeri (bate-volta)'] },

    'São Paulo': { lat:-23.5505, lon:-46.6333,
      hotels:[{nome:'Hotel Paulista',preco:300},{nome:'Pousada Jardins',preco:250},{nome:'Hotel Ibirapuera',preco:280}],
      casas:[{nome:'Apto Moema',preco:200},{nome:'Casa Vila Madalena',preco:230},{nome:'Apto Pinheiros',preco:190}],
      dicas:['Paulista','Ibirapuera','Centro Histórico','Gastronomia'] },

    'Campos do Jordão': { lat:-22.7392, lon:-45.5914,
      hotels:[{nome:'Hotel Capivari',preco:260},{nome:'Pousada Araucárias',preco:220},{nome:'Hotel Vila Inglesa',preco:320}],
      casas:[{nome:'Chalé Capivari',preco:230},{nome:'Casa Abernéssia',preco:200},{nome:'Chalé Alto do Capivari',preco:270}],
      dicas:['Capivari','Teleférico','Ducha de Prata','Pedra do Baú'] },

    'Rio de Janeiro': { lat:-22.9068, lon:-43.1729,
      hotels:[{nome:'Hotel Copacabana',preco:350},{nome:'Pousada Santa Teresa',preco:240},{nome:'Hotel Ipanema',preco:330}],
      casas:[{nome:'Apto Botafogo',preco:220},{nome:'Casa Santa Teresa',preco:250},{nome:'Apto Leme',preco:210}],
      dicas:['Pão de Açúcar','Cristo','Praias','Dois Irmãos'] },
  };

  // Pega elementos da página pelo ID (getElementById)
  const cepInput = document.getElementById('cepInput');
  const buscarCepBtn = document.getElementById('buscarCepBtn');
  const enderecoInfo = document.getElementById('enderecoInfo');
  const destinoSelect = document.getElementById('destinoSelect');
  const noitesInput = document.getElementById('noitesInput');
  const stepDestination = document.getElementById('step-destination');
  const stepStay = document.getElementById('step-stay');
  const hospedagemResultados = document.getElementById('hospedagemResultados');
  const stepTransport = document.getElementById('step-transport');
  const numPessoasInput = document.getElementById('numPessoas');
  const transporteResultados = document.getElementById('transporteResultados');
  const stepSummary = document.getElementById('step-summary');
  const resumoDiv = document.getElementById('resumo');
  const dicasDiv = document.getElementById('dicas');

  // Preenche o menu de seleção de destinos com as cidades do objeto
  Object.keys(destinos).forEach(c=>{
    const op=document.createElement('option'); // cria um item de opção
    op.value=c; // define o valor
    op.textContent=c; // define o texto exibido
    destinoSelect.appendChild(op); // adiciona no menu
  });

  // Função para calcular a distância entre duas cidades usando a fórmula de Haversine (distância entre coordenadas)
  function distanciaKm(a,b){
    const R=6371; // raio da Terra em km
    const dLat=(b.lat-a.lat)*Math.PI/180; // diferença de latitude em radianos
    const dLon=(b.lon-a.lon)*Math.PI/180; // diferença de longitude em radianos
    const s1=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(s1),Math.sqrt(1-s1)); // resultado final em km
  }

  // Define a cidade de origem padrão (fallback = valor usado caso não ache outro)
  let origem={cidade:'São Paulo', lat:-23.5505, lon:-46.6333};

  // Ao clicar no botão de buscar CEP, executa essa função assíncrona (async = que espera a resposta)
  buscarCepBtn.addEventListener('click', async ()=>{
    const cep = (cepInput.value||'').replace(/\D/g,''); // pega o CEP e tira tudo que não é número
    if(cep.length!==8){ // verifica se tem 8 números
      enderecoInfo.textContent='CEP inválido. Digite 8 números.';
      enderecoInfo.style.color='#b91c1c';
      return; // sai da função
    }
    try{
      // Busca os dados do CEP no site ViaCEP (API pública)
      const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j=await r.json(); // transforma a resposta em JSON (formato de dados)
      if(j.erro) throw new Error('CEP não encontrado'); // caso o CEP não exista

      // Atualiza a cidade de origem com o nome do local retornado
      origem.cidade=j.localidade||'São Paulo';
      // Se essa cidade estiver na lista de destinos, pega as coordenadas
      if(destinos[origem.cidade]){
        origem.lat=destinos[origem.cidade].lat;
        origem.lon=destinos[origem.cidade].lon;
      }

      // Mostra o endereço na tela
      enderecoInfo.textContent=`Endereço: ${(j.logradouro||'')} ${(j.bairro||'')} - ${j.localidade}/${j.uf}`;
      enderecoInfo.style.color='#065f46'; // cor verde
    }catch(e){
      // Se der erro, usa São Paulo como exemplo
      enderecoInfo.textContent='Não foi possível consultar o CEP agora. Usando São Paulo como origem (exemplo).';
      enderecoInfo.style.color='#b45309'; // cor laranja
    }
    stepDestination.style.display='block'; // mostra o próximo passo (escolher destino)
  });

  // Quando o usuário escolhe um destino, mostra o passo de hospedagem
  destinoSelect.addEventListener('change', ()=>{
    if(destinoSelect.value){ stepStay.style.display='block'; }
  });

  // Função que mostra os resultados de hospedagem
  function renderHospedagens(tipo,noites){
    const d=destinos[destinoSelect.value]; // pega o destino escolhido
    if(!d) return; // se não tiver destino, sai
    // Cria a lista com nome e preço multiplicado pelo número de noites
    const lista=(tipo==='casa'? d.casas : d.hotels)
      .map(h=>`<li><span>${h.nome}</span><span>R$ ${(h.preco*noites).toFixed(2)}</span></li>`).join('');
    hospedagemResultados.innerHTML=`<h4>Opções:</h4><ul>${lista}</ul>`; // mostra no HTML
    stepTransport.style.display='block'; // mostra o passo de transporte
  }

  // Liga os botões de hospedagem (hotel ou casa)
  document.querySelectorAll('.stayBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10)); // pega o número de noites
      renderHospedagens(btn.dataset.type,noites); // chama a função com o tipo escolhido
    });
  });

  // Função para calcular e mostrar o transporte
  function renderTransporte(tipo){
    const d=destinos[destinoSelect.value]; if(!d) return;
    const km=distanciaKm({lat:origem.lat,lon:origem.lon},{lat:d.lat,lon:d.lon}); // calcula distância
    const pessoas=Math.max(1,parseInt(numPessoasInput.value||'1',10)); // pega o número de pessoas
    let valor=0,detalhe=''; // cria variáveis para preço e descrição

    // Se o transporte for carro
    if(tipo==='carro'){
      const aluguel=150, consumoKmL=12, gasolina=6.5;
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10));
      const dias=noites+1; // conta os dias da viagem
      const idaVolta=km*2; // ida e volta
      const litros=idaVolta/consumoKmL; // calcula combustível
      valor=(aluguel*dias)+(litros*gasolina); // valor total
      detalhe=`Aluguel ${dias} dia(s) + gasolina p/ ${idaVolta.toFixed(0)} km.`;
    }
    // Se for ônibus
    else if(tipo==='onibus'){
      const tarifaKm=0.35;
      valor=km*2*tarifaKm*pessoas;
      detalhe=`Ônibus ida/volta para ${pessoas} pessoa(s).`;
    }
    // Se for avião
    else{
      const base=250;
      valor=base*pessoas;
      detalhe=`Aéreo promocional (simulado) para ${pessoas} pessoa(s).`;
    }

    const porPessoa=valor/pessoas; // divide o valor total por pessoa
    // Mostra o resultado no HTML
    transporteResultados.innerHTML=`<ul><li><span>${tipo.toUpperCase()}</span><span>R$ ${valor.toFixed(2)} (R$ ${porPessoa.toFixed(2)}/pessoa)</span></li></ul><p>${detalhe}</p>`;
    stepSummary.style.display='block'; // mostra o resumo final
  }

  // Liga os botões de transporte (carro, ônibus, avião)
  document.querySelectorAll('.transportBtn').forEach(btn=>{
    btn.addEventListener('click',()=>renderTransporte(btn.dataset.type));
  });

  // Observa quando o resumo for exibido (MutationObserver = observa mudanças no HTML)
  const observer=new MutationObserver(()=>{
    if(stepSummary.style.display==='block'){
      const destino=destinoSelect.value; if(!destino) return;
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10));

      // Mostra o resumo das escolhas (origem, destino e noites)
      resumoDiv.innerHTML=`<p><strong>Origem:</strong> ${origem.cidade}</p><p><strong>Destino:</strong> ${destino}</p><p><strong>Noites:</strong> ${noites}</p>`;

      // Mostra as dicas turísticas do destino
      dicasDiv.innerHTML=`<p><strong>Lugares turísticos da cidade</strong></p>
      <ul style="padding-left: 2vh;">${destinos[destino].dicas.map(d=>`<li>${d}</li>`).join('')}</ul>`;
    }
  });

  // Ativa o observador para monitorar mudanças no estilo do resumo (para saber quando aparece)
  observer.observe(stepSummary,{attributes:true,attributeFilter:['style']});
});
