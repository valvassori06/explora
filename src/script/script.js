// Espera todo o conteúdo da página carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // --- DADOS FIXOS ---
  // Objeto com destinos e informações usadas no planner (objeto = estrutura chave→valor)
  const destinos = {
    // Cada cidade é uma chave do objeto com coordenadas, hospedagens e dicas
    'Foz do Iguaçu': {
      lat: -25.5161,                  // latitude (posição norte–sul)
      lon: -54.5850,                  // longitude (posição leste–oeste)
      hotels: [                       // lista de hotéis (nome + preço por diária)
        { nome: 'Hotel Cataratas', preco: 300 },
        { nome: 'Eco Hotel', preco: 250 },
        { nome: 'Pousada das Águas', preco: 200 }
      ],
      casas: [                        // lista de casas/apês (nome + preço por diária)
        { nome: 'Casa Iguaçu', preco: 180 },
        { nome: 'Apartamento Centro', preco: 150 },
        { nome: 'Casa das Flores', preco: 220 }
      ],
      dicas: [                        // dicas rápidas do destino
        'Visite as Cataratas e faça o passeio de barco.',
        'Capa de chuva para as trilhas.',
        'Parque das Aves e Marco das Três Fronteiras.',
        'Reserve um dia para Itaipu.'
      ]
    },

    // Demais cidades no mesmo padrão
    Curitiba: {
      lat: -25.4284,
      lon: -49.2733,
      hotels: [
        { nome: 'Hotel Jardim Botânico', preco: 220 },
        { nome: 'Curitiba Palace', preco: 280 },
        { nome: 'Pousada do Centro', preco: 180 },
      ],
      casas: [
        { nome: 'Casa Batel', preco: 160 },
        { nome: 'Apto Centro Cívico', preco: 140 },
        { nome: 'Casa Vista Alegre', preco: 170 },
      ],
      dicas: [
        'Jardim Botânico',
        'Trem Morretes',
        'MON e centro histórico',
        'Parques Barigui e Tanguá',
      ],
    },

    'Florianópolis': {
      lat: -27.5949,
      lon: -48.5482,
      hotels: [
        { nome: 'Hotel Beira-Mar', preco: 280 },
        { nome: 'Pousada Praia Mole', preco: 220 },
        { nome: 'Eco Hotel Lagoa', preco: 200 },
      ],
      casas: [
        { nome: 'Casa Jurerê', preco: 300 },
        { nome: 'Apto Lagoa', preco: 220 },
        { nome: 'Casa Campeche', preco: 250 },
      ],
      dicas: [
        'Joaquina e sandboard',
        'Lagoa da Conceição',
        'Trilhas Lagoinha do Leste',
        'Passeio Costa da Lagoa',
      ],
    },

    Gramado: {
      lat: -29.3750,
      lon: -50.8731,
      hotels: [
        { nome: 'Hotel das Hortênsias', preco: 320 },
        { nome: 'Pousada do Lago', preco: 260 },
        { nome: 'Hotel Alemão', preco: 280 },
      ],
      casas: [
        { nome: 'Chalé do Centro', preco: 200 },
        { nome: 'Casa Canela', preco: 180 },
        { nome: 'Casa Vale', preco: 220 },
      ],
      dicas: [
        'Lago Negro',
        'Mini Mundo',
        'Fondue',
        'Maria Fumaça',
      ],
    },

    'Brasília': {
      lat: -15.7939,
      lon: -47.8828,
      hotels: [
        { nome: 'Hotel Planalto', preco: 250 },
        { nome: 'Pousada Lago Paranoá', preco: 200 },
        { nome: 'Hotel Catedral', preco: 220 },
      ],
      casas: [
        { nome: 'Apto Asa Sul', preco: 180 },
        { nome: 'Casa Lago Norte', preco: 230 },
        { nome: 'Apto Asa Norte', preco: 190 },
      ],
      dicas: [
        'Catedral e Congresso',
        'Barco no Paranoá',
        'Parque da Cidade',
        'Arquitetura Niemeyer',
      ],
    },

    Salvador: {
      lat: -12.9718,
      lon: -38.5011,
      hotels: [
        { nome: 'Hotel Pelourinho', preco: 260 },
        { nome: 'Pousada Barra', preco: 240 },
        { nome: 'Hotel Farol', preco: 300 },
      ],
      casas: [
        { nome: 'Casa Itapuã', preco: 200 },
        { nome: 'Apto Rio Vermelho', preco: 180 },
        { nome: 'Casa Stella Maris', preco: 220 },
      ],
      dicas: [
        'Pelourinho e Elevador',
        'Pôr do sol Farol da Barra',
        'Acarajé',
        'Morro de São Paulo/Itaparica',
      ],
    },

    'Porto Seguro': {
      lat: -16.4513,
      lon: -39.0645,
      hotels: [
        { nome: 'Hotel Taperapuã', preco: 220 },
        { nome: 'Pousada Arraial', preco: 200 },
        { nome: 'Hotel Porto Plaza', preco: 240 },
      ],
      casas: [
        { nome: 'Casa Mutá', preco: 180 },
        { nome: 'Apto Arraial', preco: 170 },
        { nome: 'Casa Trancoso', preco: 250 },
      ],
      dicas: [
        'Centro Histórico',
        'Taperapuã',
        'Escuna para Arraial/Trancoso',
        'Tribo Pataxó',
      ],
    },

    Fortaleza: {
      lat: -3.7319,
      lon: -38.5267,
      hotels: [
        { nome: 'Hotel Beira Mar', preco: 270 },
        { nome: 'Pousada Iracema', preco: 230 },
        { nome: 'Hotel Praia do Futuro', preco: 250 },
      ],
      casas: [
        { nome: 'Casa Meireles', preco: 190 },
        { nome: 'Apto Mucuripe', preco: 170 },
        { nome: 'Casa Cumbuco', preco: 210 },
      ],
      dicas: [
        'Beira Mar e feira',
        'Praia do Futuro',
        'Dragão do Mar',
        'Jericoacoara (bate-volta)',
      ],
    },

    'São Paulo': {
      lat: -23.5505,
      lon: -46.6333,
      hotels: [
        { nome: 'Hotel Paulista', preco: 300 },
        { nome: 'Pousada Jardins', preco: 250 },
        { nome: 'Hotel Ibirapuera', preco: 280 },
      ],
      casas: [
        { nome: 'Apto Moema', preco: 200 },
        { nome: 'Casa Vila Madalena', preco: 230 },
        { nome: 'Apto Pinheiros', preco: 190 },
      ],
      dicas: [
        'Avenida Paulista',
        'Parque Ibirapuera',
        'Centro Histórico',
        'Gastronomia variada',
      ],
    },

    'Campos do Jordão': {
      lat: -22.7392,
      lon: -45.5914,
      hotels: [
        { nome: 'Hotel Capivari', preco: 260 },
        { nome: 'Pousada Araucárias', preco: 220 },
        { nome: 'Hotel Vila Inglesa', preco: 320 },
      ],
      casas: [
        { nome: 'Chalé Capivari', preco: 230 },
        { nome: 'Casa Abernéssia', preco: 200 },
        { nome: 'Chalé Alto do Capivari', preco: 270 },
      ],
      dicas: [
        'Capivari',
        'Teleférico',
        'Ducha de Prata',
        'Pedra do Baú',
      ],
    },

    'Rio de Janeiro': {
      lat: -22.9068,
      lon: -43.1729,
      hotels: [
        { nome: 'Hotel Copacabana', preco: 350 },
        { nome: 'Pousada Santa Teresa', preco: 240 },
        { nome: 'Hotel Ipanema', preco: 330 },
      ],
      casas: [
        { nome: 'Apto Botafogo', preco: 220 },
        { nome: 'Casa Santa Teresa', preco: 250 },
        { nome: 'Apto Leme', preco: 210 },
      ],
      dicas: [
        'Pão de Açúcar e Cristo',
        'Copacabana/Ipanema',
        'Lapa/Arcos',
        'Trilha Dois Irmãos',
      ],
    },
  };

  // --- ELEMENTOS (pega referências do HTML para manipular) ---
  const cepInput = document.getElementById('cepInput');                 // campo CEP
  const buscarCepBtn = document.getElementById('buscarCepBtn');         // botão de buscar CEP
  const enderecoInfo = document.getElementById('enderecoInfo');         // área de status/endereço
  const destinoSelect = document.getElementById('destinoSelect');       // select de destinos
  const noitesInput = document.getElementById('noitesInput');           // input nº de noites
  const stepDestination = document.getElementById('step-destination');  // seção: destino
  const stepStay = document.getElementById('step-stay');                // seção: hospedagem
  const hospedagemResultados = document.getElementById('hospedagemResultados'); // lista hospedagens
  const stepTransport = document.getElementById('step-transport');      // seção: transporte
  const numPessoasInput = document.getElementById('numPessoas');        // input nº de pessoas
  const transporteResultados = document.getElementById('transporteResultados'); // lista transporte
  const stepSummary = document.getElementById('step-summary');          // seção: resumo final
  const resumoDiv = document.getElementById('resumo');                  // bloco resumo
  const dicasDiv = document.getElementById('dicas');                    // bloco dicas
  const cta = document.getElementById('ctaComecar');                    // botão CTA “Começar”

  // Preenche o <select> com os nomes das cidades (Object.keys = pega as chaves do objeto)
  Object.keys(destinos).forEach((c) => {
    const op = document.createElement('option'); // cria <option>
    op.value = c;                                // valor da opção
    op.textContent = c;                          // texto visível
    destinoSelect.appendChild(op);               // insere no select
  });

  // Scroll suave até a seção “planejar” ao clicar no CTA (scrollIntoView = rolagem até um elemento)
  cta.addEventListener('click', () =>
    document.getElementById('planejar').scrollIntoView({ behavior: 'smooth' })
  );

  // Função para calcular distância entre dois pontos (fórmula de Haversine)
  function distanciaKm(a, b) {
    const R = 6371;                                                // raio da Terra (km)
    const dLat = (b.lat - a.lat) * Math.PI / 180;                  // diferença latitude em radianos
    const dLon = (b.lon - a.lon) * Math.PI / 180;                  // diferença longitude em radianos
    const s1 = Math.sin(dLat / 2) ** 2 +
               Math.cos(a.lat * Math.PI / 180) *
               Math.cos(b.lat * Math.PI / 180) *
               Math.sin(dLon / 2) ** 2;                            // parte do Haversine
    return R * 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));   // distância final em km
  }

  // Origem padrão (fallback = valor usado se não houver CEP válido)
  let origem = { cidade: 'São Paulo', lat: -23.5505, lon: -46.6333 };

  // Clique em “Buscar CEP”: consulta a API ViaCEP e atualiza origem
  buscarCepBtn.addEventListener('click', async () => {
    const cep = cepInput.value.replace(/\D/g, '');                 // remove tudo que não é número
    if (cep.length !== 8) {                                        // valida 8 dígitos
      enderecoInfo.textContent = 'CEP inválido. Digite 8 números.';
      enderecoInfo.style.color = '#b91c1c';                       // vermelho (erro)
      return;                                                      // interrompe a função
    }

    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`); // busca na API
      const j = await r.json();                                       // converte resposta para JSON
      if (j.erro) { throw new Error('CEP não encontrado'); }          // trata CEP inexistente

      origem.cidade = (j.localidade || 'São Paulo');                  // define cidade de origem
      // Se a cidade existe no objeto destinos, aproveita as coordenadas salvas
      if (destinos[origem.cidade]) {
        origem.lat = destinos[origem.cidade].lat;
        origem.lon = destinos[origem.cidade].lon;
      }

      // Mostra endereço formatado
      enderecoInfo.textContent = `Endereço: ${j.logradouro || ''} ${j.bairro || ''} - ${j.localidade}/${j.uf}`;
      enderecoInfo.style.color = '#065f46';                           // verde (sucesso)
      stepDestination.style.display = 'block';                        // revela próximo passo
    } catch (e) {
      // Em caso de falha na consulta, mantém SP como exemplo
      enderecoInfo.textContent = 'Não foi possível consultar o CEP agora. Usando São Paulo como origem (exemplo).';
      enderecoInfo.style.color = '#b45309';                           // laranja (aviso)
      stepDestination.style.display = 'block';                        // ainda assim libera próximo passo
    }
  });

  // Ao escolher um destino válido, exibe a etapa de hospedagem
  destinoSelect.addEventListener('change', () => {
    if (destinoSelect.value) { stepStay.style.display = 'block'; }
  });

  // Monta a lista de hospedagens (tipo = 'casa' ou 'hotel'; noites = nº de noites)
  function renderHospedagens(tipo, noites) {
    const d = destinos[destinoSelect.value];                          // pega dados do destino escolhido
    const lista = (tipo === 'casa' ? d.casas : d.hotels)              // escolhe fonte de dados
      .map(h => `<li><span>${h.nome}</span><span>R$ ${(h.preco * noites).toFixed(2)}</span></li>`) // calcula total
      .join('');                                                      // junta os itens em uma string HTML
    hospedagemResultados.innerHTML = `<h4>Opções:</h4><ul>${lista}</ul>`; // injeta no DOM (DOM = estrutura da página)
    stepTransport.style.display = 'block';                            // avança para transporte
  }

  // Liga os botões de hospedagem (dataset.type vem do atributo data-type do botão)
  document.querySelectorAll('.stayBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const noites = Math.max(1, parseInt(noitesInput.value || '1', 10)); // garante no mínimo 1 noite
      renderHospedagens(btn.dataset.type, noites);                         // renderiza conforme o tipo
    });
  });

  // Calcula e mostra o custo de transporte conforme o tipo escolhido
  function renderTransporte(tipo) {
    const d = destinos[destinoSelect.value]; if (!d) return;         // proteção: sem destino, sai
    const km = distanciaKm(                                          // calcula distância ida/volta
      { lat: origem.lat, lon: origem.lon },
      { lat: d.lat, lon: d.lon }
    );
    const pessoas = Math.max(1, parseInt(numPessoasInput.value || '1', 10)); // nº de viajantes

    let valor = 0, detalhe = '';                                     // total e descrição do cálculo

    if (tipo === 'carro') {                                          // simulação carro alugado
      const aluguelDia = 150;     // diária do carro (simulada)
      const consumoKmL = 12;      // consumo médio (km/l)
      const gasolina = 6.5;       // preço do litro (simulado)
      const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));
      const dias = noites + 1;    // ex.: 2 noites → 3 dias de aluguel
      const idaVolta = km * 2;    // distância ida e volta
      const litros = idaVolta / consumoKmL;                           // litros necessários
      valor = (aluguelDia * dias) + (litros * gasolina);              // custo total estimado
      detalhe = `Aluguel ${dias} dia(s) + gasolina p/ ${idaVolta.toFixed(0)} km.`;
    } else if (tipo === 'onibus') {                                   // simulação ônibus
      const tarifaKm = 0.35;                                          // tarifa por km (simulada)
      valor = km * 2 * tarifaKm * pessoas;                            // custo total ida/volta
      detalhe = `Ônibus ida/volta para ${pessoas} pessoa(s).`;
    } else {                                                          // simulação aéreo
      const base = 250;                                               // preço por pessoa (simulado)
      valor = base * pessoas;
      detalhe = `Aéreo promocional (simulado) para ${pessoas} pessoa(s).`;
    }

    const porPessoa = valor / pessoas;                                // rateio por pessoa

    // Atualiza a área de resultados do transporte com o total e o por pessoa
    transporteResultados.innerHTML = `
      <ul>
        <li><span>${tipo.toUpperCase()}</span><span>R$ ${valor.toFixed(2)} (R$ ${porPessoa.toFixed(2)}/pessoa)</span></li>
      </ul>
      <p>${detalhe}</p>`;
    stepSummary.style.display = 'block';                              // mostra etapa final (resumo)
  }

  // Liga os botões de transporte (carro/ônibus/avião)
  document.querySelectorAll('.transportBtn').forEach(btn => {
    btn.addEventListener('click', () => renderTransporte(btn.dataset.type));
  });

  // Observa quando a seção de resumo é exibida para preencher os dados finais
  const observer = new MutationObserver(() => {                       // MutationObserver = observa mudanças no DOM
    if (stepSummary.style.display === 'block') {                      // se o resumo estiver visível
      const destino = destinoSelect.value;                            // destino escolhido
      if (!destino) return;                                           // sem destino, sai
      const noites = Math.max(1, parseInt(noitesInput.value || '1', 10)); // nº de noites

      // Monta o HTML do resumo com origem, destino e nº de noites
      resumoDiv.innerHTML = `
        <p><strong>Origem:</strong> ${origem.cidade}</p>
        <p><strong>Destino:</strong> ${destino}</p>
        <p><strong>Noites:</strong> ${noites}</p>
      `;

      // Lista de dicas do destino escolhido
      const dicas = destinos[destino].dicas.map(d => `<li>${d}</li>`).join('');
      dicasDiv.innerHTML = `<p><strong>Dicas:</strong></p><ul>${dicas}</ul>`;
    }
  });

  // Começa a observar mudanças de atributo (style) na seção de resumo
  observer.observe(stepSummary, { attributes: true, attributeFilter: ['style'] });
});
