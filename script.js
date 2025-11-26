// --- SELETORES GLOBAIS ---
const pokeContainer = document.querySelector("#pokeContainer");
const pokemonModal = document.querySelector("#pokemonModal");
const closeModalButton = document.querySelector("#closeModal");
const modalInfo = document.querySelector("#modalInfo");
const pokebolaBtn = document.getElementById('pokebolaBtn');
const fullMenu = document.getElementById('fullMenu');
const menuButtonsContainer = document.getElementById('menuButtonsContainer');
const lupaBtn = document.querySelector('.lupa-icon');
const searchBarContainer = document.getElementById('searchBarContainer');
const searchInput = document.getElementById('pokemonSearchInput');
const headerContainer = document.querySelector('.header-container');
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// --- CONSTANTES DE CORES E TIPOS ---
// Updated and expanded color palette for all types
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
const STAR_FILLED_IMG = 'assets/star-filled.png';
const STAR_EMPTY_IMG = 'assets/star-empty.png';
const ALT_FAVORITO = 'Favorito';
const ALT_NAO_FAVORITO = 'Não Favorito';

// --- ESTADO DA APLICAÇÃO ---
let allPokemons = []; // Will store parsed Pokémon data from API
let rawPokemonList = []; // Will store initial list of Pokémon from API (name, url)
let favoritePokemons = JSON.parse(localStorage.getItem('favoritePokemons')) || [];
let activeFilter = { value: "Todos", type: null };
let activeSort = "id_asc";
let currentGenerationPokemons = []; // To store pokemons of the currently selected generation

// --- Listas de Menu ---
let allGenerations = []; // Will be populated from API
let allElements = []; // Will be populated from API
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

// --- Listener de scroll para mostrar/esconder o botão "Voltar ao Topo" ---
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) { // Mostra o botão após rolar 300px
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

// --- FUNÇÃO DE TOGGLE (CORRIGIDA) ---
const toggleFavorite = (pokemonId, event) => {
  event.stopPropagation(); // Impede que abra o modal ao clicar na estrela

  const pokemonEstaFavorito = isFavorite(pokemonId);
  
  // Atualiza o array de IDs favoritos
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
    const modalStarIcon = modalInfo.querySelector('.modal-favorite-icon');
    if (modalStarIcon) {
      modalStarIcon.src = novaImgSrc;
      modalStarIcon.alt = novoAltText;
    }
  }

  // 2. Lógica Especial: Se estamos visualizando APENAS os Favoritos
  if (activeFilter.value === "Favoritos") {
    if (!novoEstadoFavorito) {
      // Se desmarcou um favorito enquanto via a lista de favoritos, 
      // o ideal é recarregar a lista para garantir a ordem e evitar buracos ou duplicações.
      updateDisplay(); 
    }
  } else {
    // 3. Lógica Padrão: Estamos em "Todos" ou outra lista
    // Apenas atualiza a estrela do card específico, sem mexer no resto da lista
    const cardNoGrid = pokeContainer.querySelector(`.pokemon[data-pokemon-id="${pokemonId}"]`);
    if (cardNoGrid) {
      const starIcon = cardNoGrid.querySelector('.favorite-star-icon');
      if (starIcon) {
        starIcon.src = novaImgSrc;
        starIcon.alt = novoAltText;
      }
    }
  }

  if (!pokemonModal.classList.contains('hidden') && modalInfo.dataset.pokemonId == pokemonId) {
    const modalStarIcon = modalInfo.querySelector('.modal-favorite-icon');
    if (modalStarIcon) {
      modalStarIcon.src = novaImgSrc;
      modalStarIcon.alt = novoAltText;
    }
  }
};

// --- FUNÇÕES DE LÓGICA DE DADOS ---
const parseStat = (statValue) => {
    // PokeAPI returns height/weight in decimetres/hectograms, convert to meters/kg
    return parseFloat(statValue) / 10;
};

