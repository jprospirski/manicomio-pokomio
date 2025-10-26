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
const colors = {
  psíquico: '#ff61caff',
  fogo: '#ff6363ff',
  elétrico: '#f5ff35ff',
  fantasma: '#9040b5ff',
  grama: '#51b752ff',
  água: '#6390f0ff',
  normal: '#a8a878ff',
  venenoso: '#a040a0ff',
  voador: '#a890f0ff',
  inseto: '#a8b820ff',
  terra: '#e0c068ff',
  lutador: '#c03028ff',
  pedra: '#b8a038ff',
  gelo: '#98d8d8ff',
  dragão: '#7038f8ff',
  aço: '#b8b8d0ff',
  noturno: '#705848ff',
  fada: '#ee99acff',
};
const mainTypes = Object.keys(colors);

// --- CONSTANTES DE IMAGEM ---
const STAR_FILLED_IMG = 'assets/star-filled.png';
const STAR_EMPTY_IMG = 'assets/star-empty.png';
const ALT_FAVORITO = 'Favorito';
const ALT_NAO_FAVORITO = 'Não Favorito';

// --- ESTADO DA APLICAÇÃO ---
let allPokemons = [];
let favoritePokemons = JSON.parse(localStorage.getItem('favoritePokemons')) || [];
let activeFilter = { value: "Todos", type: null };
let activeSort = "id_asc";

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

// --- Listener de scroll para mostrar/esconder o botão "Voltar ao Topo" ---
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) { // Mostra o botão após rolar 300px
    scrollToTopBtn.classList.remove('hidden');
  } else {
    scrollToTopBtn.classList.add('hidden');
  }
});

// --- FUNÇÕES DE FAVORITOS (Helpers) ---
const saveFavorites = () => {
  localStorage.setItem('favoritePokemons', JSON.stringify(favoritePokemons));
};

const isFavorite = (pokemonId) => {
  return favoritePokemons.includes(pokemonId);
};

// --- FUNÇÃO DE TOGGLE (Otimizada) ---
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

  const cardNoGrid = pokeContainer.querySelector(`.pokemon[data-pokemon-id="${pokemonId}"]`);

  if (activeFilter.value === "Favoritos" && !novoEstadoFavorito) {
    if (cardNoGrid) {
      cardNoGrid.remove();
    }
    if (pokeContainer.children.length === 0) {
      pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Nenhum Pokémon favorito encontrado.</p>`;
    }
  } else {
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
const parseStat = (statString) => {
  return parseFloat(statString.replace(/m|kg/g, ''));
}

const getFilteredPokemons = () => {
  const { value, type } = activeFilter;

  if (value === "Todos") {
    return allPokemons;
  }
  if (value === "Favoritos") {
    return allPokemons.filter(poke => isFavorite(poke.id));
  }
  if (type === "gen") {
    const genNumber = parseInt(value.split(' ')[1]);
    return allPokemons.filter(poke => poke.infos.geracao === genNumber);
  }
  if (type === "element") {
    const elementType = value.toLowerCase();
    return allPokemons.filter(poke => poke.estilo.split('/').includes(elementType));
  }
  if (type === "stage") {
    if (value === "Estágio Inicial") {
      return allPokemons.filter(p => p.id === p.evolucoes[0] && p.evolucoes.length > 1);
    }
    if (value === "Estágio Intermediário") {
      return allPokemons.filter(p => p.evolucoes.length > 1 && p.id !== p.evolucoes[0] && p.id !== p.evolucoes[p.evolucoes.length - 1]);
    }
    if (value === "Estágio Final") {
      return allPokemons.filter(p => p.id === p.evolucoes[p.evolucoes.length - 1] && p.evolucoes.length > 1);
    }
    if (value === "Estágio Único") {
      return allPokemons.filter(p => p.evolucoes.length === 1);
    }
  }

  console.warn(`Filtro "${value}" não implementado ainda.`);
  return allPokemons;
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

const loadPokemonCards = async () => {
  try {
    const resposta = await fetch('pokemons.json');
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar pokemons.json: ${resposta.statusText}`);
    }
    allPokemons = await resposta.json();

    const generations = new Set(allPokemons.map(p => p.infos.geracao));
    allGenerations = [...generations].sort((a, b) => a - b);

    const elements = new Set(allPokemons.flatMap(p => p.estilo.split('/')));
    allElements = [...elements].sort((a, b) => a.localeCompare(b));

    updateDisplay();

  } catch (error) {
    console.error("Não foi possível carregar os pokémons:", error);
    pokeContainer.innerHTML = "<p>Erro ao carregar os dados. Verifique o console.</p>";
  }
}

