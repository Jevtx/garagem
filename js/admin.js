import { auth } from "./firebase.js";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { listarCarros, inserirCarro, atualizarCarro, excluirCarro, esc } from "./carros.js";

const $ = (id) => document.getElementById(id);
const formLogin = $("formLogin"), telaAdmin = $("telaAdmin"), btnSair = $("btnSair");
const form = $("formCarro"), lista = $("lista"), aviso = $("aviso");

const campos = ["marca", "modelo", "ano", "motor", "potencia", "torque", "zeroA100",
  "velocidadeMax", "peso", "imagem", "modeloUrl", "descricao", "curiosidades", "credito"];
const numericos = ["ano", "potencia", "torque", "zeroA100", "velocidadeMax", "peso"];

let carros = [];
let idEdicao = null;

function avisar(texto, erro = false) {
  aviso.textContent = texto;
  aviso.className = erro ? "msg erro" : "msg";
}

function traduzir(erro) {
  console.error(erro);
  return erro.code === "permission-denied"
    ? "Sem permissão. Confira se o UID nas regras do Firestore é o desta conta."
    : "Não foi possível concluir a operação. Tente novamente.";
}

function sairDaEdicao() {
  idEdicao = null;
  form.reset();
  $("tituloForm").textContent = "Novo carro";
  $("btnSalvar").textContent = "Cadastrar carro";
  $("btnCancelar").hidden = true;
}

async function recarregar() {
  try {
    carros = await listarCarros(); // SELECT
    lista.innerHTML = carros.map((c) => `
      <tr>
        <td>${esc(c.marca)}</td><td>${esc(c.modelo)}</td><td>${esc(c.ano)}</td>
        <td>
          <button class="btn" data-acao="editar" data-id="${esc(c.id)}">Editar</button>
          <button class="btn perigo" data-acao="excluir" data-id="${esc(c.id)}">Excluir</button>
        </td>
      </tr>`).join("") || `<tr><td colspan="4">Nenhum carro cadastrado.</td></tr>`;
  } catch (erro) {
    avisar(traduzir(erro), true);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dados = {};
  for (const nome of campos) {
    const bruto = form.elements[nome].value.trim();
    dados[nome] = numericos.includes(nome) ? (bruto === "" ? null : Number(bruto)) : bruto;
  }
  try {
    if (idEdicao) await atualizarCarro(idEdicao, dados); // UPDATE
    else await inserirCarro(dados);                       // INSERT
    const mensagem = idEdicao ? "Carro atualizado." : "Carro cadastrado.";
    sairDaEdicao();
    avisar(mensagem);
    await recarregar();
  } catch (erro) {
    avisar(traduzir(erro), true);
  }
});

lista.addEventListener("click", async (e) => {
  const botao = e.target.closest("button[data-acao]");
  if (!botao) return;
  const carro = carros.find((c) => c.id === botao.dataset.id);
  if (!carro) return;

  if (botao.dataset.acao === "editar") {
    idEdicao = carro.id;
    for (const nome of campos) form.elements[nome].value = carro[nome] ?? "";
    $("tituloForm").textContent = `Editando ${carro.marca} ${carro.modelo}`;
    $("btnSalvar").textContent = "Salvar alterações";
    $("btnCancelar").hidden = false;
    avisar("");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (confirm(`Excluir ${carro.marca} ${carro.modelo}? Esta ação não pode ser desfeita.`)) {
    try {
      await excluirCarro(carro.id); // DELETE
      avisar("Carro excluído.");
      await recarregar();
    } catch (erro) {
      avisar(traduzir(erro), true);
    }
  }
});

$("btnCancelar").addEventListener("click", () => { sairDaEdicao(); avisar(""); });

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  $("avisoLogin").textContent = "";
  try {
    await signInWithEmailAndPassword(auth, $("email").value, $("senha").value);
  } catch {
    $("avisoLogin").textContent = "E-mail ou senha inválidos.";
  }
});

btnSair.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (usuario) => {
  formLogin.hidden = !!usuario;
  telaAdmin.hidden = !usuario;
  btnSair.hidden = !usuario;
  if (usuario) recarregar();
});
