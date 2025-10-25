// seletores de elementos globais
const pokeContainer = document.querySelector("#pokeContainer");
const pokemonModal = document.querySelector("#pokemonModal");
const closeModalButton = document.querySelector("#closeModal");
const modalInfo = document.querySelector("#modalInfo");

// seletores do menu de tela cheia
const pokebolaBtn = document.getElementById('pokebolaBtn');
const fullMenu = document.getElementById('fullMenu');
const menuButtonsContainer = document.getElementById('menuButtonsContainer');

// configurações de cores para tipos de Pokémon
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
const mainTypes = Object.keys(colors); // pega os nomes dos tipos de cores

let allPokemons = []; // armazena todos os pokémons carregados

// Carrega favoritos do localStorage
let favoritePokemons = JSON.parse(localStorage.getItem('favoritePokemons')) || [];

// Salva favoritos no localStorage
const saveFavorites = () => {
  localStorage.setItem('favoritePokemons', JSON.stringify(favoritePokemons));
};

// Verifica se um Pokémon é favorito
const isFavorite = (pokemonId) => {
  return favoritePokemons.includes(pokemonId);
};

// Adiciona/remove Pokémon dos favoritos
const toggleFavorite = (pokemonId, event) => {
  event.stopPropagation(); // <--- CRUCIAL: Impede que o clique na estrela se propague para o card ou modal
  if (isFavorite(pokemonId)) {
    favoritePokemons = favoritePokemons.filter(id => id !== pokemonId);
  } else {
    favoritePokemons.push(pokemonId);
  }
  saveFavorites();
  // Atualiza o card e o modal (se estiver aberto)
  updatePokemonCards(); // Recria todos os cards para atualizar as estrelas
  if (!pokemonModal.classList.contains('hidden') && modalInfo.dataset.pokemonId === pokemonId) {
    showPokemonModal(allPokemons.find(p => p.id === pokemonId)); // Recarrega o modal para atualizar a estrela
  }
};

// Atualiza todos os cards após uma mudança nos favoritos
const updatePokemonCards = () => {
  pokeContainer.innerHTML = ''; // Limpa o container
  allPokemons.forEach(pokemon => createPkCard(pokemon)); // Recria todos os cards
};


