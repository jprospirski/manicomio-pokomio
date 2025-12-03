# ⚡ Manicômio Pokômio

> **Pokédex Interativa (SPA) consumindo dados em tempo real da PokéAPI.**

![Status do Projeto](https://img.shields.io/badge/Status-Finalizado-green) ![API](https://img.shields.io/badge/API-Integada-blue)

## 📖 Sobre o Projeto

O **Manicômio Pokômio** é uma aplicação web desenvolvida para explorar o universo Pokémon de forma dinâmica. Diferente de versões anteriores que utilizavam dados estáticos, esta versão final opera como uma **Single Page Application (SPA)** conectada diretamente à **[PokéAPI](https://pokeapi.co/)**.

Isso significa que todos os dados — estatísticas, tipos, evoluções e sprites — são requisitados em tempo real, garantindo informações sempre atualizadas e sem a necessidade de manter arquivos JSON gigantescos localmente.

---

## 🚀 Funcionalidades

### 🌐 Integração com API (Backend-less)
- **Consumo de Dados Dinâmico**: Utilização da Fetch API para buscar informações detalhadas de cada Pokémon sob demanda.
- **Tratamento de Dados**: Processamento assíncrono para garantir uma interface fluida durante o carregamento das informações.

### 🧠 Experiência do Usuário (UX)
- **Busca Inteligente**: Pesquise por nome ou ID do Pokémon instantaneamente.
- **Filtros Avançados**:
  - Por Geração
  - Por Tipo (Fogo, Água, Planta, etc.)
  - Por Estágio Evolutivo
- **Ordenação**: Classifique a lista por ID, Nome (A-Z/Z-A), Altura ou Peso.
- **Favoritos Persistentes**: Seus Pokémons favoritos ficam salvos no `localStorage` do navegador, permanecendo lá mesmo após fechar a aba.

### 🎨 Interface (UI)
- **Design Retrô**: Estilização inspirada nos clássicos jogos de GameBoy.
- **Modal de Detalhes**: Visualize stats completos, cadeia evolutiva interativa e descrições sem sair da tela principal.
- **Responsividade**: Layout adaptável para Desktops, Tablets e Smartphones.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando os pilares do desenvolvimento web moderno, sem frameworks pesados, focando em performance e lógica pura.

| Tecnologia | Descrição |
| :--- | :--- |
| **HTML5** | Estruturação semântica do conteúdo. |
| **CSS3** | Estilização, variáveis (CSS Variables), Flexbox e Grid Layout. |
| **JavaScript (ES6+)** | Lógica da aplicação, manipulação do DOM e **Fetch API** para requisições HTTP. |
| **PokéAPI** | Fonte externa de dados (RESTful API). |
| **LocalStorage** | Armazenamento local para a funcionalidade de "Favoritos". |

---

## 📂 Estrutura de Arquivos

```text
manicomio-pokomio/
├── assets/          # Imagens estáticas (ícones, logos, backgrounds)
├── docs/            # Documentação auxiliar
├── index.html       # Ponto de entrada da aplicação
├── script.js        # Lógica principal e chamadas à API
├── style.css        # Folhas de estilo
└── README.md        # Documentação do projeto
```

## 🤝 Desenvolvedores

Projeto desenvolvido como parte da disciplina de Engenharia de Software.

- Cauã Buch Domingues
- Christopher Adam Oliveira dos Santos
- João Pedro Rospirski Pegorini
- João Rafael Tedesqui
- Leonardo Barth

## 🧡 Licença
Este projeto é de uso acadêmico e livre para fins educacionais.  
Desenvolvido como parte da disciplina de **Engenharia de Software**.
