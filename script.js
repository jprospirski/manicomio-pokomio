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

// carrega os cards dos pokémons
const loadPokemonCards = async () => {
  try {
    const resposta = await fetch('pokemons.json'); // busca o arquivo JSON
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar pokemons.json: ${resposta.statusText}`);
    }
    allPokemons = await resposta.json(); // converte a resposta para JSON

    for (const pokemon of allPokemons) {
      createPkCard(pokemon); // cria um card para cada pokémon
    }
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

  const pokemonInnerHTML = `
    <div class="img-container">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${name}">
    </div>
    <div class="info">
      <span class="number">#${id}</span>
      <h3 class="name">${name}</h3>
      <small class="type">Tipo: <span>${pokeTypes.join(' / ')}</span></small>
    </div>
  `;

  card.innerHTML = pokemonInnerHTML; // insere o HTML do pokémon no card
  pokeContainer.appendChild(card); // adiciona o card ao container
  card.addEventListener('click', () => showPokemonModal(poke)); // abre o modal ao clicar no card
}

// mostra o modal de detalhes do pokémon
const showPokemonModal = (pokemon) => {
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const type = mainTypes.find(typeKey => pokeTypes.some(t => t === typeKey));
  const color = colors[type] || '#ccc';

  const evolutionImages = pokemon.evolucoes.map(evoId => { // mapeia as evoluções para imagens
    const evoNumericId = parseInt(evoId, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="evolution-img">`;
  }).join(' <span class="evolution-arrow">></span> '); // adiciona uma seta entre as imagens de evolução

  modalInfo.innerHTML = `
    <div class="modal-header">
      <div class="modal-img-container" style="background-color: ${color};">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png" alt="${pokemon.nome}">
      </div>
      <div class="modal-title-info">
        <h2 class="modal-name">${pokemon.nome}</h2>
        <small class="modal-type">Tipo: <span>${pokeTypes.join(' / ')}</span></small>
        <span class="modal-number">#${pokemon.id}</span>
      </div>
    </div>
    <div class="modal-details">
      <div class="modal-stats">
        <h3>Infos</h3>
        <p><strong>Altura:</strong> ${pokemon.infos.altura}</p>
        <p><strong>Peso:</strong> ${pokemon.infos.peso}</p>
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
  pokemonModal.classList.remove('hidden'); // exibe o modal
}

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
      // filterPokemons(filterType); // função de filtro deve ser adicionada aqui
    }
  });

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