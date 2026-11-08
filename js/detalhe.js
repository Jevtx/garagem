import { buscarCarro, esc } from "./carros.js";

const raiz = document.getElementById("conteudo");
const id = new URLSearchParams(location.search).get("id");
const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ORBITA = "30deg 76deg 80%"; // ângulo inicial e distância da câmera (menor % = mais perto)

// Escapa o texto e transforma endereços http(s) em links clicáveis.
const comLinks = (texto) =>
  esc(texto).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

function mostrarErro(texto) {
  raiz.innerHTML = `<p class="msg erro">${esc(texto)} <a href="index.html">Voltar ao catálogo</a></p>`;
}

// Lê os pontos de informação salvos como texto JSON no cadastro (campo "pontos").
function lerPontos(c) {
  try {
    const lista = JSON.parse(c.pontos || "[]");
    return Array.isArray(lista) ? lista.filter((p) => p && p.posicao && p.normal && p.titulo).slice(0, 8) : [];
  } catch {
    return [];
  }
}

const htmlPonto = (p, i) =>
  `<button class="ponto" slot="hotspot-${i + 1}" data-position="${esc(p.posicao)}" data-normal="${esc(p.normal)}"
    data-visibility-attribute="visible" data-indice="${i}" aria-label="${esc(p.titulo)}">${i + 1}</button>`;

function montarPalco(c, nome, pontos) {
  if (!c.modeloUrl) {
    return c.imagem ? `<div class="palco"><div class="visor"><img src="${esc(c.imagem)}" alt="${esc(nome)}"></div>
      <p class="aviso-modelo">Este carro ainda não tem modelo 3D.</p></div>` : "";
  }
  return `
    <div class="palco">
      <div class="visor">
        <model-viewer id="mv" src="${esc(c.modeloUrl)}" ${c.imagem ? `poster="${esc(c.imagem)}"` : ""}
          alt="Modelo 3D do ${esc(nome)}" camera-controls touch-action="pan-y"
          camera-orbit="${ORBITA}" min-camera-orbit="auto 15deg 35%" max-camera-orbit="auto 88deg 150%" ${reduzMovimento ? "" : "auto-rotate autoplay"}
          environment-image="neutral" shadow-intensity="1" exposure="1" interaction-prompt="none"
          ar ar-modes="webxr scene-viewer quick-look" reveal="auto">
          <button slot="ar-button" class="btn primario ar">Ver no seu ambiente</button>
          ${pontos.map(htmlPonto).join("")}
        </model-viewer>
      </div>
      <div class="comandos">
        <button class="btn" id="btnGiro">${reduzMovimento ? "Girar automaticamente" : "Parar giro"}</button>
        <button class="btn" id="btnCamera">Recentralizar câmera</button>
        <span id="grupoAnim" hidden>
          <select id="selAnim" aria-label="Animação do modelo"></select>
          <button class="btn" id="btnAnim">${reduzMovimento ? "Reproduzir animação" : "Pausar animação"}</button>
        </span>
      </div>
      <p class="aviso-modelo" id="avisoModelo">${pontos.length ? "Toque nos pontos numerados para ver detalhes. " : ""}Arraste para girar, use a roda do mouse ou dois dedos para aproximar.</p>
    </div>`;
}

