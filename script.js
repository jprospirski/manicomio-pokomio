// --- SELETORES GLOBAIS (Mantidos os IDs corretos) ---
const pokeContainer = document.querySelector("#containerPokemons"); 
const pokemonModal = document.querySelector("#modalPokemon"); 
const closeModalButton = document.querySelector("#botaoFecharModal"); 
const modalInfo = document.querySelector("#infoModal"); 
const pokebolaBtn = document.getElementById('botaoPokebola'); 
const fullMenu = document.getElementById('menuCompleto'); 
const menuButtonsContainer = document.getElementById('containerBotoesMenu'); 
const lupaBtn = document.querySelector('.icone-lupa'); 
const searchBarContainer = document.getElementById('containerBarraBusca'); 
const searchInput = document.getElementById('inputBuscaPokemon'); 
const headerContainer = document.querySelector('.container-cabecalho'); 
const scrollToTopBtn = document.getElementById('botaoVoltarAoTopo'); 
const loadingOverlay = document.getElementById('overlayCarregamento'); 
// ------------------------------------

// --- VARIÁVEIS DE CONTROLE DO INFINITE SCROLL ---
let limit = 100; // Quantidade de Pokémon a carregar por vez
let offset = 0; // Ponto inicial de carregamento
let isFetching = false; // Impede chamadas múltiplas enquanto carrega
let allPokemonCount = 1302; // Total máximo de Pokémon para o loop (ajuste se a API mudar)
// -----------------------------------------------

// --- CONSTANTES DE CORES E TIPOS ---
const colors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  steel: '#B7B7CE',
  dark: '#705746',
  fairy: '#D685AD',
};

const mainTypes = Object.keys(colors);

// --- CONSTANTES DE IMAGEM ---
// Note: Você deve ter os arquivos 'star-filled.png' e 'star-empty.png' na pasta 'assets'
const STAR_FILLED_IMG = 'assets/star-filled.png'; 
const STAR_EMPTY_IMG = 'assets/star-empty.png';
const ALT_FAVORITO = 'Favorito';
const ALT_NAO_FAVORITO = 'Não Favorito';

// --- ESTADO DA APLICAÇÃO ---
let allPokemons = []; 
let rawPokemonList = []; 
let favoritePokemons = JSON.parse(localStorage.getItem('favoritePokemons')) || [];
let activeFilter = { value: "Todos", type: null };
let activeSort = "id_asc";
let currentGenerationPokemons = []; 

// --- Listas de Menu ---
let allGenerations = []; 
let allElements = []; 
const mainMenuItems = ["Todos", "Favoritos", "Gerações", "Elementos", "Ordenar por...", "Estágio Evolutivo", "Resetar Filtros"];
const stageMenuItems = ["Estágio Inicial", "Estágio Intermediário", "Estágio Final", "Estágio Único"];
const sortMenuItems = {
  "ID (Padrão)": "id_asc",
  "Nome (A-Z)": "name_asc",
  "Nome (Z-A)": "name_desc",
  "Altura (Maior)": "height_desc",
  "Altura (Menor)": "height_asc",
  "Peso (Mais Pesado)": "weight_desc",
  "Peso (Mais Leve)": "weight_asc"
};

// --- Listener para o botão "Voltar ao Topo" ---
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Listener de scroll para mostrar/esconder o botão "Voltar ao Topo" e Infinite Scroll ---
window.addEventListener('scroll', () => {
    // Infinite Scroll Logic
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 100 && 
        !isFetching && 
        activeFilter.value === "Todos" && 
        offset < allPokemonCount) {
        
        loadMorePokemons();
    }
    
    // Back to Top Button Logic
    if (scrollTop > 300) { 
        scrollToTopBtn.classList.remove('hidden');
    } else {
        scrollToTopBtn.classList.add('hidden');
    }
});


// --- FUNÇÕES DE FAVORITOS ---
const saveFavorites = () => {
  localStorage.setItem('favoritePokemons', JSON.stringify(favoritePokemons));
};

const isFavorite = (pokemonId) => {
  return favoritePokemons.includes(pokemonId);
};

