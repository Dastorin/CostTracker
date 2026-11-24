import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const docRef = doc(db, "planner", "main");

export const state = {
  period: "23.11 - 05.12",
  startBalance: 99000,
  rows: []
};

// Колбэк для отображения статуса синхронизации (задаётся извне)
let statusHandler = () => {};
export function setStatusHandler(fn) { statusHandler = fn; }

export async function saveToCloud() {
  try {
    statusHandler("saving");
    await setDoc(docRef, state);
    statusHandler("saved");
  } catch (e) {
    console.error("Ошибка сохранения:", e);
    statusHandler("error");
  }
}

export async function loadFromCloud() {
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      Object.assign(state, snap.data());
      statusHandler("loaded");
    } else {
      await saveToCloud();
    }
  } catch (e) {
    console.error("Ошибка загрузки:", e);
    statusHandler("error");
  }
}

// Утилиты
export function numOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function fmt(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}