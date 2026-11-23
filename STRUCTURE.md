# Estrutura do Projeto - IdlePoke

Este documento mapeia a estrutura de arquivos do projeto **IdlePoke** para facilitar a manutenção e navegação.

## 📂 Estrutura de Diretórios

### 📁 Raiz (Root)
- `index.html`: Ponto de entrada do HTML.
- `package.json`: Dependências e scripts do projeto.
- `vite.config.ts`: Configuração do build Vite.
- `style.css`: Estilos globais e variáveis de design.
- `README.md`: Documentação geral do projeto.
- `roadmap.md`: Planejamento de recursos e bugs.
- `demian_poem.txt`: Arquivo de texto (criado durante interação).

### 📁 assets/
- `backgrounds/`: Mapas e ambientes (Kanto, Johto, etc.).
- `fonts/`: Fontes personalizadas para o jogo.
- `other/`: Ícones de redes sociais, avatares e elementos da UI.
- `sprites/`: Sprites de Pokémon (numerados por ID).

### 📁 react-version/ (Core do Jogo)
- **src/**
    - **assets/**: Imagens estáticas, logos e ícones internos.
    - **components/**: Componentes da UI (Botões, Painéis, Modais, Tela de Batalha).
    - **data/**: 
        - `db.js`: Banco de dados principal de Pokémon.
        - `evolutions.js`: Regras de evolução.
        - `expTable.ts`: Tabela de experiência.
        - `learnsets.ts`: Lista de movimentos por nível.
        - `moves.ts`: Definições de movimentos.
        - `routes.js`: Dados de mapas e regiões.
        - `upgrades.ts`: Dados de melhorias passivas.
    - **hooks/**: Lógica de estado reutilizável (ex: `usePokeState.ts`).
    - **types/**: Definições de tipos TypeScript para o projeto.
    - **utils/**: Funções auxiliares (ex: áudio, cálculos).
    - **App.tsx**: Componente principal que coordena o estado global e a renderização da UI.
    - **App.css**: Estilos específicos da aplicação.
    - **index.css**: Variáveis globais, temas (Glass, Cyberpunk, etc.) e resets.

## 🔑 Legendas de Componentes Chave
- **BattleScreen**: Lógica e visual da luta em tempo real.
- **MapPanel**: Navegação pelas regiões e rotas.
- **PokedexPanel**: Visualização de dados de Pokémon.
- **MartPanel**: Sistema de compras e economia.
- **usePokeState**: O "cérebro" do jogo (gerencia dinheiro, equipe, progresso, etc.).
