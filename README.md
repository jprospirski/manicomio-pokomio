# ⚡ Pokômio – Pokédex Interativa Avançada

## 🧩 Sobre o Projeto
O **Pokômio** é uma **Pokédex interativa** desenvolvida em **HTML, CSS e JavaScript puro**, que permite explorar Pokémons de forma dinâmica e visualmente envolvente.  
Cada Pokémon contém **detalhes completos, informações de geração, tipos, altura, peso, descrição e cadeia evolutiva**, com imagens oficiais diretamente da **PokeAPI**.

O sistema oferece **busca instantânea**, **filtros avançados**, **modal de detalhes**, **favoritos persistentes** e **menu interativo com múltiplas opções** — tudo salvo localmente no navegador do usuário.

---

## 🚀 Funcionalidades Principais

### 🧭 Navegação e Interface
- Interface moderna com design **retrô inspirado nos jogos clássicos**
- **Menu lateral interativo** com múltiplas categorias:
  - 🔹 Todos  
  - 🔹 Favoritos  
  - 🔹 Gerações  
  - 🔹 Elementos (Tipos)  
  - 🔹 Estágio Evolutivo  
  - 🔹 Ordenar por...  
  - 🔹 Resetar Filtros  

### 🧠 Sistema de Favoritos
- Adicione ou remova Pokémons dos favoritos clicando na ⭐  
- Estado salvo automaticamente via **`localStorage`**, garantindo persistência após recarregar ou fechar o navegador

### 🔍 Busca Inteligente
- Campo de pesquisa com **filtro em tempo real** por **nome ou ID**

### ⚙️ Filtros e Ordenação
- Filtro por **geração**, **tipo**, ou **estágio evolutivo** (Inicial, Intermediário, Final, Único)  
- Ordenação dinâmica por:
  - ID (padrão)
  - Nome (A–Z / Z–A)
  - Altura (maior/menor)
  - Peso (mais pesado/leve)

### 💾 Estrutura de Dados (JSON)
O arquivo `pokemons.json` contém todos os dados da aplicação:

```json
{
  "id": "001",
  "nome": "Bulbasaur",
  "estilo": "grama/venenoso",
  "infos": {
    "altura": "0.6m",
    "peso": "8.5kg",
    "geracao": 1
  },
  "descricao": "A semente em suas costas armazena energia solar...",
  "evolucoes": ["001", "002", "003"]
}
```

### 🪄 Modal Detalhado
- Exibe imagem, nome, tipo, altura, peso, geração e descrição  
- Mostra **toda a cadeia evolutiva com imagens clicáveis** para navegar entre evoluções  
- Contém **gradiente dinâmico** baseado no tipo do Pokémon

### 📱 Responsividade
- Totalmente otimizado para **desktop, tablet e mobile**  
- Layout fluido com grid adaptável e menus retráteis

### 🔝 Extras
- Botão flutuante de **“Voltar ao Topo”**  
- Gradientes e sombras dinâmicas para dar destaque aos tipos  
- Animações leves e transições suaves

---

## 🧰 Tecnologias Utilizadas

| Tecnologia | Função |
|-------------|--------|
| **HTML5** | Estrutura e semântica |
| **CSS3 (com Google Fonts)** | Estilo retrô e responsividade |
| **JavaScript (ES6+)** | Lógica, interatividade e manipulação DOM |
| **JSON** | Base de dados local dos Pokémons |
| **LocalStorage** | Persistência dos favoritos |

---

## 📂 Estrutura do Projeto

```
pokomio/
├── index.html
├── style.css
├── script.js
├── pokemons.json
└── assets/
    ├── pokebola.png
    ├── lupa.png
    ├── setacima.png
    ├── star-filled.png
    └── star-empty.png
```

---

## 🧑‍💻 Desenvolvedores
- Cauã Buch Domingues  
- Christopher Adam Oliveira dos Santos  
- João Pedro Rospirski Pegorini  
- João Rafael Tedesqui  
- Leonardo Barth  

---

## 🏁 Como Executar

1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/seuusuario/pokomio.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador moderno  
3. Explore, filtre, favorite e descubra Pokémons! ⚡

---

## 🧡 Licença
Este projeto é de uso acadêmico e livre para fins educacionais.  
Desenvolvido como parte da disciplina de **Engenharia de Software**.
