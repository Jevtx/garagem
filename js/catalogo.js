import { listarCarros, esc } from "./carros.js";

const grade = document.getElementById("grade");
const contagem = document.getElementById("contagem");
const msg = document.getElementById("msg");
const busca = document.getElementById("busca");
const filtroMarca = document.getElementById("filtroMarca");
const ordenacao = document.getElementById("ordenacao");

// Critérios de ordenação. Carros sem o valor do campo vão para o fim da lista.
const porMarca = (a, b) =>
  a.marca.localeCompare(b.marca, "pt-BR") || a.modelo.localeCompare(b.modelo, "pt-BR");

const porNumero = (campo, sentido) => (a, b) => {
  const semA = typeof a[campo] !== "number";
  const semB = typeof b[campo] !== "number";
  if (semA || semB) return semA - semB || porMarca(a, b);
  return (a[campo] - b[campo]) * sentido || porMarca(a, b);
};

const criterios = {
  marca: porMarca,
  potencia: porNumero("potencia", -1),   // maior potência primeiro
  zeroA100: porNumero("zeroA100", 1),    // menor tempo primeiro
  anoNovo: porNumero("ano", -1),
  anoAntigo: porNumero("ano", 1),
};
let carros = [];

function cartao(c) {
  const imagem = c.imagem ? `<img src="${esc(c.imagem)}" alt="${esc(c.marca)} ${esc(c.modelo)}" loading="lazy">` : "";
  const selo = c.modeloUrl ? `<span class="selo">3D</span>` : "";
  return `
    <a class="card" href="carro.html?id=${encodeURIComponent(c.id)}">
      <div class="card-img">${imagem}${selo}</div>
      <div class="card-corpo">
        <h2>${esc(c.modelo)}</h2>
        <div class="linha">
          <span>${esc(c.marca)}</span>
          <span class="numeros">${c.ano ? `<span>${esc(c.ano)}</span>` : ""}${c.potencia ? `<span>${esc(c.potencia)} cv</span>` : ""}</span>
        </div>
      </div>
    </a>`;
}

function desenhar() {
  const termo = busca.value.trim().toLowerCase();
  const marca = filtroMarca.value;
  const visiveis = carros.filter((c) =>
    (!marca || c.marca === marca) && `${c.marca} ${c.modelo}`.toLowerCase().includes(termo));

  visiveis.sort(criterios[ordenacao.value] || porMarca);

  grade.innerHTML = visiveis.map(cartao).join("");
  contagem.textContent = `${visiveis.length} ${visiveis.length === 1 ? "carro" : "carros"}`;
  msg.className = "msg";
  msg.textContent = visiveis.length ? "" :
    carros.length ? "Nenhum carro encontrado. Limpe a busca ou o filtro para ver todos." : "Nenhum carro cadastrado ainda.";
}

async function iniciar() {
  try {
    carros = await listarCarros();
    [...new Set(carros.map((c) => c.marca))].sort().forEach((m) =>
      filtroMarca.insertAdjacentHTML("beforeend", `<option value="${esc(m)}">${esc(m)}</option>`));
    desenhar();
  } catch (erro) {
    console.error(erro);
    contagem.textContent = "";
    msg.className = "msg erro";
    msg.textContent = "Não foi possível carregar o catálogo. Verifique sua conexão e recarregue a página.";
  }
}

busca.addEventListener("input", desenhar);
filtroMarca.addEventListener("change", desenhar);
ordenacao.addEventListener("change", desenhar);
iniciar();
