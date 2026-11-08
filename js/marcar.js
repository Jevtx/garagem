// Ferramenta para marcar pontos de informação em um modelo 3D.
// Clique no carro para posicionar o ponto, escreva o texto e copie o código gerado.
const $ = (id) => document.getElementById(id);
const mv = $("mv");
const MAXIMO = 8;

let pontos = [];
let rascunho = null;
let inicioClique = null;

function criarPonto(ponto, rotulo, slot, ehRascunho = false) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.slot = slot;
  botao.className = "ponto" + (ehRascunho ? " rascunho" : "");
  botao.dataset.position = ponto.posicao;
  botao.dataset.normal = ponto.normal;
  botao.dataset.visibilityAttribute = "visible"; // faz o model-viewer marcar o ponto como visível (data-visible)
  botao.textContent = rotulo;
  return botao;
}

function desenhar() {
  mv.querySelectorAll("[slot^='hotspot-']").forEach((el) => el.remove());
  pontos.forEach((p, i) => mv.append(criarPonto(p, String(i + 1), `hotspot-${i + 1}`)));
  if (rascunho) mv.append(criarPonto(rascunho, "+", "hotspot-rascunho", true));

  $("lista").innerHTML = "";
  pontos.forEach((p, i) => {
    const item = document.createElement("li");
    const nome = document.createElement("span");
    nome.textContent = `${i + 1}. ${p.titulo}`;
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "btn perigo";
    remover.textContent = "Remover";
    remover.addEventListener("click", () => { pontos.splice(i, 1); desenhar(); });
    item.append(nome, remover);
    $("lista").append(item);
  });

  // Formato salvo no cadastro: lista de pontos em texto JSON.
  $("saida").value = pontos.length ? JSON.stringify(pontos) : "";
  $("novo").hidden = !rascunho;
}

$("btnCarregar").addEventListener("click", () => {
  const caminho = $("caminho").value.trim();
  if (!caminho) return;
  if (pontos.length && !confirm("Carregar outro modelo apaga os pontos marcados. Continuar?")) return;
  pontos = [];
  rascunho = null;
  desenhar();
  $("status").textContent = "Carregando o modelo…";
  mv.src = caminho;
});

mv.addEventListener("load", () => {
  $("status").textContent = "Modelo carregado. Clique sobre o carro onde quer colocar um ponto. Arraste para girar.";
});
mv.addEventListener("error", () => {
  $("status").textContent = "Não foi possível carregar o modelo. Confira o caminho do arquivo.";
});

// Só conta como clique de marcação se o mouse não foi arrastado (arrastar gira o carro).
mv.addEventListener("pointerdown", (e) => { inicioClique = { x: e.clientX, y: e.clientY }; });
mv.addEventListener("click", (e) => {
  if (e.target.closest(".ponto") || !inicioClique || !mv.src) return;
  if (Math.hypot(e.clientX - inicioClique.x, e.clientY - inicioClique.y) > 5) return;
  if (pontos.length >= MAXIMO) {
    $("status").textContent = `Limite de ${MAXIMO} pontos por carro.`;
    return;
  }
  const caixa = mv.getBoundingClientRect();
  const acerto = mv.positionAndNormalFromPoint(e.clientX - caixa.left, e.clientY - caixa.top);
  if (!acerto) {
    $("status").textContent = "Clique diretamente sobre o carro, não sobre o fundo.";
    return;
  }
  rascunho = { posicao: acerto.position.toString(), normal: acerto.normal.toString() };
  $("status").textContent = "Escreva o título e o texto do ponto e clique em Adicionar.";
  desenhar();
  $("titulo").focus();
});

$("btnAdicionar").addEventListener("click", () => {
  const titulo = $("titulo").value.trim();
  if (!titulo) { $("titulo").focus(); return; }
  pontos.push({ ...rascunho, titulo, texto: $("texto").value.trim() });
  rascunho = null;
  $("titulo").value = "";
  $("texto").value = "";
  $("status").textContent = "Ponto adicionado. Clique em outro lugar para marcar o próximo.";
  desenhar();
});

$("btnDescartar").addEventListener("click", () => { rascunho = null; desenhar(); });

$("btnCopiar").addEventListener("click", async () => {
  if (!$("saida").value) { $("aviso").textContent = "Marque ao menos um ponto antes de copiar."; return; }
  try {
    await navigator.clipboard.writeText($("saida").value);
    $("aviso").textContent = "Código copiado. Cole no campo de pontos do cadastro do carro.";
  } catch {
    $("saida").select();
    $("aviso").textContent = "Selecione o código e copie com Ctrl + C.";
  }
});

desenhar();
