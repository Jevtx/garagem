// Configuração do Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAyMR6e9BVafhIEuG0WBWIQaCC8iegc-8",
  authDomain: "garagem-e5121.firebaseapp.com",
  projectId: "garagem-e5121",
  appId: "1:284970771315:web:88636b871e1a47d18b5b06",
};

if (firebaseConfig.apiKey.startsWith("COLE")) {
  console.warn("Configure js/firebase.js com os dados do seu projeto Firebase.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