const toggleFavorite = (pokemonId, event) => {
  event.stopPropagation(); 

  const pokemonEstaFavorito = isFavorite(pokemonId);
  
  if (pokemonEstaFavorito) {
    favoritePokemons = favoritePokemons.filter(id => id !== pokemonId);
  } else {
    favoritePokemons.push(pokemonId);
  }
  saveFavorites();

  const novoEstadoFavorito = !pokemonEstaFavorito;
  const novaImgSrc = novoEstadoFavorito ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const novoAltText = novoEstadoFavorito ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  // 1. Atualiza o ícone no Modal se ele estiver aberto
  if (!pokemonModal.classList.contains('hidden') && modalInfo.dataset.pokemonId == pokemonId) {
    // 🟢 CLASSE CORRIGIDA: .icone-favorito-modal
    const modalStarIcon = modalInfo.querySelector('.icone-favorito-modal');
    if (modalStarIcon) {
      modalStarIcon.src = novaImgSrc;
      modalStarIcon.alt = novoAltText;
    }
  }

  // 2. Lógica Especial: Se estamos visualizando APENAS os Favoritos
  if (activeFilter.value === "Favoritos") {
    if (!novoEstadoFavorito) {
      updateDisplay(); 
    }
  } else {
    // 3. Lógica Padrão: Atualiza a estrela do card específico
    const cardNoGrid = pokeContainer.querySelector(`.pokemon[data-pokemon-id="${pokemonId}"]`);
    if (cardNoGrid) {
      // 🟢 CLASSE CORRIGIDA: .icone-estrela-favorito
      const starIcon = cardNoGrid.querySelector('.icone-estrela-favorito'); 
      if (starIcon) {
        starIcon.src = novaImgSrc;
        starIcon.alt = novoAltText;
      }
    }
  }

  if (!pokemonModal.classList.contains('hidden') && modalInfo.dataset.pokemonId == pokemonId) {
    // 🟢 CLASSE CORRIGIDA: .icone-favorito-modal
    const modalStarIcon = modalInfo.querySelector('.icone-favorito-modal');
    if (modalStarIcon) {
      modalStarIcon.src = novaImgSrc;
      modalStarIcon.alt = novoAltText;
    }
  }
};

// --- FUNÇÕES DE LÓGICA DE DADOS (Sem alterações, apenas renomeações no fetchPokemonData para consistência interna) ---
const parseStat = (statValue) => {
    return parseFloat(statValue) / 10;
};

