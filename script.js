const pokeContainer = document.querySelector("#pokeContainer");
const pokemonCount = 100//tem 1302 pokemons
const colors = {
  fire: '#ff7944ff',
  grass: '#5bff66ff',
  electric: '#ffe667ff',
  water: '#63ceffff',
  ground: '#815428ff',
  rock: '#989898ff',
  fairy: '#ec83ffff',
  poison: '#65ffb2ff',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5'
}

const mainTypes = Object.keys(colors);

const fetchPokemons = async () => {
  for (let i = 1; i <= pokemonCount; i++) {
    await getPokemons(i);
  }
}

const getPokemons = async (id) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`
  const resposta = await fetch(url);
  const data = await resposta.json();
  createPkCard(data)
}

const createPkCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add("pokemon");

  const name = poke.name[0].toUpperCase() + poke.name.slice(1);
  const id = poke.id.toString().padStart(3, '0');

  const pokeTypes = poke.types.map(type => type.type.name);
  const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
  const color = colors[type]

  card.style.backgroundColor = color;

  const pokemonInnerHTML = `
  <div class="imgContainer">
    <img
      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png"
      alt="${name}"
    />
  </div>
  <div class="infos">
    <span class="number">#${id}</span>
    <h3 class="name">${name}</h3>
    <small class="type">Estilo: ${type}</small>
  </div>`

  card.innerHTML = pokemonInnerHTML;

  card.addEventListener('click', () => openModal(poke));
  pokeContainer.appendChild(card);
}

fetchPokemons()

const modal = document.getElementById('pokemonModal');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('closeModal');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

async function openModal(poke) {
  const name = poke.name[0].toUpperCase() + poke.name.slice(1);
  const id = poke.id.toString().padStart(3, '0');
  const types = poke.types.map(t => t.type.name).join(', ');
  const height = poke.height / 10; // metros
  const weight = poke.weight / 10; // kg

  const isFavorito = favoritos.includes(poke.id);

  async function getPokemonDescription(id) {
    const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
    const res = await fetch(url);
    const data = await res.json();

    // Pega o texto em português (pt-BR), ou inglês se não tiver
    const entry = data.flavor_text_entries.find(e => e.language.name === 'pt-BR')
              || data.flavor_text_entries.find(e => e.language.name === 'en');

    return entry ? entry.flavor_text.replace(/\n|\f/g, ' ') : 'Descrição não disponível.';
  }

  const description = await getPokemonDescription(poke.id);

  modalInfo.innerHTML = `
    <div class="pokemon-modal">
      <div class="image">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png" alt="${name}">
      </div>
      <div class="header">
        <h2>${name}</h2>
        <span class="id">#${id}</span>
      </div>
      <div class="infos">
        <p class="description">${description}</p>
        <div class="details">
          <span>INFOS</span>
          <p><strong>Tipo:</strong> <span class="type">${types}</span></p>
          <p><strong>Altura:</strong> ${height}m</p>
          <p><strong>Peso:</strong> ${weight}kg</p>
        </div>
        <div class="evolutions">
          <span>EVOLUÇÕES</span>
        </div>
      </div>
      <div class="actions">
        <button id="favBtn" class="favorite-btn ${isFavorito ? 'active' : ''}">
          ${isFavorito ? '★ Favorito' : '☆ Favoritar'}
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');

  const favBtn = document.getElementById('favBtn');
  favBtn.addEventListener('click', () => toggleFavorito(poke.id, favBtn));
}


function toggleFavorito(id, btn) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  btn.classList.toggle('active');
  btn.textContent = favoritos.includes(id) ? '★ Favorito' : '☆ Favoritar';
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', e => {
  if (e.target === modal) modal.classList.add('hidden');
});
