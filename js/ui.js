import { state, saveToCloud, numOrNull, fmt, setStatusHandler } from "./state.js";

const $ = (sel) => document.querySelector(sel);
const tbody = $("#tbody");
const syncStatusEl = $("#syncStatus");

// --- Статус синхронизации ---
setStatusHandler((status) => {
  syncStatusEl.classList.toggle("error", status === "error");
  syncStatusEl.textContent = {
    saving: "Сохранение...",
    saved:  "Все изменения сохранены",
    loaded: "Данные загружены из облака",
    error:  "Ошибка синхронизации"
  }[status] || "";
});

// --- Сводка ---
export function renderSummary() {
  let planSum = 0, factSum = 0;
  for (const r of state.rows) {
    if (r.plan !== null) planSum += r.plan;
    if (r.fact !== null) factSum += r.fact;
  }
  setValueWithClass($("#planRemainder"), state.startBalance - planSum);
  setValueWithClass($("#factRemainder"), state.startBalance - factSum);
  $("#planTotal").textContent = fmt(planSum);
  $("#factTotal").textContent = fmt(factSum);
}

function setValueWithClass(el, value) {
  el.textContent = fmt(value);
  el.classList.remove("pos", "neg");
  if (value < 0) el.classList.add("neg");
  else if (value > 0) el.classList.add("pos");
}

// --- Таблица ---
export function renderTable() {
  tbody.innerHTML = "";
  state.rows.forEach((row, idx) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.dataset.label = "Статья";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = row.name;
    nameInput.placeholder = "Название...";
    nameInput.addEventListener("input", (e) => {
      state.rows[idx].name = e.target.value;
      saveToCloud();
    });
    tdName.appendChild(nameInput);

    const tdPlan = document.createElement("td");
    tdPlan.className = "num";
    tdPlan.dataset.label = "План";
    const planInput = document.createElement("input");
    planInput.type = "number";
    planInput.step = "0.01";
    planInput.value = row.plan ?? "";
    planInput.addEventListener("input", (e) => {
      state.rows[idx].plan = numOrNull(e.target.value);
      saveToCloud();
      updateRowBalance(idx);
      renderSummary();
    });
    tdPlan.appendChild(planInput);

    const tdFact = document.createElement("td");
    tdFact.className = "num";
    tdFact.dataset.label = "Факт";
    const factInput = document.createElement("input");
    factInput.type = "number";
    factInput.step = "0.01";
    factInput.value = row.fact ?? "";
    factInput.addEventListener("input", (e) => {
      state.rows[idx].fact = numOrNull(e.target.value);
      saveToCloud();
      updateRowBalance(idx);
      renderSummary();
    });
    tdFact.appendChild(factInput);

    const tdBalance = document.createElement("td");
    tdBalance.className = "num";
    tdBalance.id = "balance-" + idx;
    tdBalance.dataset.label = "Баланс";

    const tdDelete = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn remove";
    delBtn.textContent = "−";
    delBtn.title = "Удалить эту статью";
    delBtn.addEventListener("click", async () => {
      state.rows.splice(idx, 1);
      await saveToCloud();
      renderTable();
    });
    tdDelete.appendChild(delBtn);

    tr.append(tdName, tdPlan, tdFact, tdBalance, tdDelete);
    tbody.appendChild(tr);
    updateRowBalance(idx);
  });
  renderSummary();
}

function updateRowBalance(idx) {
  const row = state.rows[idx];
  const cell = document.getElementById("balance-" + idx);
  if (!cell) return;
  cell.classList.remove("balance-pos", "balance-neg", "balance-zero");
  if (row.fact === null) {
    cell.innerHTML = '<span class="status">операции по статье ещё не было</span>';
    return;
  }
  const balance = (row.plan ?? 0) - row.fact;
  cell.textContent = fmt(balance);
  if (balance > 0) cell.classList.add("balance-pos");
  else if (balance < 0) cell.classList.add("balance-neg");
  else cell.classList.add("balance-zero");
}

// --- Форма "период / остаток" ---
export function bindHeaderFields() {
  $("#period").addEventListener("input", (e) => {
    state.period = e.target.value;
    saveToCloud();
  });
  $("#startBalance").addEventListener("input", (e) => {
    const v = Number(e.target.value);
    state.startBalance = Number.isFinite(v) ? v : 0;
    saveToCloud();
    renderSummary();
  });
  $("#period").value = state.period;
  $("#startBalance").value = state.startBalance;
}

// --- Кнопки-действия ---
export function bindActions() {
  $("#addRow").addEventListener("click", async () => {
    state.rows.push({ name: "", plan: null, fact: null });
    await saveToCloud();
    renderTable();
    const last = tbody.querySelector('tr:last-child input[type="text"]');
    if (last) last.focus();
  });

  $("#resetFacts").addEventListener("click", async () => {
    if (!confirm("Очистить все значения факта?")) return;
    state.rows.forEach((r) => { r.fact = null; });
    await saveToCloud();
    renderTable();
  });

  $("#resetAll").addEventListener("click", async () => {
    if (!confirm("Удалить ВСЕ строки? Действие необратимо.")) return;
    state.rows = [];
    await saveToCloud();
    renderTable();
  });
}