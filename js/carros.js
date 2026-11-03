// Funções de acesso ao banco (Firestore). Equivalem ao CRUD em SQL da coleção "carros".
import { db } from "./firebase.js";
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const colecao = collection(db, "carros");

// SELECT * FROM carros ORDER BY marca
export async function listarCarros() {
  const resultado = await getDocs(query(colecao, orderBy("marca")));
  return resultado.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// SELECT * FROM carros WHERE id = ?
export async function buscarCarro(id) {
  const d = await getDoc(doc(db, "carros", id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

// INSERT INTO carros (...) VALUES (...)
export async function inserirCarro(dados) {
  const ref = await addDoc(colecao, dados);
  return ref.id;
}

// UPDATE carros SET ... WHERE id = ?
export async function atualizarCarro(id, dados) {
  await updateDoc(doc(db, "carros", id), dados);
}

// DELETE FROM carros WHERE id = ?
export async function excluirCarro(id) {
  await deleteDoc(doc(db, "carros", id));
}

// Escapa texto antes de colocar no HTML (evita injeção de código).
export const esc = (valor) =>
  String(valor ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