const getPokemonDescription = async (speciesUrl) => {
    try {
        const response = await fetch(speciesUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const speciesData = await response.json();
        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        return flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';
    } catch (error) {
        console.error("Error fetching description:", error);
        return 'No description available.';
    }
};

const getEvolutionChain = async (evolutionChainUrl) => {
    try {
        const response = await fetch(evolutionChainUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const chainData = await response.json();

        const evolutions = [];
        let currentEvolution = chainData.chain;

        while (currentEvolution) {
            const speciesUrlParts = currentEvolution.species.url.split('/');
            const id = speciesUrlParts[speciesUrlParts.length - 2];
            evolutions.push(id);
            currentEvolution = currentEvolution.evolves_to[0]; 
        }
        return evolutions;
    } catch (error) {
        console.error("Error fetching evolution chain:", error);
        return [];
    }
};

const fetchPokemonData = async (pokemonUrl) => {
    try {
        const response = await fetch(pokemonUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const id = String(data.id).padStart(3, '0');
        const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        const types = data.types.map(typeInfo => typeInfo.type.name);
        const primaryType = types[0]; 

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const description = await getPokemonDescription(data.species.url);
        const generation = speciesData.generation ? parseInt(speciesData.generation.url.split('/').pop()) : 1;
        const evolutionChainUrl = speciesData.evolution_chain ? speciesData.evolution_chain.url : null;
        const evolutionChainIds = evolutionChainUrl ? await getEvolutionChain(evolutionChainUrl) : [id];


        return {
            id: id,
            nome: name,
            estilo: types.join('/'),
            primaryType: primaryType, 
            infos: {
                altura: `${parseStat(data.height)}m`, 
                peso: `${parseStat(data.weight)}kg`,   
                geracao: generation
            },
            descricao: description,
            evolucoes: evolutionChainIds
        };
    } catch (error) {
        console.error(`Error fetching data for ${pokemonUrl}:`, error);
        return null;
    }
};

const getFilteredPokemons = () => {
  const { value, type } = activeFilter;
  let filteredList = currentGenerationPokemons.length > 0 ? currentGenerationPokemons : allPokemons;

  if (value === "Todos") {
    return filteredList;
  }
  if (value === "Favoritos") {
    return filteredList.filter(poke => isFavorite(poke.id));
  }
  if (type === "gen") {
    const genNumber = parseInt(value.split(' ')[1]);
    return filteredList.filter(poke => poke.infos.geracao === genNumber);
  }
  if (type === "element") {
    const elementType = value.toLowerCase();
    return filteredList.filter(poke => poke.estilo.split('/').includes(elementType));
  }
  if (type === "stage") {
    if (value === "Estágio Inicial") {
      return filteredList.filter(p => p.id === p.evolucoes[0] && p.evolucoes.length > 1);
    }
    if (value === "Estágio Intermediário") {
      return filteredList.filter(p => p.evolucoes.length > 1 && p.id !== p.evolucoes[0] && p.id !== p.evolucoes[p.evolucoes.length - 1]);
    }
    if (value === "Estágio Final") {
      return filteredList.filter(p => p.id === p.evolucoes[p.evolucoes.length - 1] && p.evolucoes.length > 1);
    }
    if (value === "Estágio Único") {
      return filteredList.filter(p => p.evolucoes.length === 1);
    }
  }

  console.warn(`Filtro "${value}" não implementado ainda.`);
  return filteredList;
};

const applySort = (pokemonArray) => {
  const sortedArray = [...pokemonArray];

  switch (activeSort) {
    case "id_asc":
      return sortedArray.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    case "name_asc":
      return sortedArray.sort((a, b) => a.nome.localeCompare(b.nome));
    case "name_desc":
      return sortedArray.sort((a, b) => b.nome.localeCompare(a.nome));
    case "height_desc":
      return sortedArray.sort((a, b) => parseStat(b.infos.altura) - parseStat(a.infos.altura));
    case "height_asc":
      return sortedArray.sort((a, b) => parseStat(a.infos.altura) - parseStat(b.infos.altura));
    case "weight_desc":
      return sortedArray.sort((a, b) => parseStat(b.infos.peso) - parseStat(a.infos.peso));
    case "weight_asc":
      return sortedArray.sort((a, b) => parseStat(a.infos.peso) - parseStat(b.infos.peso));
    default:
      return sortedArray;
  }
};

// --- FUNÇÕES DE RENDERIZAÇÃO ---
const updateDisplay = (append = false) => {
  const filteredList = getFilteredPokemons();
  const sortedList = applySort(filteredList);
  renderPokemons(sortedList, append);
};

const renderPokemons = (pokemonArray, append = false) => {
    if (!append) {
        pokeContainer.innerHTML = '';
    }

  if (pokemonArray.length > 0) {
    pokemonArray.forEach(pokemon => createPkCard(pokemon));
  } else if (!append) {
    const message = activeFilter.value === "Favoritos" ?
      'Nenhum Pokémon favorito encontrado.' :
      `Nenhum Pokémon encontrado para "${activeFilter.value}".`;
    pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">${message}</p>`;
  }
};

const fetchAndLoadGenerations = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/generation/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        allGenerations = data.results.map(gen => parseInt(gen.url.split('/').pop()));
        allGenerations.sort((a, b) => a - b);
    } catch (error) {
        console.error("Error fetching generations:", error);
    }
};

const fetchAndLoadElements = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        allElements = data.results
            .filter(type => !['unknown', 'shadow'].includes(type.name)) 
            .map(type => type.name.charAt(0).toUpperCase() + type.name.slice(1));
        allElements.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("Error fetching elements (types):", error);
    }
};

const loadMorePokemons = async () => {
    if (isFetching || activeFilter.value !== "Todos" || offset >= allPokemonCount) return;

    isFetching = true;
    loadingOverlay.classList.remove('hidden'); 
    
    const currentLimit = Math.min(limit, allPokemonCount - offset);
    if (currentLimit <= 0) {
        isFetching = false;
        loadingOverlay.classList.add('hidden');
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${currentLimit}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        rawPokemonList.push(...data.results);

        const pokemonPromises = data.results.map(item => fetchPokemonData(item.url));
        const resolvedPokemons = await Promise.all(pokemonPromises);
        const newPokemons = resolvedPokemons.filter(p => p !== null);

        allPokemons.push(...newPokemons);

        // Renderiza apenas os novos cards
        renderPokemons(newPokemons, true);

        offset += newPokemons.length;
        
    } catch (error) {
        console.error("Error loading more Pokémon data:", error);
    } finally {
        isFetching = false;
        loadingOverlay.classList.add('hidden'); 
    }
};


