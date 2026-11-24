import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { loadFromCloud } from "./state.js";
import {
  renderTable, renderSummary, bindHeaderFields, bindActions
} from "./ui.js";

const $ = (sel) => document.querySelector(sel);

// --- Вход ---
$("#loginBtn").addEventListener("click", async () => {
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  $("#loginError").textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    $("#loginError").textContent = "Ошибка входа: " + e.message;
  }
});

$("#logoutBtn").addEventListener("click", () => signOut(auth));

// --- Слежение за состоянием ---
let bootstrapped = false;

onAuthStateChanged(auth, async (user) => {
  const loginBox = $("#loginBox");
  const appBox = $("#appBox");

  if (user) {
    loginBox.hidden = true;
    appBox.hidden = false;

    if (!bootstrapped) {
      bootstrapped = true;
      await loadFromCloud();
      bindHeaderFields();
      bindActions();
      renderTable();
    } else {
      renderTable();
    }
  } else {
    loginBox.hidden = false;
    appBox.hidden = true;
    bootstrapped = false;
  }
});