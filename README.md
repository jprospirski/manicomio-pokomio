# 📌 Pokômio – Pokédex Interativa

## 📖 Sobre o Projeto
O **Pokômio** é uma aplicação web que simula uma **Pokédex interativa**, permitindo visualizar Pokémons com suas informações principais (nome, imagem, tipos e dados básicos).  
O sistema também permite ao usuário **favoritar Pokémons** e manter suas preferências salvas no navegador, mesmo após fechar e reabrir a página.

Este projeto foi desenvolvido como parte da disciplina de **Engenharia de Software** no curso de **Ciência da Computação**, seguindo as etapas de:
- Levantamento de requisitos
- Protótipos de baixa e alta fidelidade
- Modelagem de dados (JSON)
- Implementação em JavaScript

---

## 🚀 Funcionalidades
- ✅ Listagem de Pokémons com **nome, imagem e dados básicos**  
- ✅ Exibição do **tipo** do Pokémon (fogo, água, grama etc.) com cores diferenciadas  
- ✅ **Favoritar Pokémons** para acesso rápido  
- ✅ **Persistência dos dados** via `localStorage` (mesmo após fechar o navegador)  
- ✅ Interface responsiva e amigável baseada em protótipo de alta fidelidade  

---

## 📂 Estrutura de Dados (JSON)
O projeto utiliza um **objeto central** para armazenar informações do usuário e dos Pokémons:

```json
{
  "usuario": {
    "id": "user001",
    "nome": "Visitante",
    "configuracoes": {
      "tema": "claro",
      "idioma": "pt-BR"
    },
    "favoritos": [25, 1]
  },
  "pokemons": [
    {
      "id": 25,
      "nome": "Pikachu",
      "tipos": ["elétrico"],
      "altura": 0.4,
      "peso": 6.0,
      "descricao": "Quando vários Pikachu se reúnem, sua eletricidade pode causar tempestades.",
      "evolucoes": [{ "id": 26, "nome": "Raichu" }]
    }
  ]
}