const loadAllPokemonData = async (initialLimit = limit) => {
    isFetching = true;
    loadingOverlay.classList.remove('hidden'); 
    
    try {
        const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
        const countData = await countResponse.json();
        allPokemonCount = countData.count;
    } catch (e) {
        console.error("Não foi possível obter o total de Pokémon, usando o valor padrão.");
    }

    const url = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${initialLimit}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        allPokemons = [];
        rawPokemonList = [];
        
        rawPokemonList.push(...data.results);

        const pokemonPromises = data.results.map(item => fetchPokemonData(item.url));
        const resolvedPokemons = await Promise.all(pokemonPromises);
        allPokemons = resolvedPokemons.filter(p => p !== null); 

        currentGenerationPokemons = allPokemons;

        updateDisplay();
        
        offset = allPokemons.length;

    } catch (error) {
        console.error("Error loading initial Pokémon data:", error);
        pokeContainer.innerHTML = "<p>Erro ao carregar os dados iniciais. Verifique o console.</p>";
    } finally {
        isFetching = false;
        loadingOverlay.classList.add('hidden'); 
    }
};

const loadPokemonCardsByGeneration = async (genNumber) => {
    isFetching = true;
    loadingOverlay.classList.remove('hidden'); 
    pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Carregando Pokémons da Geração ${genNumber}...</p>`;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${genNumber}/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const genData = await response.json();

        const pokemonSpeciesUrls = genData.pokemon_species.map(species => species.url);
        const pokemonPromises = pokemonSpeciesUrls.map(async speciesUrl => {
            const speciesResponse = await fetch(speciesUrl);
            const speciesJson = await speciesResponse.json();
            const pokemonUrl = speciesJson.varieties.find(v => v.is_default).pokemon.url;
            return fetchPokemonData(pokemonUrl);
        });

        const resolvedPokemons = await Promise.all(pokemonPromises);
        currentGenerationPokemons = resolvedPokemons.filter(p => p !== null);
        updateDisplay();

    } catch (error) {
        console.error(`Error loading Pokémon for Generation ${genNumber}:`, error);
        pokeContainer.innerHTML = "<p>Erro ao carregar os dados da geração.</p>";
    } finally {
        isFetching = false;
        loadingOverlay.classList.add('hidden'); 
    }
};

// 🌟 FUNÇÃO CORRIGIDA - USANDO CLASSES CSS EM PORTUGUÊS 🌟
const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.pokemonId = poke.id;

  const name = poke.nome;
  const id = poke.id;
  const numericId = parseInt(id, 10);
  const pokeTypes = poke.estilo.split('/');

  const primaryType = poke.primaryType;
  const color = colors[primaryType] || '#ccc';
  card.style.backgroundColor = color; // Cor de fundo do card

  const isFav = isFavorite(poke.id);
  const favoriteStarImg = isFav ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const favoriteStarAlt = isFav ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  const pokemonInnerHTML = `
    <div class="container-icone-favorito" data-pokemon-id="${poke.id}">
        <img src="${favoriteStarImg}" alt="${favoriteStarAlt}" class="icone-estrela-favorito">
    </div>
    <div class="container-imagem">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${name}">
    </div>
    <div class="info">
      <span class="numero">#${id}</span>
      <h3 class="nome">${name}</h3>
      <small class="tipo">Tipo:<span>${pokeTypes.join(' / ')}</span></small>
    </div>
  `;

  card.innerHTML = pokemonInnerHTML;
  pokeContainer.appendChild(card);
}

// 🌟 FUNÇÃO CORRIGIDA - USANDO CLASSES CSS EM PORTUGUÊS (MODAL) 🌟
const showPokemonModal = (pokemon) => {
  const currentPokemonId = pokemon.id;
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const primaryType = pokemon.primaryType; 
  const color = colors[primaryType] || '#ccc';
  const modalBgColor = '#333';

  const evolutionImages = pokemon.evolucoes.map(evoId => {
    const evoNumericId = parseInt(evoId, 10);
    // 🟢 CLASSE CORRIGIDA: .imagem-evolucao
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="imagem-evolucao" data-pokemon-id="${evoId}">`;
    // 🟢 CLASSE CORRIGIDA: .seta-evolucao
  }).join(' <span class="seta-evolucao">></span> ');

  const isFav = isFavorite(pokemon.id);
  const modalFavoriteStarImg = isFav ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const modalFavoriteStarAlt = isFav ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  modalInfo.dataset.pokemonId = pokemon.id;

  modalInfo.innerHTML = `
    <div class="container-favorito-modal" data-pokemon-id="${pokemon.id}">
        <img src="${modalFavoriteStarImg}" alt="${modalFavoriteStarAlt}" class="icone-favorito-modal">
    </div>
    <div class="cabecalho-modal">
      <div class="container-imagem-modal">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${pokemon.nome}">
      </div>
      <div class="info-titulo-modal">
        <h2 class="nome-modal" style="color: ${color};">${pokemon.nome}</h2>
        <small class="tipo-modal">Tipo:<span>${pokeTypes.join(' / ')}</span></small>
        <span class="numero-modal">#${pokemon.id}</span>
      </div>
    </div>
    <div class="detalhes-modal">
      <div class="estatisticas-modal">
        <h3>Infos</h3>
        <p>Altura: ${pokemon.infos.altura}</p>
        <p>Peso: ${pokemon.infos.peso}</p>
        <p>Geração: ${pokemon.infos.geracao}</p>
      </div>
      <div class="descricao-modal">
        <h3>Descrição</h3>
        <p>${pokemon.descricao}</p>
      </div>
    </div>
    <div class="evolucoes-modal">
      <h3>Evoluções</h3>
      <div class="cadeia-evolutiva">
        ${evolutionImages}
      </div>
    </div>
  `;

  const modalImgContainer = modalInfo.querySelector('.container-imagem-modal');
  if (modalImgContainer) {
    modalImgContainer.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
  }
  const evolutionImgs = modalInfo.querySelectorAll('.imagem-evolucao');
  if (evolutionImgs.length > 0) {
    evolutionImgs.forEach(img => {
      img.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
    });
  }

  pokemonModal.classList.remove('hidden');

  const modalFavoriteWrapper = modalInfo.querySelector('.container-favorito-modal');
  if (modalFavoriteWrapper) {
    const newFavWrapper = modalFavoriteWrapper.cloneNode(true);
    modalFavoriteWrapper.replaceWith(newFavWrapper);
    newFavWrapper.addEventListener('click', (event) => toggleFavorite(pokemon.id, event));
  }

  const evolutionChainContainer = modalInfo.querySelector('.cadeia-evolutiva');
  if (evolutionChainContainer) {
     const newEvoChain = evolutionChainContainer.cloneNode(true);
     evolutionChainContainer.replaceWith(newEvoChain);
     newEvoChain.addEventListener('click', async (event) => {
      const clickedImage = event.target.closest('.imagem-evolucao');
      if (clickedImage) {
        const clickedPokemonId = clickedImage.dataset.pokemonId;
        
        if (clickedPokemonId && clickedPokemonId !== currentPokemonId) { 
          const nextPokemon = allPokemons.find(p => p.id === clickedPokemonId);
          if (!nextPokemon) {
            const rawPoke = rawPokemonList.find(p => p.url.includes(`/${parseInt(clickedPokemonId)}/`));
            if (rawPoke) {
                const fetchedNextPokemon = await fetchPokemonData(rawPoke.url);
                if (fetchedNextPokemon) {
                    allPokemons.push(fetchedNextPokemon); 
                    showPokemonModal(fetchedNextPokemon);
                }
            } else {
                console.error(`Pokémon with ID ${clickedPokemonId} not found in raw list.`);
            }
          } else {
            showPokemonModal(nextPokemon); 
          }
        }
      }
    });
  }
};

