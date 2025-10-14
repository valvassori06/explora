// Espera todo o conteúdo da página carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // ===== util: busca CEP (ViaCEP + fallback) =====
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
    } catch (_) { /* tenta fallback */ }

    // 2) Fallback: AwesomeAPI
    const r2 = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
    if (!r2.ok) throw new Error('CEP não encontrado no momento');
    const d2 = await r2.json();
    return {
      cep: d2.cep || cep,
      logradouro: d2.address || '',
      bairro: d2.district || '',
      cidade: d2.city || '',
      uf: d2.state || ''
    };
  }

  // ===== util: geocodifica cidade/UF para lat/lon (Nominatim/OSM) =====
  async function geocodeCityUF(cidade, uf) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=Brazil&city=${encodeURIComponent(cidade)}&state=${encodeURIComponent(uf)}`;
    const r = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error('Falha ao geocodar origem');
    const arr = await r.json();
    if (!arr?.length) throw new Error('Origem não encontrada para geocodificação');
    return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
  }

  // Cria um objeto (tipo uma lista organizada) com as cidades e seus dados
  const destinos = {
    'Foz do Iguaçu': { lat:-25.5161, lon:-54.5850,
      hotels:[{nome:'Hotel Cataratas',preco:300},{nome:'Eco Hotel',preco:250},{nome:'Pousada das Águas',preco:200}],
      casas:[{nome:'Casa Iguaçu',preco:180},{nome:'Apto Centro',preco:150},{nome:'Casa das Flores',preco:220}],
      dicas:['Cataratas do Iguaçu','Passeio de barco','Parque das Aves','Itaipu'] },

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
    const op=document.createElement('option');
    op.value=c;
    op.textContent=c;
    destinoSelect.appendChild(op);
  });

  // Função para calcular a distância entre duas cidades (Haversine)
  function distanciaKm(a,b){
    const R=6371;
    const dLat=(b.lat-a.lat)*Math.PI/180;
    const dLon=(b.lon-a.lon)*Math.PI/180;
    const s1=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(s1),Math.sqrt(1-s1));
  }

  // Origem “vazia” até o usuário informar o CEP
  let origem={cidade:'', uf:'', lat:null, lon:null};

  // Ao clicar no botão de buscar CEP
  buscarCepBtn.addEventListener('click', async ()=>{
    try{
      enderecoInfo.style.color='#374151';
      enderecoInfo.textContent='Buscando endereço...';

      const end = await buscarCEPAny(cepInput.value);

      // Mostra o endereço na tela
      enderecoInfo.textContent = `Endereço: ${end.logradouro} ${end.bairro? '— '+end.bairro:''} - ${end.cidade}/${end.uf}`;
      enderecoInfo.style.color = '#065f46';

      // Atualiza cidade/UF
      origem.cidade = end.cidade;
      origem.uf = end.uf;

      // Se a cidade estiver na lista de destinos, pega as coordenadas conhecidas
      if(destinos[origem.cidade]){
        origem.lat = destinos[origem.cidade].lat;
        origem.lon = destinos[origem.cidade].lon;
      }else{
        // Geocoda cidade/UF para lat/lon (para cálculo de distância funcionar para qualquer lugar)
        try{
          const {lat, lon} = await geocodeCityUF(origem.cidade, origem.uf);
          origem.lat = lat; origem.lon = lon;
        }catch{
          // Se não conseguir geocodar, mantém sem coordenadas (o módulo de transporte se ajusta)
          origem.lat = null; origem.lon = null;
        }
      }

    }catch(e){
      enderecoInfo.textContent='Não foi possível consultar esse CEP agora. Tente novamente em instantes.';
      enderecoInfo.style.color='#b45309';
      // não força fallback para São Paulo
    }
    stepDestination.style.display='block';
  });

  // Quando o usuário escolhe um destino, mostra o passo de hospedagem
  destinoSelect.addEventListener('change', ()=>{
    if(destinoSelect.value){ stepStay.style.display='block'; }
  });

  // Função que mostra os resultados de hospedagem
  function renderHospedagens(tipo,noites){
    const d=destinos[destinoSelect.value];
    if(!d) return;
    const lista=(tipo==='casa'? d.casas : d.hotels)
      .map(h=>`<li><span>${h.nome}</span><span>R$ ${(h.preco*noites).toFixed(2)}</span></li>`).join('');
    hospedagemResultados.innerHTML=`<h4>Opções:</h4><ul>${lista}</ul>`;
    stepTransport.style.display='block';
  }

  // Liga os botões de hospedagem
  document.querySelectorAll('.stayBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10));
      renderHospedagens(btn.dataset.type,noites);
    });
  });

  // Função para calcular e mostrar o transporte
  function renderTransporte(tipo){
    const d=destinos[destinoSelect.value]; if(!d) return;

    // Se não temos coordenadas da origem, avisa e não calcula a distância
    if (origem.lat == null || origem.lon == null){
      transporteResultados.innerHTML =
        `<p>Para estimar o transporte, informe um CEP válido para definirmos sua origem no mapa.</p>`;
      stepSummary.style.display='block';
      return;
    }

    const km=distanciaKm({lat:origem.lat,lon:origem.lon},{lat:d.lat,lon:d.lon});
    const pessoas=Math.max(1,parseInt(numPessoasInput.value||'1',10));
    let valor=0,detalhe='';

    if(tipo==='carro'){
      const aluguel=150, consumoKmL=12, gasolina=6.5;
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10));
      const dias=noites+1;
      const idaVolta=km*2;
      const litros=idaVolta/consumoKmL;
      valor=(aluguel*dias)+(litros*gasolina);
      detalhe=`Aluguel ${dias} dia(s) + gasolina p/ ${idaVolta.toFixed(0)} km.`;
    }
    else if(tipo==='onibus'){
      const tarifaKm=0.35;
      valor=km*2*tarifaKm*pessoas;
      detalhe=`Ônibus ida/volta para ${pessoas} pessoa(s).`;
    }
    else{
      const base=250;
      valor=base*pessoas;
      detalhe=`Aéreo promocional (simulado) para ${pessoas} pessoa(s).`;
    }

    const porPessoa=valor/pessoas;
    transporteResultados.innerHTML=
      `<ul><li><span>${tipo.toUpperCase()}</span><span>R$ ${valor.toFixed(2)} (R$ ${porPessoa.toFixed(2)}/pessoa)</span></li></ul><p>${detalhe}</p>`;
    stepSummary.style.display='block';
  }

  // Liga os botões de transporte
  document.querySelectorAll('.transportBtn').forEach(btn=>{
    btn.addEventListener('click',()=>renderTransporte(btn.dataset.type));
  });

  // Observa quando o resumo for exibido
  const observer=new MutationObserver(()=>{
    if(stepSummary.style.display==='block'){
      const destino=destinoSelect.value; if(!destino) return;
      const noites=Math.max(1,parseInt(noitesInput.value||'1',10));

      resumoDiv.innerHTML=
        `<p><strong>Origem:</strong> ${origem.cidade || '—'}/${origem.uf || '—'}</p>
         <p><strong>Destino:</strong> ${destino}</p>
         <p><strong>Noites:</strong> ${noites}</p>`;

      dicasDiv.innerHTML=`<p><strong>Lugares turísticos da cidade</strong></p>
      <ul style="padding-left: 2vh;">${destinos[destino].dicas.map(d=>`<li>${d}</li>`).join('')}</ul>`;
    }
  });

  observer.observe(stepSummary,{attributes:true,attributeFilter:['style']});
});
