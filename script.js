// script.js

// ─────────────────────────────────────────────────────────────────
//  Firebase Setup
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKaa99EeFbXPP4YxPZMPqTuqjMQyFsMio",
  authDomain: "partner-dashboard-83433.firebaseapp.com",
  projectId: "partner-dashboard-83433",
  storageBucket: "partner-dashboard-83433.firebasestorage.app",
  messagingSenderId: "998003403808",
  appId: "1:998003403808:web:c59c6b584b0a3a9568a045",
  measurementId: "G-5Z0BPGB8JD"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
window.db = db;

console.log("Firebase & Firestore initialized successfully!");


// ─────────────────────────────────────────────────────────────────
//  HELPER: Convert Firestore Timestamp or plain value → JS Date
// ─────────────────────────────────────────────────────────────────
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
}


// ─────────────────────────────────────────────────────────────────
//  HELPER: Add N calendar months to a date (preserving day-of-month)
//  e.g. addMonths(March 11, 1) → April 11
// ─────────────────────────────────────────────────────────────────
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}


// ─────────────────────────────────────────────────────────────────
//  MAIN: Populate the audit table
// ─────────────────────────────────────────────────────────────────
async function populateTable() {
  const tbody = document.getElementById("audit-table");
  if (!tbody) { console.error("audit-table tbody not found"); return; }

  tbody.innerHTML = "";

  const company = localStorage.getItem("company");
  if (!company) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Please log in</td></tr>';
    return;
  }

  try {
    // ── 1. Fetch client document ──────────────────────────────────
    const clientsRef = collection(db, "clients");
    const clientQ    = query(clientsRef, where("company", "==", company));
    const clientSnap = await getDocs(clientQ);

    if (clientSnap.empty) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Client not found</td></tr>';
      return;
    }

    const clientData = clientSnap.docs[0].data();
    const clientId   = clientSnap.docs[0].id;

    // ── 2. Determine account start date ──────────────────────────
    //   Old users (createdAt before March 1, 2026) → forced to March 1, 2026
    //   New users (createdAt on/after March 1, 2026) → use their actual createdAt
    const PROGRAM_START = new Date(2026, 2, 1);  // March 1, 2026

    let rawCreatedAt = toDate(clientData.createdAt);
    if (!rawCreatedAt || rawCreatedAt < PROGRAM_START) {
      rawCreatedAt = PROGRAM_START;
    }
    const accountStart = rawCreatedAt;

    // ── 3. Fetch audit documents ──────────────────────────────────
    const auditsRef  = collection(db, `clients/${clientId}/audits`);
    const auditsSnap = await getDocs(auditsRef);

    // Build lookup map: "2026-March" → audit data
    const auditMap = {};
    auditsSnap.forEach((doc) => {
      const d = doc.data();
      auditMap[`${d.year}-${d.month}`] = d;
    });

    // ── 4. Current moment ─────────────────────────────────────────
    const now = new Date();

    // ── 5. Build 12 rolling periods from accountStart ─────────────
    //   Period 1: accountStart       → accountStart + 1 month
    //   Period 2: accountStart+1mo   → accountStart + 2 months
    //   ... and so on for 12 periods
    //   Each period is mapped to the calendar month of its START date.
    const TOTAL_PERIODS = 12;
    const periods = [];
    for (let i = 0; i < TOTAL_PERIODS; i++) {
      const periodStart = addMonths(accountStart, i);
      const periodEnd   = addMonths(accountStart, i + 1);  // exclusive
      periods.push({
        periodStart,
        periodEnd,
        calYear:     periodStart.getFullYear(),
        calMonthIdx: periodStart.getMonth(),  // 0-based
      });
    }

    // ── 6. Wallet deduction tracking ─────────────────────────────
    //
    //   TWO types of deductions both reduce the wallet:
    //
    //   A) UTILIZED — deducted IMMEDIATELY when an audit is completed
    //      (3000 DC per completed audit, real-time)
    //
    //   B) LAPSED   — deducted only AFTER the period ends
    //      For each ended period: (2 - completedCount) × 3000
    //      e.g. 0 audits done → 6000 lapsed
    //           1 audit done  → 3000 lapsed
    //           2 audits done → 0 lapsed
    //
    //   walletBalance = 60,000 - totalUtilized - totalLapsed
    //
    let totalUtilized = 0;
    let totalLapsed   = 0;

    // ── 7. Render rows for the calendar year 2026 ─────────────────
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    months.forEach((month, monthIdx) => {
      const row = document.createElement("tr");

      // January & February: always disabled — program starts from March
      if (month === "January" || month === "February") {
        row.classList.add("disabled-month");
        row.innerHTML = `
          <td>${month}</td>
          <td>3000 DC</td>
          <td>3000 DC</td>
          <td></td>
        `;
        tbody.appendChild(row);
        return;
      }

      // Find the period whose start falls in this calendar month of 2026
      const period = periods.find(
        p => p.calYear === 2026 && p.calMonthIdx === monthIdx
      );

      // No period maps to this month → beyond program scope → disabled
      if (!period) {
        row.classList.add("disabled-month");
        row.innerHTML = `<td>${month}</td><td>3000 DC</td><td>3000 DC</td><td></td>`;
        tbody.appendChild(row);
        return;
      }

      const { periodStart, periodEnd } = period;

      // Period hasn't started yet → disabled (future)
      const periodStarted = now >= periodStart;
      if (!periodStarted) {
        row.classList.add("disabled-month");
        row.innerHTML = `<td>${month}</td><td>3000 DC</td><td>3000 DC</td><td></td>`;
        tbody.appendChild(row);
        return;
      }

      // Period ended? (today >= periodEnd)
      const periodEnded = now >= periodEnd;

      // ── Get audit data for this month ─────────────────────────
      const audit = auditMap[`2026-${month}`] || {
        audit1Status: "pending", audit1ClientName: "",
        audit2Status: "pending", audit2ClientName: "",
      };

      const a1Done = audit.audit1Status === "audit_completed" || audit.audit1Status === "project-conversion";
      const a2Done = audit.audit2Status === "audit_completed" || audit.audit2Status === "project-conversion";

      // ── Audit-1 colour & label ────────────────────────────────
      let a1Class = "red-text", a1Name = "";
      if (a1Done) {
        a1Class = audit.audit1Status === "project-conversion" ? "green-text" : "yellow-text";
        a1Name  = audit.audit1Status === "project-conversion" && audit.audit1ClientName
          ? ` (${audit.audit1ClientName})` : "";
      }

      // ── Audit-2 colour & label ────────────────────────────────
      let a2Class = "red-text", a2Name = "";
      if (a2Done) {
        a2Class = audit.audit2Status === "project-conversion" ? "green-text" : "yellow-text";
        a2Name  = audit.audit2Status === "project-conversion" && audit.audit2ClientName
          ? ` (${audit.audit2ClientName})` : "";
      }

      // ── A) UTILIZED: deduct immediately for each completed audit ─
      //    This reflects in the wallet right away (no waiting for period end)
      const monthUtilized = (a1Done ? 3000 : 0) + (a2Done ? 3000 : 0);
      totalUtilized += monthUtilized;

      // ── B) LAPSED: deduct only after period ends ──────────────
      //    For each incomplete slot at period end: 3000 DC lapsed
      //    e.g. 0 done → 6000 lapsed | 1 done → 3000 lapsed | 2 done → 0 lapsed
      let monthLapsed = 0;
      if (periodEnded) {
        const completedCount = (a1Done ? 1 : 0) + (a2Done ? 1 : 0);
        monthLapsed = (2 - completedCount) * 3000;
        totalLapsed += monthLapsed;
      }

      // ── Status column ─────────────────────────────────────────
      //   Only shown AFTER period ends.
      //
      //   2 audits done → "6000 DC Utilized · Not Lapsed"     🟢 green
      //   1 audit done  → "3000 DC Utilized · 3000 DC Lapsed" 🟡 yellow
      //   0 audits done → "6000 DC Lapsed"                    🔴 red
      let statusText  = "";
      let statusClass = "";

      if (periodEnded) {
        const completedCount = (a1Done ? 1 : 0) + (a2Done ? 1 : 0);

        if (completedCount === 2) {
          statusText  = "6000 DC Utilized · Not Lapsed";
          statusClass = "text-success fw-bold";
        } else if (completedCount === 1) {
          statusText  = "3000 DC Utilized · 3000 DC Lapsed";
          statusClass = "text-warning fw-bold";
        } else {
          statusText  = "6000 DC Lapsed";
          statusClass = "text-danger fw-bold";
        }
      }

      row.innerHTML = `
        <td>${month}</td>
        <td class="${a1Class}">3000 DC${a1Name}</td>
        <td class="${a2Class}">3000 DC${a2Name}</td>
        <td class="${statusClass}">${statusText}</td>
      `;
      tbody.appendChild(row);
    });

    // ── 8. Update wallet balance in header ────────────────────────
    //
    //   walletBalance = 60,000
    //                 − totalUtilized  (deducted immediately per completed audit)
    //                 − totalLapsed    (deducted after each period ends for missed audits)
    //
    //   Examples (user created March 1, period ends April 1):
    //   ┌─────────────────────────────────────────────────────────┐
    //   │ 0 audits in March, period over → 0 utilized + 6000 lapsed → balance = 54,000 │
    //   │ 1 audit in March, period over  → 3000 utilized + 3000 lapsed → balance = 54,000 │
    //   │ 2 audits in March, period over → 6000 utilized + 0 lapsed → balance = 54,000 │
    //   │ 1 audit in March, period active → 3000 utilized + 0 lapsed → balance = 57,000 │
    //   └─────────────────────────────────────────────────────────┘
    const balanceEl = document.getElementById("balance-amount");
    if (balanceEl) {
      const currentBalance = 60000 - totalUtilized - totalLapsed;
      balanceEl.textContent = currentBalance.toLocaleString() + " DC";
    }

  } catch (err) {
    console.error("populateTable error:", err);
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
  }
}


