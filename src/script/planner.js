// /src/script/planner.js
// Espera todo o conteúdo da página carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // ===== util: busca CEP (ViaCEP + fallbacks) =====
  async function buscarCEPAny(cepInput) {
    const cep = String(cepInput || '').replace(/\D/g, '');
    if (cep.length !== 8) throw new Error('CEP inválido. Digite 8 números.');

    // 1) ViaCEP
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!r.ok) throw new Error('Falha ViaCEP');
      const d = await r.json();
      if (d.erro) throw new Error('CEP não encontrado');
      return {
        cep: d.cep,
        logradouro: d.logradouro || '',
        bairro: d.bairro || '',
        cidade: d.localidade || '',
        uf: d.uf || ''
      };
    } catch (_) {
      // continua para fallbacks
    }

    // 2) Fallback: AwesomeAPI
    try {
      const r2 = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
      if (!r2.ok) throw new Error('Falha AwesomeAPI');
      const d2 = await r2.json();
      return {
        cep: d2.cep || cep,
        logradouro: d2.address || '',
        bairro: d2.district || '',
        cidade: d2.city || '',
        uf: d2.state || ''
      };
    } catch (_) {
      // continua para próximo fallback
    }

    // 3) Fallback adicional: BrasilAPI
    try {
      const r3 = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!r3.ok) throw new Error('Falha BrasilAPI');
      const d3 = await r3.json();
      return {
        cep: d3.cep,
        logradouro: d3.street || '',
        bairro: d3.neighborhood || '',
        cidade: d3.city || '',
        uf: d3.state || ''
      };
    } catch (_) {
      throw new Error('CEP não encontrado em nenhuma base disponível.');
    }
  }

  // ===== util: geocodifica cidade/UF para lat/lon (Nominatim/OSM) =====
  async function geocodeCityUF(cidade, uf) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=Brazil&city=${encodeURIComponent(cidade)}&state=${encodeURIComponent(uf)}`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('Falha ao geocodar origem');
    const arr = await r.json();
    if (!arr?.length) throw new Error('Origem não encontrada para geocodificação');
    return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
  }

  // ===== Dados dos destinos =====
  const destinos = {
    'Foz do Iguaçu': { lat:-25.5161, lon:-54.5850,
      hotels:[{nome:'Hotel Cataratas',preco:300,capacidadeQuarto:3},{nome:'Eco Hotel',preco:250,capacidadeQuarto:2},{nome:'Pousada das Águas',preco:200,capacidadeQuarto:2}],
      casas:[{nome:'Casa Iguaçu',preco:180,capacidade:6},{nome:'Apto Centro',preco:150,capacidade:4},{nome:'Casa das Flores',preco:220,capacidade:8}],
      dicas:['Cataratas do Iguaçu','Passeio de barco','Parque das Aves','Itaipu'],
      clima:'Clima subtropical úmido, com verões quentes e chuvas frequentes.',
      bagagem:['Roupas leves que sequem rápido','Capa de chuva ou guarda-chuva','Calçados confortáveis para trilhas','Repelente e protetor solar'],
      mobilidade:'Táxis e aplicativos funcionam bem; considere transfers para as Cataratas e transporte turístico para Itaipu.' },

    'Curitiba': { lat:-25.4284, lon:-49.2733,
      hotels:[{nome:'Hotel Jardim Botânico',preco:220,capacidadeQuarto:3},{nome:'Curitiba Palace',preco:280,capacidadeQuarto:3},{nome:'Pousada do Centro',preco:180,capacidadeQuarto:2}],
      casas:[{nome:'Casa Batel',preco:160,capacidade:6},{nome:'Apto Centro Cívico',preco:140,capacidade:4},{nome:'Casa Vista Alegre',preco:170,capacidade:7}],
      dicas:['Jardim Botânico','Trem Morretes','MON','Parques Barigui/Tanguá'],
      clima:'Clima subtropical com invernos frios e possibilidade de chuva durante todo o ano.',
      bagagem:['Casaco quente e roupas em camadas','Capa de chuva ou guarda-chuva','Calçado fechado antiderrapante','Hidratante labial'],
      mobilidade:'Transporte público eficiente com ônibus biarticulados e linha turismo; apps de mobilidade complementam bem.' },

    'Florianópolis': { lat:-27.5949, lon:-48.5482,
      hotels:[{nome:'Hotel Beira-Mar',preco:280,capacidadeQuarto:3},{nome:'Pousada Praia Mole',preco:220,capacidadeQuarto:3},{nome:'Eco Hotel Lagoa',preco:200,capacidadeQuarto:2}],
      casas:[{nome:'Casa Jurerê',preco:300,capacidade:8},{nome:'Apto Lagoa',preco:220,capacidade:4},{nome:'Casa Campeche',preco:250,capacidade:6}],
      dicas:['Joaquina','Lagoa da Conceição','Lagoinha do Leste','Costa da Lagoa'],
      clima:'Clima litorâneo úmido, verões quentes e noites com brisa fresca.',
      bagagem:['Roupas de banho e chinelo','Protetor solar e pós-sol','Agasalho leve para o vento noturno','Bolsa estanque para passeios de barco'],
      mobilidade:'Para praias mais distantes é útil alugar carro; no centro ônibus e aplicativos atendem bem.' },

    'Gramado': { lat:-29.3750, lon:-50.8731,
      hotels:[{nome:'Hotel das Hortênsias',preco:320,capacidadeQuarto:3},{nome:'Pousada do Lago',preco:260,capacidadeQuarto:2},{nome:'Hotel Alemão',preco:280,capacidadeQuarto:2}],
      casas:[{nome:'Chalé do Centro',preco:200,capacidade:6},{nome:'Casa Canela',preco:180,capacidade:5},{nome:'Casa Vale',preco:220,capacidade:8}],
      dicas:['Lago Negro','Mini Mundo','Fondue','Maria Fumaça'],
      clima:'Clima serrano com outonos e invernos frios e úmidos.',
      bagagem:['Casaco pesado e roupas térmicas','Luvas, gorro e cachecol','Calçado fechado confortável','Guarda-chuva compacto'],
      mobilidade:'Centro pode ser explorado a pé; para atrativos afastados há ônibus turístico e vans receptivas.' },

    'Brasília': { lat:-15.7939, lon:-47.8828,
      hotels:[{nome:'Hotel Planalto',preco:250,capacidadeQuarto:3},{nome:'Pousada Lago Paranoá',preco:200,capacidadeQuarto:2},{nome:'Hotel Catedral',preco:220,capacidadeQuarto:2}],
      casas:[{nome:'Apto Asa Sul',preco:180,capacidade:4},{nome:'Casa Lago Norte',preco:230,capacidade:8},{nome:'Apto Asa Norte',preco:190,capacidade:4}],
      dicas:['Catedral/Congresso','Lago Paranoá','Parque da Cidade','Arquitetura'],
      clima:'Clima tropical com estação seca entre maio e setembro e chuvas no verão.',
      bagagem:['Roupas leves e respiráveis','Hidratante e protetor labial','Chapéu ou boné','Óculos de sol e garrafa reutilizável'],
      mobilidade:'Melhor circular de carro ou por aplicativos; na região monumental há bicicletas e patinetes compartilhados.' },

    'Salvador': { lat:-12.9718, lon:-38.5011,
      hotels:[{nome:'Hotel Pelourinho',preco:260,capacidadeQuarto:3},{nome:'Pousada Barra',preco:240,capacidadeQuarto:3},{nome:'Hotel Farol',preco:300,capacidadeQuarto:2}],
      casas:[{nome:'Casa Itapuã',preco:200,capacidade:6},{nome:'Apto Rio Vermelho',preco:180,capacidade:4},{nome:'Casa Stella Maris',preco:220,capacidade:8}],
      dicas:['Pelourinho','Farol da Barra','Acarajé','Morro de SP'],
      clima:'Clima quente e úmido durante todo o ano, com brisas marítimas.',
      bagagem:['Roupas leves e ventiladas','Filtro solar e pós-sol','Repelente','Sandália ou tênis confortável para ladeiras'],
      mobilidade:'Táxis, aplicativos e ônibus atendem bem; considere transfers para praias mais distantes e evite horários de pico.' },

    'Porto Seguro': { lat:-16.4513, lon:-39.0645,
      hotels:[{nome:'Hotel Taperapuã',preco:220,capacidadeQuarto:3},{nome:'Pousada Arraial',preco:200,capacidadeQuarto:2},{nome:'Hotel Porto Plaza',preco:240,capacidadeQuarto:2}],
      casas:[{nome:'Casa Mutá',preco:180,capacidade:8},{nome:'Apto Arraial',preco:170,capacidade:6},{nome:'Casa Trancoso',preco:250,capacidade:10}],
      dicas:['Centro Histórico','Praias','Escuna Arraial/Trancoso','Aldeia Pataxó'],
      clima:'Clima tropical quente com pancadas de chuva rápidas no verão.',
      bagagem:['Roupas de praia e saída leve','Chapéu e óculos de sol','Protetor solar resistente à água','Repelente para passeios noturnos'],
      mobilidade:'Traslados e vans conectam às praias de Arraial e Trancoso; no centro caminhe ou utilize aplicativos.' },

    'Fortaleza': { lat:-3.7319, lon:-38.5267,
      hotels:[{nome:'Hotel Beira Mar',preco:270,capacidadeQuarto:3},{nome:'Pousada Iracema',preco:230,capacidadeQuarto:3},{nome:'Hotel Praia do Futuro',preco:250,capacidadeQuarto:2}],
      casas:[{nome:'Casa Meireles',preco:190,capacidade:6},{nome:'Apto Mucuripe',preco:170,capacidade:5},{nome:'Casa Cumbuco',preco:210,capacidade:8}],
      dicas:['Beira Mar','Praia do Futuro','Dragão do Mar','Jeri (bate-volta)'],
      clima:'Clima litorâneo ensolarado com ventos constantes e pouca chuva.',
      bagagem:['Roupas leves e UV','Protetor solar de fator alto','Óculos escuros e chapéu','Roupa para passeios de buggy ou jangada'],
      mobilidade:'Beira-Mar é caminhável; para praias e bate-voltas use carro, transfers ou excursões organizadas.' },

    'São Paulo': { lat:-23.5505, lon:-46.6333,
      hotels:[{nome:'Hotel Paulista',preco:300,capacidadeQuarto:3},{nome:'Pousada Jardins',preco:250,capacidadeQuarto:2},{nome:'Hotel Ibirapuera',preco:280,capacidadeQuarto:2}],
      casas:[{nome:'Apto Moema',preco:200,capacidade:4},{nome:'Casa Vila Madalena',preco:230,capacidade:6},{nome:'Apto Pinheiros',preco:190,capacidade:4}],
      dicas:['Paulista','Ibirapuera','Centro Histórico','Gastronomia'],
      clima:'Clima subtropical com variações rápidas de temperatura ao longo do dia.',
      bagagem:['Casaco leve ou cardigan','Guarda-chuva compacto','Tênis confortável para caminhar','Roupas versáteis para dia e noite'],
      mobilidade:'Metrô e trens cobrem grande parte da cidade; complemente com aplicativos e atenção aos horários de pico.' },

    'Campos do Jordão': { lat:-22.7392, lon:-45.5914,
      hotels:[{nome:'Hotel Capivari',preco:260,capacidadeQuarto:3},{nome:'Pousada Araucárias',preco:220,capacidadeQuarto:3},{nome:'Hotel Vila Inglesa',preco:320,capacidadeQuarto:2}],
      casas:[{nome:'Chalé Capivari',preco:230,capacidade:6},{nome:'Casa Abernéssia',preco:200,capacidade:5},{nome:'Chalé Alto do Capivari',preco:270,capacidade:8}],
      dicas:['Capivari','Teleférico','Ducha de Prata','Pedra do Baú'],
      clima:'Clima de montanha com noites frias o ano inteiro.',
      bagagem:['Casacos pesados e segunda pele','Luvas e gorro','Calçado fechado confortável','Hidratante para pele e lábios'],
      mobilidade:'Carro facilita deslocamentos entre bairros e mirantes; vans turísticas saem da vila Capivari.' },

    'Rio de Janeiro': { lat:-22.9068, lon:-43.1729,
      hotels:[{nome:'Hotel Copacabana',preco:350,capacidadeQuarto:3},{nome:'Pousada Santa Teresa',preco:240,capacidadeQuarto:2},{nome:'Hotel Ipanema',preco:330,capacidadeQuarto:2}],
      casas:[{nome:'Apto Botafogo',preco:220,capacidade:4},{nome:'Casa Santa Teresa',preco:250,capacidade:6},{nome:'Apto Leme',preco:210,capacidade:5}],
      dicas:['Pão de Açúcar','Cristo','Praias','Dois Irmãos'],
      clima:'Clima tropical atlântico com calor úmido e chuvas de verão.',
      bagagem:['Roupas leves e respiráveis','Protetor solar e pós-sol','Tênis ou sandália antiderrapante','Garrafa reutilizável para se hidratar'],
      mobilidade:'Use metrô, VLT e BRT para grandes distâncias; táxis e aplicativos são recomendados nas áreas turísticas.' },
  };

  const checklistEssencial = [
    'Documentos pessoais (RG, CNH ou passaporte) e passagens.',
    'Reservas de hospedagem e comprovantes salvos no celular.',
    'Cartões, dinheiro em espécie e limites conferidos com antecedência.',
    'Seguro viagem ou cartão do plano de saúde com contatos úteis.',
    'Carregadores, adaptadores e bateria portátil carregada.',
    'Kit básico de remédios e itens de higiene pessoal.'
  ];

  // ===== Elementos do DOM =====
  const cepInput = document.getElementById('cepInput');
  const buscarCepBtn = document.getElementById('buscarCepBtn');
  const enderecoInfo = document.getElementById('enderecoInfo');
  const destinoSelect = document.getElementById('destinoSelect');
  const noitesInput = document.getElementById('noitesInput');
  const pessoasHospedagemInput = document.getElementById('hospedagemPessoas');
  const stepDestination = document.getElementById('step-destination');
  const stepStay = document.getElementById('step-stay');
  const hospedagemResultados = document.getElementById('hospedagemResultados');
  const stepTransport = document.getElementById('step-transport');
  const totalViajantesSpan = document.getElementById('totalViajantes');
  const transporteResultados = document.getElementById('transporteResultados');
  const stepSummary = document.getElementById('step-summary');
  const resumoDiv = document.getElementById('resumo');
  const dicasDiv = document.getElementById('dicas');
  const checklistDiv = document.getElementById('checklist');
  const climaBagagemDiv = document.getElementById('climaBagagem');
  const mobilidadeDiv = document.getElementById('mobilidade');

  // Preenche o select de destinos
  Object.keys(destinos).forEach(c => {
    const op = document.createElement('option');
    op.value = c;
    op.textContent = c;
    destinoSelect.appendChild(op);
  });

  // ===== Helpers =====
  function distanciaKm(a, b){
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const s1 = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(s1), Math.sqrt(1-s1));
  }

  const formatCurrency = (valor) => Number.isFinite(valor) ? valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : '—';
  const formatKm = (valor) => `${Math.round(valor).toLocaleString('pt-BR')} km`;
  function formatTempo(horas){
    if (!Number.isFinite(horas) || horas <= 0) return '—';
    const totalMinutos = Math.round(horas*60);
    const h = Math.floor(totalMinutos/60);
    const m = totalMinutos % 60;
    const partes = [];
    if (h>0) partes.push(`${h}h`);
    if (m>0) partes.push(`${m}min`);
    return partes.join(' ') || '0min';
  }

  // Estado
  let origem = { cidade:'', uf:'', lat:null, lon:null };
  let pessoasHospedagem = 1;
  let ultimoTipoHospedagem = '';
  let ultimoTransporte = '';

  function sanitizarPessoas(){
    const valor = Math.max(1, parseInt(pessoasHospedagemInput?.value || '1', 10));
    pessoasHospedagem = valor;
    if (pessoasHospedagemInput) pessoasHospedagemInput.value = valor;
    if (totalViajantesSpan) totalViajantesSpan.textContent = valor;
  }
  sanitizarPessoas();

  // ===== Eventos =====
  buscarCepBtn?.addEventListener('click', async () => {
    try{
      if (enderecoInfo){
        enderecoInfo.style.color = '#374151';
        enderecoInfo.textContent = 'Buscando endereço...';
      }
      const end = await buscarCEPAny(cepInput.value);

      if (enderecoInfo){
        enderecoInfo.textContent = `Endereço: ${end.logradouro} ${end.bairro ? '— '+end.bairro : ''} - ${end.cidade}/${end.uf}`;
        enderecoInfo.style.color = '#065f46';
      }

      origem.cidade = end.cidade;
      origem.uf = end.uf;

      if (destinos[origem.cidade]){
        origem.lat = destinos[origem.cidade].lat;
        origem.lon = destinos[origem.cidade].lon;
      } else {
        try{
          const {lat, lon} = await geocodeCityUF(origem.cidade, origem.uf);
          origem.lat = lat; origem.lon = lon;
        } catch {
          origem.lat = null; origem.lon = null;
        }
      }

    } catch(e){
      if (enderecoInfo){
        enderecoInfo.textContent = 'Não foi possível consultar esse CEP agora. Tente novamente em instantes.';
        enderecoInfo.style.color = '#b45309';
      }
    }
    if (stepDestination) stepDestination.style.display = 'block';
  });

  destinoSelect?.addEventListener('change', () => {
    if(destinoSelect.value){
      if (stepStay) stepStay.style.display = 'block';
      if (hospedagemResultados) hospedagemResultados.innerHTML = '';
      if (stepTransport) stepTransport.style.display = 'none';
      if (transporteResultados) transporteResultados.innerHTML = '';
      if (stepSummary) stepSummary.style.display = 'none';
      ultimoTipoHospedagem = '';
      ultimoTransporte = '';
    }
  });

  pessoasHospedagemInput?.addEventListener('input', sanitizarPessoas);
  pessoasHospedagemInput?.addEventListener('change', () => {
    sanitizarPessoas();
    if(ultimoTipoHospedagem){
      const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));
      noitesInput.value = noites;
      renderHospedagens(ultimoTipoHospedagem, noites);
    }
  });

  noitesInput?.addEventListener('change', () => {
    const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));
    noitesInput.value = noites;
    if(ultimoTipoHospedagem){
      renderHospedagens(ultimoTipoHospedagem, noites);
    }
  });

  document.querySelectorAll('.stayBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));
      noitesInput.value = noites;
      renderHospedagens(btn.dataset.type, noites);
    });
  });

  document.querySelectorAll('.transportBtn').forEach(btn => {
    btn.addEventListener('click', () => renderTransporte(btn.dataset.type));
  });

  // ===== Renderizações =====
  function renderHospedagens(tipo, noites){
    const d = destinos[destinoSelect.value];
    if(!d) return;
    sanitizarPessoas();

    const listaBase = (tipo === 'casa' ? d.casas : d.hotels);
    const itensHtml = listaBase.map(h => {
      if (tipo === 'casa'){
        const capacidade = h.capacidade || pessoasHospedagem;
        const total = h.preco * noites;
        const porPessoa = total / pessoasHospedagem;
        const comporta = capacidade >= pessoasHospedagem;
        return `
          <li>
            <div class="item-info">
              <strong>${h.nome}</strong>
              <span>Capacidade: ${capacidade} pessoa(s)</span>
            </div>
            <div class="item-price">
              <span class="valor">${formatCurrency(total)}</span>
              <small>${formatCurrency(porPessoa)} por pessoa</small>
            </div>
            <div class="item-status ${comporta ? 'status-ok' : 'status-alert'}">
              ${comporta ? 'Comporta todo o grupo' : 'Será necessário dividir em mais de uma casa'}
            </div>
          </li>`;
      } else {
        const capacidadeQuarto = h.capacidadeQuarto || 2;
        const quartos = Math.ceil(pessoasHospedagem / capacidadeQuarto);
        const total = h.preco * noites * quartos;
        const porPessoa = total / pessoasHospedagem;
        return `
          <li>
            <div class="item-info">
              <strong>${h.nome}</strong>
              <span>${quartos} quarto(s) · até ${capacidadeQuarto} pessoa(s) por quarto</span>
            </div>
            <div class="item-price">
              <span class="valor">${formatCurrency(total)}</span>
              <small>${formatCurrency(porPessoa)} por pessoa</small>
            </div>
          </li>`;
      }
    }).join('');

    hospedagemResultados.innerHTML = `
      <h4>Opções:</h4>
      <ul class="lista-hospedagem">${itensHtml}</ul>
      <p class="note">Cálculo para ${pessoasHospedagem} pessoa(s) em ${noites} noite(s).</p>
    `;

    if (stepTransport) stepTransport.style.display = 'block';
    ultimoTipoHospedagem = tipo;
    if (ultimoTransporte){
      renderTransporte(ultimoTransporte);
    }
  }

  function renderTransporte(tipo){
    const destinoEscolhido = destinoSelect.value;
    if (!destinoEscolhido) return;
    const d = destinos[destinoEscolhido];
    if (!d) return;
    sanitizarPessoas();

    if (origem.lat == null || origem.lon == null){
      transporteResultados.innerHTML = `<p>Para estimar o transporte, informe um CEP válido para definirmos sua origem no mapa.</p>`;
      if (stepSummary) stepSummary.style.display = 'block';
      ultimoTransporte = '';
      atualizarResumo();
      return;
    }

    const kmIda = distanciaKm({lat:origem.lat, lon:origem.lon}, {lat:d.lat, lon:d.lon});
    if (!Number.isFinite(kmIda)){
      transporteResultados.innerHTML = `<p>Não foi possível calcular a distância para esse trajeto agora. Tente novamente mais tarde.</p>`;
      if (stepSummary) stepSummary.style.display = 'block';
      ultimoTransporte = '';
      atualizarResumo();
      return;
    }

    const kmTotal = kmIda * 2;
    const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));

    // parâmetros “médios” para a simulação
    const consumoKmL = 12;
    const precoGasolina = 6.5;
    const velocidadeCarro = 80;
    const velocidadeOnibus = 70;
    const velocidadeAviao = 750;

    let titulo = '';
    let custoTotal = 0;
    let detalhe = '';
    let tempoIdaHoras = 0;

    switch (tipo) {
      case 'carro-proprio': {
        titulo = 'Carro próprio';
        const litros = kmTotal / consumoKmL;
        custoTotal = litros * precoGasolina;
        detalhe = `Combustível estimado considerando consumo médio de ${consumoKmL} km/l e gasolina a ${formatCurrency(precoGasolina)}.`;
        tempoIdaHoras = kmIda / velocidadeCarro;
        break;
      }
      case 'carro-alugado': {
        titulo = 'Carro alugado';
        const diaria = 210;
        const dias = noites + 1;
        const litros = kmTotal / consumoKmL;
        custoTotal = (litros * precoGasolina) + (diaria * dias);
        detalhe = `Inclui aluguel por ${dias} dia(s) a ${formatCurrency(diaria)} + combustível estimado (${consumoKmL} km/l).`;
        tempoIdaHoras = kmIda / velocidadeCarro;
        break;
      }
      case 'onibus': {
        titulo = 'Ônibus';
        const tarifaKm = 0.32;
        custoTotal = kmIda * 2 * tarifaKm * pessoasHospedagem;
        detalhe = `Tarifa média rodoviária de ${formatCurrency(tarifaKm)} por km por pessoa (ida e volta).`;
        tempoIdaHoras = kmIda / velocidadeOnibus;
        break;
      }
      case 'aviao':
      default: {
        titulo = 'Avião';
        const base = Math.max(420, kmIda * 0.55); // ida+volta médio
        custoTotal = base * pessoasHospedagem;
        detalhe = 'Valor médio de passagens aéreas ida e volta com taxas inclusas (simulado).';
        tempoIdaHoras = (kmIda / velocidadeAviao) + 1.5; // +tempo de aeroporto
        break;
      }
    }

    const custoPorPessoa = custoTotal / pessoasHospedagem;
    const tempoIda = formatTempo(tempoIdaHoras);

    transporteResultados.innerHTML = `
      <h4>${titulo}</h4>
      <ul>
        <li class="metric"><span>Custo total</span><span>${formatCurrency(custoTotal)}</span></li>
        <li class="metric"><span>Custo por pessoa</span><span>${formatCurrency(custoPorPessoa)}</span></li>
        <li class="metric"><span>Distância (ida)</span><span>${formatKm(kmIda)}</span></li>
        <li class="metric"><span>Distância total</span><span>${formatKm(kmTotal)}</span></li>
        <li class="metric"><span>Tempo estimado (ida)</span><span>${tempoIda}</span></li>
      </ul>
      <p>${detalhe}</p>
    `;

    if (stepSummary) stepSummary.style.display = 'block';
    ultimoTransporte = tipo;
    atualizarResumo();
  }

  function atualizarResumo(){
    const destinoEscolhido = destinoSelect.value;
    if (!destinoEscolhido) return;
    const destinoData = destinos[destinoEscolhido];
    if (!destinoData) return;

    const noites = Math.max(1, parseInt(noitesInput.value || '1', 10));
    const origemTexto = `${origem.cidade || '—'}/${origem.uf || '—'}`;

    resumoDiv.innerHTML = `
      <p><strong>Origem:</strong> ${origemTexto}</p>
      <p><strong>Destino:</strong> ${destinoEscolhido}</p>
      <p><strong>Noites:</strong> ${noites}</p>
      <p><strong>Viajantes:</strong> ${pessoasHospedagem}</p>
      <p><strong>Hospedagem selecionada:</strong> ${ultimoTipoHospedagem ? (ultimoTipoHospedagem === 'hotel' ? 'Hotel' : 'Casa alugada') : 'Escolha uma opção no passo 3'}</p>
    `;

    dicasDiv.innerHTML = `<p><strong>Lugares turísticos da cidade</strong></p><ul>${destinoData.dicas.map(d=>`<li>${d}</li>`).join('')}</ul>`;

    if (checklistDiv){
      checklistDiv.innerHTML = `<p><strong>Checklist essencial</strong></p><ul>${checklistEssencial.map(item=>`<li>${item}</li>`).join('')}</ul>`;
    }
    if (climaBagagemDiv){
      climaBagagemDiv.innerHTML = `<p><strong>Clima e bagagem</strong></p><p>${destinoData.clima}</p><ul>${destinoData.bagagem.map(item=>`<li>${item}</li>`).join('')}</ul>`;
    }
    if (mobilidadeDiv){
      mobilidadeDiv.innerHTML = `<p><strong>Mobilidade no destino</strong></p><p>${destinoData.mobilidade}</p>`;
    }
  }

});