const getPokemonDescription = async (speciesUrl) => {
    try {
        const response = await fetch(speciesUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const speciesData = await response.json();
        // Find an English description
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
            currentEvolution = currentEvolution.evolves_to[0]; // Simple chain for now
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
        const primaryType = types[0]; // For card color

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const description = await getPokemonDescription(data.species.url);
        const generation = speciesData.generation ? parseInt(speciesData.generation.url.split('/').pop()) : 1;
        const evolutionChainIds = await getEvolutionChain(speciesData.evolution_chain.url);

        return {
            id: id,
            nome: name,
            estilo: types.join('/'),
            primaryType: primaryType, // Store primary type for easy access
            infos: {
                altura: `${parseStat(data.height)}m`, // Convert decimeters to meters
                peso: `${parseStat(data.weight)}kg`,   // Convert hectograms to kilograms
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
const updateDisplay = () => {
  const filteredList = getFilteredPokemons();
  const sortedList = applySort(filteredList);
  renderPokemons(sortedList);
};

const renderPokemons = (pokemonArray) => {
  pokeContainer.innerHTML = '';

  if (pokemonArray.length > 0) {
    pokemonArray.forEach(pokemon => createPkCard(pokemon));
  } else {
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
            .filter(type => !['unknown', 'shadow'].includes(type.name)) // Exclude irrelevant types
            .map(type => type.name.charAt(0).toUpperCase() + type.name.slice(1));
        allElements.sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("Error fetching elements (types):", error);
    }
};

const loadAllPokemonData = async (url = 'https://pokeapi.co/api/v2/pokemon?limit=1000') => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        rawPokemonList = data.results; // Store for later use, e.g., search

        const pokemonPromises = rawPokemonList.map(item => fetchPokemonData(item.url));
        const resolvedPokemons = await Promise.all(pokemonPromises);
        allPokemons = resolvedPokemons.filter(p => p !== null); // Filter out failed fetches

        // Initial population of allPokemons is complete, set currentGenerationPokemons to all for initial display
        currentGenerationPokemons = allPokemons;

        updateDisplay();
    } catch (error) {
        console.error("Error loading all Pokémon data:", error);
        pokeContainer.innerHTML = "<p>Erro ao carregar os dados. Verifique o console.</p>";
    }
};

const loadPokemonCardsByGeneration = async (genNumber) => {
    pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Carregando Pokémons da Geração ${genNumber}...</p>`;
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${genNumber}/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const genData = await response.json();

        const pokemonSpeciesUrls = genData.pokemon_species.map(species => species.url);
        const pokemonPromises = pokemonSpeciesUrls.map(async speciesUrl => {
            // Need to get the actual pokemon data, not just species
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
    }
};


const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.pokemonId = poke.id;

  const name = poke.nome;
  const id = poke.id;
  const numericId = parseInt(id, 10);
  const pokeTypes = poke.estilo.split('/');

  // Use the primary type for the card background color
  const primaryType = poke.primaryType;
  const color = colors[primaryType] || '#ccc';
  card.style.backgroundColor = color;

  const isFav = isFavorite(poke.id);
  const favoriteStarImg = isFav ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const favoriteStarAlt = isFav ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  const pokemonInnerHTML = `
    <div class="favorite-icon-wrapper" data-pokemon-id="${poke.id}">
        <img src="${favoriteStarImg}" alt="${favoriteStarAlt}" class="favorite-star-icon">
    </div>
    <div class="img-container">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${name}">
    </div>
    <div class="info">
      <span class="number">#${id}</span>
      <h3 class="name">${name}</h3>
      <small class="type">Tipo:<span>${pokeTypes.join(' / ')}</span></small>
    </div>
  `;

  card.innerHTML = pokemonInnerHTML;
  pokeContainer.appendChild(card);
}

// mostra o modal (ATUALIZADO com evoluções clicaveis)
const showPokemonModal = (pokemon) => {
  const currentPokemonId = pokemon.id;
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const primaryType = pokemon.primaryType; // Use the primary type for styling
  const color = colors[primaryType] || '#ccc';
  const modalBgColor = '#333';

  const evolutionImages = pokemon.evolucoes.map(evoId => {
    const evoNumericId = parseInt(evoId, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="evolution-img" data-pokemon-id="${evoId}">`;
  }).join(' <span class="evolution-arrow">></span> ');

  const isFav = isFavorite(pokemon.id);
  const modalFavoriteStarImg = isFav ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const modalFavoriteStarAlt = isFav ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  modalInfo.dataset.pokemonId = pokemon.id;

  modalInfo.innerHTML = `
    <div class="modal-favorite-wrapper" data-pokemon-id="${pokemon.id}">
        <img src="${modalFavoriteStarImg}" alt="${modalFavoriteStarAlt}" class="modal-favorite-icon">
    </div>
    <div class="modal-header">
      <div class="modal-img-container">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${pokemon.nome}">
      </div>
      <div class="modal-title-info">
        <h2 class="modal-name" style="color: ${color};">${pokemon.nome}</h2>
        <small class="modal-type">Tipo:<span>${pokeTypes.join(' / ')}</span></small>
        <span class="modal-number">#${pokemon.id}</span>
      </div>
    </div>
    <div class="modal-details">
      <div class="modal-stats">
        <h3>Infos</h3>
        <p>Altura: ${pokemon.infos.altura}</p>
        <p>Peso: ${pokemon.infos.peso}</p>
        <p>Geração: ${pokemon.infos.geracao}</p>
      </div>
      <div class="modal-description">
        <h3>Descrição</h3>
        <p>${pokemon.descricao}</p>
      </div>
    </div>
    <div class="modal-evolutions">
      <h3>Evoluções</h3>
      <div class="evolution-chain">
        ${evolutionImages}
      </div>
    </div>
  `;

  const modalImgContainer = modalInfo.querySelector('.modal-img-container');
  if (modalImgContainer) {
    modalImgContainer.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
  }
  const evolutionImgs = modalInfo.querySelectorAll('.evolution-img');
  if (evolutionImgs.length > 0) {
    evolutionImgs.forEach(img => {
      img.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
    });
  }

  pokemonModal.classList.remove('hidden');

  const modalFavoriteWrapper = modalInfo.querySelector('.modal-favorite-wrapper');
  if (modalFavoriteWrapper) {
    const newFavWrapper = modalFavoriteWrapper.cloneNode(true);
    modalFavoriteWrapper.replaceWith(newFavWrapper);
    newFavWrapper.addEventListener('click', (event) => toggleFavorite(pokemon.id, event));
  }

  const evolutionChainContainer = modalInfo.querySelector('.evolution-chain');
  if (evolutionChainContainer) {
     const newEvoChain = evolutionChainContainer.cloneNode(true);
     evolutionChainContainer.replaceWith(newEvoChain);
     newEvoChain.addEventListener('click', async (event) => {
      const clickedImage = event.target.closest('.evolution-img');
      if (clickedImage) {
        const clickedPokemonId = clickedImage.dataset.pokemonId;
        
        if (clickedPokemonId && clickedPokemonId !== currentPokemonId) { 
          const nextPokemon = allPokemons.find(p => p.id === clickedPokemonId);
          if (!nextPokemon) {
            // If the Pokémon isn't loaded yet (e.g., from a different generation filter)
            // Fetch it directly from API
            const rawPoke = rawPokemonList.find(p => p.url.includes(`/${parseInt(clickedPokemonId)}/`));
            if (rawPoke) {
                const fetchedNextPokemon = await fetchPokemonData(rawPoke.url);
                if (fetchedNextPokemon) {
                    allPokemons.push(fetchedNextPokemon); // Add to global list if not there
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

// --- funções do menu ---
const renderMenuButtons = (items, type) => {
  menuButtonsContainer.innerHTML = '';

  if (type !== 'main') {
    menuButtonsContainer.innerHTML = '<button class="menu-button" data-type="back">Voltar</button>';
  }

  items.forEach(item => {
    const button = document.createElement('button');
    button.classList.add('menu-button');
    button.dataset.type = type;

    if (type === 'gen') {
      button.innerText = `Geração ${item}`;
      button.dataset.value = `Geração ${item}`;
    } else {
      button.innerText = item;
      button.dataset.value = item;
    }
    menuButtonsContainer.appendChild(button);
  });
};

const showMainMenu = () => {
  renderMenuButtons(mainMenuItems, 'main');
};
const showGenerationFilters = () => {
  renderMenuButtons(allGenerations, 'gen');
};
const showElementFilters = () => {
  renderMenuButtons(allElements, 'element');
};
const showStageFilters = () => {
  renderMenuButtons(stageMenuItems, 'stage');
};
const showSortFilters = () => {
  renderMenuButtons(Object.keys(sortMenuItems), 'sort');
};

// --- EVENT LISTENERS GLOBAIS ---
pokeContainer.addEventListener('click', (event) => {
  const favoriteWrapper = event.target.closest('.favorite-icon-wrapper');
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

  let pokemonsToSearch = currentGenerationPokemons.length > 0 ? currentGenerationPokemons : allPokemons;

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
    if (!targetButton.classList.contains('menu-button')) return;

    const buttonText = targetButton.innerText;
    const filterType = targetButton.dataset.type;

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

    if (buttonText === "Resetar Filtros") {
      activeFilter = { value: "Todos", type: null };
      activeSort = "id_asc";
      currentGenerationPokemons = allPokemons; // Reset to all pokemons
    }
    else if (filterType === 'sort') {
      activeSort = sortMenuItems[buttonText];
    } else if (filterType === 'gen') {
      activeFilter = { value: buttonText, type: filterType };
      const genNumber = parseInt(buttonText.split(' ')[1]);
      await loadPokemonCardsByGeneration(genNumber); // Load specific generation
    }
    else if (buttonText === "Todos") {
        activeFilter = { value: "Todos", type: null };
        currentGenerationPokemons = allPokemons; // Ensure "Todos" loads all pokemons
    }
    else {
      activeFilter = { value: buttonText, type: filterType === 'main' ? null : filterType };
    }

    searchInput.value = '';
    if (headerContainer.classList.contains('search-active')) {
        searchBarContainer.classList.add('hidden');
        headerContainer.classList.remove('search-active');
    }

    updateDisplay();
  });
}

// --- inicialização ---
(async () => {
    await loadAllPokemonData();
    await fetchAndLoadGenerations();
    await fetchAndLoadElements();
})();
