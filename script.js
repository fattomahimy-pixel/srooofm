let currentUser = null;
let tables = [];
let drazMints = 0;

// تسجيل حساب جديد + 100 درازمينت
function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    document.getElementById("authMessage").textContent = "املأ اسم المستخدم وكلمة المرور!";
    return;
  }

  const users = JSON.parse(localStorage.getItem("dalla_users") || "{}");
  if (users[username]) {
    document.getElementById("authMessage").textContent = "اسم المستخدم موجود من قبل!";
    return;
  }

  users[username] = { password, tables: [], drazMints: 100 };
  localStorage.setItem("dalla_users", JSON.stringify(users));

  document.getElementById("authMessage").textContent = "تم إنشاء الحساب! حصلت على 100 درازمينت 💜";
  document.getElementById("authMessage").style.color = "green";
}

// تسجيل دخول + تحميل الدرازمينت
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    document.getElementById("authMessage").textContent = "املأ اسم المستخدم وكلمة المرور!";
    return;
  }

  const users = JSON.parse(localStorage.getItem("dalla_users") || "{}");
  if (!users[username] || users[username].password !== password) {
    document.getElementById("authMessage").textContent = "اسم المستخدم أو كلمة المرور غلط!";
    return;
  }

  currentUser = username;
  drazMints = users[currentUser].drazMints || 0;
  updateDrazDisplay();

  document.getElementById("welcome").textContent = `مرحبا ${currentUser} 👑`;
  switchPage("homePage");
  loadSavedTables();
}

// تحديث عرض الدرازمينت
function updateDrazDisplay() {
  const countEl = document.getElementById("drazCount");
  if (countEl) countEl.textContent = drazMints;
}

// عرض قائمة الإعلانات
function showAdsMenu() {
  if (!currentUser) {
    alert("سجل دخول أول!");
    return;
  }

  let menu = prompt(
    "اختر عدد الإعلانات اللي تبي تشوفها:\n" +
    "1 → 20 درازمينت\n" +
    "2 → 50 درازمينت\n" +
    "3 → 90 درازمينت\n" +
    "4 → 140 درازمينت\n" +
    "5 → 200 درازمينت\n" +
    "6 → 270 درازمينت\n" +
    "7 → 350 درازمينت\n" +
    "8 → 440 درازمينت\n" +
    "9 → 540 درازمينت\n" +
    "10 → 650 درازمينت\n\n" +
    "اكتب الرقم (1-10):"
  );

  menu = parseInt(menu);
  if (isNaN(menu) || menu < 1 || menu > 10) {
    alert("اختار رقم من 1 إلى 10!");
    return;
  }

  // محاكاة إعلان (30 ثانية على الأقل)
  alert(`إعلان رقم 1 بدأ! انتظر 30 ثانية على الأقل...`);
  setTimeout(() => {
    let reward = 0;
    switch(menu) {
      case 1: reward = 20; break;
      case 2: reward = 50; break;
      case 3: reward = 90; break;
      case 4: reward = 140; break;
      case 5: reward = 200; break;
      case 6: reward = 270; break;
      case 7: reward = 350; break;
      case 8: reward = 440; break;
      case 9: reward = 540; break;
      case 10: reward = 650; break;
    }

    drazMints += reward;
    const users = JSON.parse(localStorage.getItem("dalla_users") || "{}");
    users[currentUser].drazMints = drazMints;
    localStorage.setItem("dalla_users", JSON.stringify(users));

    updateDrazDisplay();
    alert(`خلصت ${menu} إعلانات! حصلت على ${reward} درازمينت 💜\nالإجمالي الحين: ${drazMints}`);
  }, 30000); // 30 ثانية
}

// دالة عرض الصفحة
function switchPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

function backToHome() {
  switchPage("homePage");
}

function showCustomizePage() {
  const container = document.getElementById("daysCheckboxes");
  container.innerHTML = "";
  ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].forEach(day => {
    const label = document.createElement("label");
    label.className = "checkbox-label";
    label.innerHTML = `<input type="checkbox" name="day" value="${day}" checked> ${day}`;
    container.appendChild(label);
  });
  switchPage("customizePage");
}

function createCustomizedTable() {
  const name = document.getElementById("newTableName").value.trim() || "جدول جديد";
  const selectedDays = [...document.querySelectorAll('input[name="day"]:checked')].map(cb => cb.value);
  const lessonsCount = parseInt(document.getElementById("lessonsCount").value);

  const tableEl = document.getElementById("table");
  tableEl.innerHTML = "";

  let headerRow = document.createElement("tr");
  headerRow.innerHTML = '<th>الحصة</th>';
  selectedDays.forEach(day => headerRow.innerHTML += `<th>${day}</th>`);
  tableEl.appendChild(headerRow);

  for (let i = 1; i <= lessonsCount; i++) {
    let row = document.createElement("tr");
    row.innerHTML = `<th>${i}</th>`;
    selectedDays.forEach(() => {
      let td = document.createElement("td");
      td.contentEditable = true;
      td.oninput = saveCurrentTable;
      row.appendChild(td);
    });
    tableEl.appendChild(row);
  }

  document.getElementById("welcome").textContent = name;
  document.getElementById("tableName").value = name;
  switchPage("tablePage");
}

function saveCurrentTable() {
  const name = document.getElementById("tableName").value.trim() || `جدول ${tables.length + 1}`;
  const currentTable = {
    name,
    content: document.getElementById("table").innerHTML
  };

  const existing = tables.findIndex(t => t.name === name);
  if (existing !== -1) tables[existing] = currentTable;
  else tables.push(currentTable);

  saveAllTables();
  updateSavedTablesList();
}

function saveAllTables() {
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem("dalla_users") || "{}");
  users[currentUser].tables = tables;
  localStorage.setItem("dalla_users", JSON.stringify(users));
}

function updateSavedTablesList() {
  const container = document.getElementById("savedTablesList");
  container.innerHTML = tables.length === 0 ? "<p>ما عندك جداول محفوظة بعد 😔</p>" : "";

  tables.forEach((tbl, i) => {
    const btn = document.createElement("button");
    btn.textContent = tbl.name || `جدول ${i + 1}`;
    btn.onclick = () => loadTable(tbl);
    btn.oncontextmenu = e => {
      e.preventDefault();
      if (confirm(`متأكد تبي تحذف "${tbl.name || 'هذا الجدول'}"؟`)) {
        tables.splice(i, 1);
        saveAllTables();
        updateSavedTablesList();
      }
    };
    container.appendChild(btn);
  });
}

function loadTable(tbl) {
  document.getElementById("table").innerHTML = tbl.content;
  document.getElementById("welcome").textContent = tbl.name || "جدولك الدراسي";
  document.getElementById("tableName").value = tbl.name || "";
  switchPage("tablePage");
}

function clearTable() {
  if (confirm("متأكد تبي تمسح الجدول؟")) {
    document.getElementById("table").innerHTML = "";
  }
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

function applyBackground() {
  const c1 = document.getElementById("bgColor1").value;
  const c2 = document.getElementById("bgColor2").value;
  const speed = document.getElementById("animSpeed").value + "s";

  document.body.style.setProperty("--bg-gradient", `linear-gradient(-45deg, ${c1}, ${c2}, #00ffa6, #ffcc00)`);
  document.body.style.setProperty("--animation-speed", speed);
}

// بداية التشغيل
window.addEventListener("load", () => {
  switchPage("authPage");
});