const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.pokemonId = poke.id;

  const name = poke.nome;
  const id = poke.id;
  const numericId = parseInt(id, 10);
  const pokeTypes = poke.estilo.split('/');

  const type = mainTypes.find(typeKey => pokeTypes.some(pokeType => pokeType === typeKey));
  const color = colors[type] || '#ccc';
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

// Mostra o modal (ATUALIZADO com evoluções clicáveis)
const showPokemonModal = (pokemon) => {
  const currentPokemonId = pokemon.id; // Guarda o ID atual para comparação
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const type = mainTypes.find(t => pokeTypes.some(x => x === t));
  const color = colors[type] || '#ccc';
  const modalBgColor = '#333';

  // Adiciona data-pokemon-id às imagens de evolução
  const evolutionImages = pokemon.evolucoes.map(evoId => {
    const evoNumericId = parseInt(evoId, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="evolution-img" data-pokemon-id="${evoId}">`;
  }).join(' <span class="evolution-arrow">></span> ');

  const isFav = isFavorite(pokemon.id);
  const modalFavoriteStarImg = isFav ? STAR_FILLED_IMG : STAR_EMPTY_IMG;
  const modalFavoriteStarAlt = isFav ? ALT_FAVORITO : ALT_NAO_FAVORITO;

  modalInfo.dataset.pokemonId = pokemon.id; // Guarda o ID atual no modal

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
        <p>Altura:${pokemon.infos.altura}</p>
        <p>Peso:${pokemon.infos.peso}</p>
        <p>Geração:${pokemon.infos.geracao}</p>
      </div>
      <div class="modal-description">
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

  // Aplica gradiente dinâmico
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

  pokemonModal.classList.remove('hidden'); // Mostra o modal

  // Adiciona listener para a estrela DO MODAL (com replace para evitar duplicidade)
  const modalFavoriteWrapper = modalInfo.querySelector('.modal-favorite-wrapper');
  if (modalFavoriteWrapper) {
    const newFavWrapper = modalFavoriteWrapper.cloneNode(true);
    modalFavoriteWrapper.replaceWith(newFavWrapper);
    newFavWrapper.addEventListener('click', (event) => toggleFavorite(pokemon.id, event));
  }
  
  // Adiciona listener para EVOLUÇÕES (com replace para evitar duplicidade)
  const evolutionChainContainer = modalInfo.querySelector('.evolution-chain');
  if (evolutionChainContainer) {
     const newEvoChain = evolutionChainContainer.cloneNode(true);
     evolutionChainContainer.replaceWith(newEvoChain);
     newEvoChain.addEventListener('click', (event) => {
      const clickedImage = event.target.closest('.evolution-img');
      if (clickedImage) {
        const clickedPokemonId = clickedImage.dataset.pokemonId;
        
        if (clickedPokemonId && clickedPokemonId !== currentPokemonId) { 
          const nextPokemon = allPokemons.find(p => p.id === clickedPokemonId);
          if (nextPokemon) {
            showPokemonModal(nextPokemon); 
          } else {
            console.error(`Pokémon com ID ${clickedPokemonId} não encontrado.`);
          }
        }
      }
    });
  }
};

// --- FUNÇÕES DE MENU ---
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
    const pokemon = allPokemons.find(p => p.id == pokemonId);
    if (pokemon) {
      showPokemonModal(pokemon);
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

  if (searchTerm === '') {
    updateDisplay();
    return;
  }

  const filtered = allPokemons.filter(pokemon => {
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
    // Garante que o menu principal seja exibido ao abrir
    showMainMenu();
  });

  menuButtonsContainer.addEventListener('click', (event) => {
    event.stopPropagation();

    const targetButton = event.target;
    if (!targetButton.classList.contains('menu-button')) return;

    const buttonText = targetButton.innerText;
    const filterType = targetButton.dataset.type;

    // --- LÓGICA DE NAVEGAÇÃO DO MENU ---
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

    // --- LÓGICA DE AÇÃO (Filtro, Sort ou Reset) ---
    fullMenu.classList.add('hidden'); // Fecha o menu

    if (buttonText === "Resetar Filtros") {
      activeFilter = { value: "Todos", type: null };
      activeSort = "id_asc";
    }
    else if (filterType === 'sort') {
      activeSort = sortMenuItems[buttonText];
    } else {
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

// --- INICIALIZAÇÃO ---
loadPokemonCards();