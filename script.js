const appData = {
  "usuario": {
    "id": "user001",
    "nome": "Visitante",
    "configuracoes": {
      "tema": "escuro",
      "idioma": "pt-BR"
    },
    "favoritos": []
  },

  "pokemons": [
    {
      "id": 1,
      "nome": "Bulbasaur",
      "tipos": ["grama", "veneno"],
  "altura": 0.7,
  "peso": 6.9,
  "descricao": "Uma estranha semente foi plantada em suas costas no nascimento.",
  "evolucoes": [{ "id": 2, "nome": "Ivysaur" }, { "id": 3, "nome": "Venusaur" }]
}
  ]
}

// Adicionar favorito
function adicionarFavorito(pokemonId) {
  if (!appData.usuario.favoritos.includes(pokemonId)) {
    appData.usuario.favoritos.push(pokemonId);
    salvarNoLocalStorage();
  }
}

// Remover favorito
function removerFavorito(pokemonId) {
  appData.usuario.favoritos =
    appData.usuario.favoritos.filter(id => id !== pokemonId);
  salvarNoLocalStorage();
}

// Salvar no navegador
function salvarNoLocalStorage() {
  localStorage.setItem("pokomioData", JSON.stringify(appData));
}

// Carregar ao abrir o site
function carregarDoLocalStorage() {
  const data = localStorage.getItem("pokomioData");
  if (data) {
    Object.assign(appData, JSON.parse(data));
  }
}

// Sempre carregar os dados no início
carregarDoLocalStorage();