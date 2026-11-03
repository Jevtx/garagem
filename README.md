# Garagem

Catálogo de carros com modelo 3D animado, ficha técnica e curiosidades.
HTML + CSS + JavaScript puro, Firebase (Firestore + Authentication) e Netlify.

## Estrutura
- `index.html`: catálogo (prévia dos carros)
- `carro.html`: detalhes com modelo 3D
- `admin.html`: cadastro, edição e exclusão (exige login)
- `js/carros.js`: as 5 funções de banco (SELECT, INSERT, UPDATE, DELETE)
- `js/firebase.js`: configuração do projeto Firebase
- `assets/models/`: arquivos `.glb`
- `assets/img/`: imagens de prévia

## Rodar localmente
Use a extensão Live Server do VS Code, ou `python -m http.server 8000` na pasta do projeto.

## Créditos dos modelos 3D
Cada carro mostra o crédito do autor do modelo na página de detalhes.
