const pokeContainer = document.querySelector("#pokeContainer");
const pokemonModal = document.querySelector("#pokemonModal");
const closeModalButton = document.querySelector("#closeModal");
const modalInfo = document.querySelector("#modalInfo");

const colors = {
  psíquico: '#ff61caff',
  fogo: '#ff6363ff',
  elétrico: '#f5ff35ff',
  fantasma: '#9040b5ff',
  grama: '#51b752ff',
}
const mainTypes = Object.keys(colors);

// Variável para armazenar todos os pokémons carregados
let allPokemons = [];

const loadPokemonCards = async () => {
  try {
    const resposta = await fetch('pokemons.json'); 
    if (!resposta.ok) {
      throw new Error(`Erro ao carregar pokemons.json: ${resposta.statusText}`);
    }
    allPokemons = await resposta.json(); // Armazena os pokemons
    
    // 2. Para cada pokemon encontrado no JSON, chama a função createPkCard
    for (const pokemon of allPokemons) {
      createPkCard(pokemon);
    }
  } catch (error) {
    console.error("Não foi possível carregar os pokémons:", error);
    pokeContainer.innerHTML = "<p>Erro ao carregar os dados. Verifique o console.</p>";
  }
}

const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");
  card.dataset.pokemonId = poke.id; // Adiciona um dataset para identificar o Pokémon

  const name = poke.nome;
  const id = poke.id;
  
  // Converte o ID "063" para o número 63 (necessário para a URL da imagem)
  const numericId = parseInt(id, 10); 
  
  const pokeTypes = poke.estilo.split('/'); 


  // Lógica de cor (depende do seu objeto 'colors')
  const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
  const color = colors[type];
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
  
  card.innerHTML = pokemonInnerHTML;
  pokeContainer.appendChild(card);

  // Adiciona o event listener para abrir o modal
  card.addEventListener('click', () => showPokemonModal(poke));
}

const showPokemonModal = (pokemon) => {
  const numericId = parseInt(pokemon.id, 10);
  const pokeTypes = pokemon.estilo.split('/');
  const type = mainTypes.find(type => pokeTypes.some(t => t === type)); // Encontra o tipo principal para a cor
  const color = colors[type] || '#ccc'; // Cor padrão se não encontrar

  const evolutionImages = pokemon.evolucoes.map(evoId => {
    const evoNumericId = parseInt(evoId, 10);
    return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoNumericId}.png" alt="Evolution ${evoId}" class="evolution-img">`;
  }).join(' <span class="evolution-arrow">></span> ');

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
  pokemonModal.classList.remove('hidden');
}

// Event listener para fechar o modal
closeModalButton.addEventListener('click', () => {
  pokemonModal.classList.add('hidden');
});

// Fecha o modal se clicar fora dele
window.addEventListener('click', (event) => {
  if (event.target === pokemonModal) {
    pokemonModal.classList.add('hidden');
  }
});

// Inicia a aplicação chamando a função principal
loadPokemonCards();