function ligarControles(pontos = []) {
  const mv = document.getElementById("mv");
  if (!mv) return;
  const aviso = document.getElementById("avisoModelo");
  const textoPadrao = aviso.textContent;
  const btnGiro = document.getElementById("btnGiro");
  const btnAnim = document.getElementById("btnAnim");
  const selAnim = document.getElementById("selAnim");

  // Clique em um ponto numerado: mostra o texto dele abaixo do visor.
  mv.addEventListener("click", (e) => {
    const botao = e.target.closest(".ponto");
    if (!botao) return;
    const jaAtivo = botao.classList.contains("ativo");
    mv.querySelectorAll(".ponto").forEach((b) => b.classList.remove("ativo"));
    if (jaAtivo) { aviso.textContent = textoPadrao; return; }
    const p = pontos[Number(botao.dataset.indice)];
    botao.classList.add("ativo");
    aviso.innerHTML = `<strong>${esc(p.titulo)}</strong> ${esc(p.texto || "")}`;
  });

  btnGiro.addEventListener("click", () => {
    mv.autoRotate = !mv.autoRotate;
    btnGiro.textContent = mv.autoRotate ? "Parar giro" : "Girar automaticamente";
  });
  document.getElementById("btnCamera").addEventListener("click", () => {
    mv.cameraOrbit = ORBITA;
    mv.cameraTarget = "auto auto auto";
    mv.fieldOfView = "auto";
  });

  mv.addEventListener("load", () => {
    const animacoes = mv.availableAnimations || [];
    if (!animacoes.length) return;
    // Os nomes vêm do arquivo (geralmente em inglês), então mostramos "Animação 1, 2...".
    selAnim.innerHTML = animacoes.map((a, i) => `<option value="${esc(a)}">Animação ${i + 1}</option>`).join("");
    selAnim.value = mv.animationName || animacoes[0];
    selAnim.hidden = animacoes.length === 1;
    document.getElementById("grupoAnim").hidden = false;
  });
  selAnim.addEventListener("change", () => { mv.animationName = selAnim.value; mv.play(); btnAnim.textContent = "Pausar animação"; });
  btnAnim.addEventListener("click", () => {
    if (mv.paused) { mv.play(); btnAnim.textContent = "Pausar animação"; }
    else { mv.pause(); btnAnim.textContent = "Reproduzir animação"; }
  });
  mv.addEventListener("error", () => {
    document.getElementById("avisoModelo").textContent =
      "Não foi possível carregar o modelo 3D. Confira o caminho do arquivo no cadastro do carro.";
  });
}

function montar(c) {
  const nome = `${c.marca} ${c.modelo}`;
  const pontos = lerPontos(c);
  document.title = `${nome} | Garagem`;

  const specs = [
    ["Motor", c.motor, "", true],
    ["Potência", c.potencia, "cv"],
    ["Torque", c.torque, "kgfm"],
    ["0 a 100 km/h", c.zeroA100, "s"],
    ["Velocidade máxima", c.velocidadeMax, "km/h"],
    ["Peso", c.peso, "kg"],
  ].filter(([, valor]) => valor !== null && valor !== undefined && valor !== "");

  const linhasSpec = specs.map(([rotulo, valor, unidade, largo]) =>
    `<div${largo ? ' class="largo"' : ""}><dt>${rotulo}</dt><dd>${esc(valor)}${unidade ? `<small>${unidade}</small>` : ""}</dd></div>`).join("");

  const curiosidades = String(c.curiosidades || "").split("\n").map((t) => t.trim()).filter(Boolean);

  raiz.innerHTML = `
    <article class="detalhe">
      ${montarPalco(c, nome, pontos)}
      <div class="info">
        <h1>${esc(c.modelo)}</h1>
        <div class="origem"><span>${esc(c.marca)}</span>${c.ano ? `<span>${esc(c.ano)}</span>` : ""}</div>
        ${c.descricao ? `<p class="descricao">${esc(c.descricao)}</p>` : ""}
        ${linhasSpec ? `<dl class="specs">${linhasSpec}</dl>` : ""}
        ${curiosidades.length ? `<section class="curiosidades"><h2>Curiosidades</h2><ul>${curiosidades.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>` : ""}
        ${c.credito ? `<p class="credito">Modelo 3D: ${comLinks(c.credito)}</p>` : ""}
      </div>
    </article>`;
  ligarControles(pontos);
}

async function iniciar() {
  if (!id) return mostrarErro("Nenhum carro foi selecionado.");
  try {
    const carro = await buscarCarro(id);
    if (!carro) return mostrarErro("Carro não encontrado.");
    montar(carro);
  } catch (erro) {
    console.error(erro);
    mostrarErro("Não foi possível carregar este carro.");
  }
}
iniciar();