// carrega os cards dos pokémons
const loadPokemonCards = async () => {
  try {
    const resposta = await fetch('pokemons.json'); // busca o arquivo JSON
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar pokemons.json: ${resposta.statusText}`);
    }
    allPokemons = await resposta.json(); // converte a resposta para JSON

    updatePokemonCards(); // Cria e exibe todos os cards
  } catch (error) {
    console.error("Não foi possível carregar os pokémons:", error);
    pokeContainer.innerHTML = "<p>Erro ao carregar os dados. Verifique o console.</p>";
  }
}

// cria um card individual de pokémon
const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.pokemonId = poke.id; // armazena o ID do pokémon no card

  const name = poke.nome;
  const id = poke.id;
  const numericId = parseInt(id, 10);
  const pokeTypes = poke.estilo.split('/');

  const type = mainTypes.find(typeKey => pokeTypes.some(pokeType => pokeType === typeKey)); // encontra o tipo principal do pokémon
  const color = colors[type] || '#ccc'; // define a cor do card com base no tipo
  card.style.backgroundColor = color;

  const isFav = isFavorite(poke.id);
  const favoriteStar = isFav ? '<img src="assets/star-filled.png" alt="Favorito" class="favorite-star-icon">' : '<img src="assets/star-empty.png" alt="Não Favorito" class="favorite-star-icon">';


  const pokemonInnerHTML = `
    <div class="favorite-icon-wrapper" data-pokemon-id="${poke.id}">
        ${favoriteStar}
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

  card.innerHTML = pokemonInnerHTML; // insere o HTML do pokémon no card
  pokeContainer.appendChild(card); // adiciona o card ao container

  // Adiciona listener para o card (abre modal)
  card.addEventListener('click', () => showPokemonModal(poke));

  // Adiciona listener para o ícone de favorito
  const favoriteIconWrapper = card.querySelector('.favorite-icon-wrapper');
  if (favoriteIconWrapper) {
    favoriteIconWrapper.addEventListener('click', (event) => toggleFavorite(poke.id, event));
  }
}

// mostra o modal de detalhes do pokémon
// substitua sua função showPokemonModal por esta
const showPokemonModal = (pokemon) => {
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const type = mainTypes.find(t => pokeTypes.some(x => x === t));
  const color = colors[type] || '#ccc'; // cor do card (início do gradiente)

  // cor de fim do gradiente
  const modalBgColor = '#333';

  // monta as imagens de evolução (igual ao seu código)
  const evolutionImages = pokemon.evolucoes.map(evoId => {
    const evoNumericId = parseInt(evoId, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="evolution-img">`;
  }).join(' <span class="evolution-arrow">></span> ');

  const isFav = isFavorite(pokemon.id);
  const modalFavoriteStar = isFav ? '<img src="assets/star-filled.png" alt="Favorito" class="modal-favorite-icon">' : '<img src="assets/star-empty.png" alt="Não Favorito" class="modal-favorite-icon">';

  modalInfo.dataset.pokemonId = pokemon.id;

  modalInfo.innerHTML = `
    <div class="modal-favorite-wrapper" data-pokemon-id="${pokemon.id}">
        ${modalFavoriteStar}
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

  // agora aplicamos o gradiente dinamicamente ao container da imagem
  const modalImgContainer = modalInfo.querySelector('.modal-img-container');
  if (modalImgContainer) {
    modalImgContainer.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
  }

  //adiciona background as evoluções
  const evolutionImgs = modalInfo.querySelectorAll('.evolution-img');
  if (evolutionImgs.length > 0) {
    evolutionImgs.forEach(img => {
      img.style.background = `linear-gradient(0deg, ${color} -100%, ${modalBgColor} 100%)`;
    });
  }

  // finalmente mostra o modal
  pokemonModal.classList.remove('hidden');

  // mantém funcionalidade da estrela no modal
  const modalFavoriteWrapper = modalInfo.querySelector('.modal-favorite-wrapper');
  if (modalFavoriteWrapper) {
    modalFavoriteWrapper.addEventListener('click', (event) => toggleFavorite(pokemon.id, event));
  }
};


// fecha o modal de pokémon ao clicar no botão
closeModalButton.addEventListener('click', () => {
  pokemonModal.classList.add('hidden');
});

// fecha o modal de pokémon ao clicar fora dele
window.addEventListener('click', (event) => {
  if (event.target === pokemonModal) {
    pokemonModal.classList.add('hidden');
  }
});


// gerencia a lógica do menu lateral
if (pokebolaBtn && fullMenu && menuButtonsContainer) {

  // abre ou fecha o menu ao clicar na pokebola
  pokebolaBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // impede o fechamento imediato do menu
    fullMenu.classList.toggle('hidden'); // alterna a visibilidade do menu
  });

  // fecha o menu ao clicar em um dos botões
  menuButtonsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('menu-button')) {
      fullMenu.classList.add('hidden');

      const filterType = event.target.innerText;
      console.log(`Botão clicado: ${filterType}`);
      filterPokemons(filterType); // Chamada para a nova função de filtro
    }
  });

  // Função para filtrar Pokémon
  const filterPokemons = (filterType) => {
    pokeContainer.innerHTML = ''; // Limpa os Pokémon existentes
    let filtered = [];

    if (filterType === "Todos") {
      filtered = allPokemons;
    } else if (filterType === "Favoritos") {
      filtered = allPokemons.filter(poke => isFavorite(poke.id));
    } else {
      // Implemente a lógica para outros filtros (Gerações, Elementos, Formas, etc.)
      // Por enquanto, apenas um placeholder:
      // filtered = allPokemons.filter(poke => poke.estilo.includes(filterType.toLowerCase()));
      console.warn(`Filtro "${filterType}" não implementado ainda.`);
      filtered = allPokemons; // Mostra todos se o filtro não for reconhecido
    }

    if (filtered.length > 0) {
      filtered.forEach(pokemon => createPkCard(pokemon));
    } else {
      pokeContainer.innerHTML = `<p style="color:white; font-size: 1.2rem; text-align: center;">Nenhum Pokémon encontrado para "${filterType}".</p>`;
    }
  };


  // fecha o menu ao clicar em qualquer lugar fora dele, exceto no botão da pokebola
  window.addEventListener('click', (event) => {
    if (!fullMenu.classList.contains('hidden') &&
      !fullMenu.contains(event.target) &&
      event.target !== pokebolaBtn) {
      fullMenu.classList.add('hidden');
    }
  });

  // fecha o menu com a tecla ESC
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !fullMenu.classList.contains('hidden')) {
      fullMenu.classList.add('hidden');
    }
  });
}

// inicia o carregamento dos cards de pokémon
loadPokemonCards();