// --- EVENT LISTENERS GLOBAIS ---
pokeContainer.addEventListener('click', (event) => {
  // 🟢 CLASSE CORRIGIDA: .container-icone-favorito
  const favoriteWrapper = event.target.closest('.container-icone-favorito');
  if (favoriteWrapper) {
    const pokemonId = favoriteWrapper.dataset.pokemonId;
    if (pokemonId) {
      toggleFavorite(pokemonId, event);
    }
    return;
  }
  const pokemonCard = event.target.closest('.pokemon');
  if (pokemonCard) {
    const pokemonId = pokemonCard.dataset.pokemonId;
    const pokemon = allPokemons.find(p => p.id == pokemonId) || currentGenerationPokemons.find(p => p.id == pokemonId);
    if (pokemon) {
      showPokemonModal(pokemon);
    } else {
        console.error(`Pokemon with ID ${pokemonId} not found in current lists.`);
    }
  }
});

lupaBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  searchBarContainer.classList.toggle('hidden');
  headerContainer.classList.toggle('search-active');

  if (!searchBarContainer.classList.contains('hidden')) {
    searchInput.focus();
  } else {
    searchInput.value = '';
    updateDisplay();
  }
});

searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();

  let pokemonsToSearch = activeFilter.type === 'gen' && currentGenerationPokemons.length > 0 ? currentGenerationPokemons : allPokemons;

  if (searchTerm === '') {
    updateDisplay();
    return;
  }

  const filtered = pokemonsToSearch.filter(pokemon => {
    const nomeMatch = pokemon.nome.toLowerCase().includes(searchTerm);
    const idMatch = pokemon.id.includes(searchTerm);
    return nomeMatch || idMatch;
  });

  const sorted = applySort(filtered);

  pokeContainer.innerHTML = '';
  if (sorted.length > 0) {
    sorted.forEach(pokemon => createPkCard(pokemon));
  } else {
    pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Pokémon não encontrado.</p>`;
  }
});

closeModalButton.addEventListener('click', () => {
  pokemonModal.classList.add('hidden');
});

window.addEventListener('click', (event) => {
  if (!fullMenu.classList.contains('hidden') &&
    !fullMenu.contains(event.target) &&
    event.target !== pokebolaBtn) {
    fullMenu.classList.add('hidden');
  }

  if (!searchBarContainer.classList.contains('hidden') &&
    !searchBarContainer.contains(event.target) &&
    event.target !== lupaBtn) {

    searchBarContainer.classList.add('hidden');
    headerContainer.classList.remove('search-active');
    searchInput.value = '';
    updateDisplay();
  }

  if (event.target === pokemonModal) {
    pokemonModal.classList.add('hidden');
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!fullMenu.classList.contains('hidden')) {
      fullMenu.classList.add('hidden');
    }
    if (!searchBarContainer.classList.contains('hidden')) {
      searchBarContainer.classList.add('hidden');
      headerContainer.classList.remove('search-active');
      searchInput.value = '';
      updateDisplay();
    }
    if (!pokemonModal.classList.contains('hidden')) {
      pokemonModal.classList.add('hidden');
    }
  }
});

if (pokebolaBtn && fullMenu && menuButtonsContainer) {

  pokebolaBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    fullMenu.classList.toggle('hidden');
    showMainMenu();
  });

  menuButtonsContainer.addEventListener('click', async (event) => {
    event.stopPropagation();

    const targetButton = event.target;
    if (!targetButton.classList.contains('botao-menu')) return;

    const buttonText = targetButton.innerText;
    const filterType = targetButton.dataset.type;
    let reloadDisplay = true;

    if (buttonText === "Gerações") {
      showGenerationFilters();
      return;
    }
    if (buttonText === "Elementos") {
      showElementFilters();
      return;
    }
    if (buttonText === "Estágio Evolutivo") {
      showStageFilters();
      return;
    }
    if (buttonText === "Ordenar por...") {
      showSortFilters();
      return;
    }
    if (filterType === "back" || buttonText === "Voltar") {
      showMainMenu();
      return;
    }

    fullMenu.classList.add('hidden');
    
    offset = allPokemons.length;
    currentGenerationPokemons = []; 
    
    
    if (buttonText === "Resetar Filtros") {
      activeFilter = { value: "Todos", type: null };
      activeSort = "id_asc";
      await loadAllPokemonData(limit); 
        reloadDisplay = false; 
    }
    else if (filterType === 'sort') {
      activeSort = sortMenuItems[buttonText];
    } else if (filterType === 'gen') {
      activeFilter = { value: buttonText, type: filterType };
      const genNumber = parseInt(buttonText.split(' ')[1]);
      await loadPokemonCardsByGeneration(genNumber); 
        reloadDisplay = false; 
    }
    else if (buttonText === "Todos") {
        activeFilter = { value: "Todos", type: null };
        currentGenerationPokemons = allPokemons; 
    }
    else {
      activeFilter = { value: buttonText, type: filterType === 'main' ? null : filterType };
    }

    searchInput.value = '';
    if (headerContainer.classList.contains('search-active')) {
        searchBarContainer.classList.add('hidden');
        headerContainer.classList.remove('search-active');
    }

    if (reloadDisplay) {
        updateDisplay();
    }
  });
}

// --- inicialização ---
(async () => {
    await loadAllPokemonData();
    await fetchAndLoadGenerations();
    await fetchAndLoadElements();
})();