// ─────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────
async function handleLogin() {
  const emailInput    = document.getElementById("email").value.trim().toLowerCase();
  const passwordInput = document.getElementById("password").value;
  const messageEl     = document.getElementById("login-message");

  messageEl.style.display = "none";
  messageEl.textContent   = "";

  if (!emailInput || !passwordInput) {
    messageEl.textContent   = "Please enter Email ID and Password.";
    messageEl.style.display = "block";
    return;
  }

  try {
    const clientsRef    = collection(db, "clients");
    const q             = query(clientsRef, where("email", "==", emailInput));
    const querySnapshot = await getDocs(q);

    let found   = false;
    let company = "Unknown";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.password === passwordInput) {
        found   = true;
        company = data.company || "Unknown";
      }
    });

    if (found) {
      localStorage.setItem("company", company);
      document.getElementById("login-section").classList.add("d-none");
      document.getElementById("dashboard-section").classList.remove("d-none");
      document.getElementById("company-name").textContent = company;
      populateTable();
    } else {
      messageEl.textContent   = "Invalid Email ID or Password. Please try again.";
      messageEl.style.display = "block";
    }

  } catch (err) {
    console.error("Login error:", err);
    messageEl.textContent   = "Connection error. Check console.";
    messageEl.style.display = "block";
  }
}


// ─────────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────────
function handleLogout() {
  localStorage.clear();
  location.reload();
}


// ─────────────────────────────────────────────────────────────────
//  PASSWORD VISIBILITY TOGGLE
// ─────────────────────────────────────────────────────────────────
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon    = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}


// ─────────────────────────────────────────────────────────────────
//  AUTO-LOGIN on page refresh
// ─────────────────────────────────────────────────────────────────
if (localStorage.getItem("company")) {
  document.getElementById("login-section").classList.add("d-none");
  document.getElementById("dashboard-section").classList.remove("d-none");
  document.getElementById("company-name").textContent = localStorage.getItem("company");
  populateTable();
}


// ─────────────────────────────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);

  const toggleIcon = document.getElementById("togglePassword");
  if (toggleIcon) toggleIcon.addEventListener("click", togglePassword);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
});