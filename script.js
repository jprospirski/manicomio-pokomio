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