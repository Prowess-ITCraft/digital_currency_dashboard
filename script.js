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
//  HELPER: Add N calendar months to a date (same day-of-month)
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
    //   • All existing/old users → forced to March 1, 2026
    //   • New users (createdAt >= March 1, 2026) → use their actual createdAt
    const PROGRAM_START = new Date(2026, 2, 1);   // March 1, 2026 (month is 0-based)

    let rawCreatedAt = toDate(clientData.createdAt);
    if (!rawCreatedAt || rawCreatedAt < PROGRAM_START) {
      rawCreatedAt = PROGRAM_START;
    }

    // accountStart: the exact day the user's period begins
    const accountStart = rawCreatedAt;

    // ── 3. Fetch audit documents ──────────────────────────────────
    const auditsRef  = collection(db, `clients/${clientId}/audits`);
    const auditsSnap = await getDocs(auditsRef);

    // Build lookup: "2026-March" → audit data
    const auditMap = {};
    auditsSnap.forEach((doc) => {
      const d   = doc.data();
      const key = `${d.year}-${d.month}`;
      auditMap[key] = d;
    });

    // ── 4. Current moment ─────────────────────────────────────────
    const now = new Date();

    // ── 5. Build period list ──────────────────────────────────────
    //   Period 1: accountStart  → accountStart + 1 month  (exclusive)
    //   Period 2: period1 end   → period1 end  + 1 month
    //   … up to 12 periods (the full program year)
    //
    //   We then map each period onto the calendar month that contains
    //   its START date — that's the row shown in the table.

    const TOTAL_PERIODS = 12;   // program lasts 12 monthly periods

    // periods[i] = { periodStart, periodEnd, calYear, calMonthIdx, monthName }
    const periods = [];
    for (let i = 0; i < TOTAL_PERIODS; i++) {
      const periodStart = addMonths(accountStart, i);
      const periodEnd   = addMonths(accountStart, i + 1);   // exclusive upper bound

      const calYear     = periodStart.getFullYear();
      const calMonthIdx = periodStart.getMonth();           // 0-based
      const monthName   = periodStart.toLocaleString("default", { month: "long" });

      periods.push({ periodStart, periodEnd, calYear, calMonthIdx, monthName });
    }

    // ── 6. Balance tracking (real-time: deduct per completed audit) ─
    let totalUtilized = 0;

    // ── 7. Render rows ────────────────────────────────────────────
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    months.forEach((month, monthIdx) => {
      const row = document.createElement("tr");

      // Jan & Feb are ALWAYS disabled (program didn't exist then)
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

      // Find the period whose start falls in this calendar month (2026)
      const period = periods.find(
        p => p.calYear === 2026 && p.calMonthIdx === monthIdx
      );

      // If no period maps here, this month is beyond the program scope → disabled
      if (!period) {
        row.classList.add("disabled-month");
        row.innerHTML = `<td>${month}</td><td>3000 DC</td><td>3000 DC</td><td></td>`;
        tbody.appendChild(row);
        return;
      }

      const { periodStart, periodEnd } = period;

      // Has this period started yet?  (today >= periodStart)
      const periodStarted = now >= periodStart;

      // Has this period ended yet?    (today >= periodEnd)
      const periodEnded   = now >= periodEnd;

      // Future period — not yet started → disabled grey row
      if (!periodStarted) {
        row.classList.add("disabled-month");
        row.innerHTML = `<td>${month}</td><td>3000 DC</td><td>3000 DC</td><td></td>`;
        tbody.appendChild(row);
        return;
      }

      // ── Active or completed period ────────────────────────────
      const key   = `2026-${month}`;
      const audit = auditMap[key] || {
        audit1Status: "pending", audit1ClientName: "",
        audit2Status: "pending", audit2ClientName: "",
      };

      // Audit completion flags
      const a1Done = audit.audit1Status === "audit_completed" || audit.audit1Status === "project-conversion";
      const a2Done = audit.audit2Status === "audit_completed" || audit.audit2Status === "project-conversion";

      // ── Audit-1 colour ────────────────────────────────────────
      let a1Class = "red-text";
      let a1Name  = "";
      if (a1Done) {
        if (audit.audit1Status === "project-conversion") {
          a1Class = "green-text";
          a1Name  = audit.audit1ClientName ? ` (${audit.audit1ClientName})` : "";
        } else {
          a1Class = "yellow-text";
        }
      }

      // ── Audit-2 colour ────────────────────────────────────────
      let a2Class = "red-text";
      let a2Name  = "";
      if (a2Done) {
        if (audit.audit2Status === "project-conversion") {
          a2Class = "green-text";
          a2Name  = audit.audit2ClientName ? ` (${audit.audit2ClientName})` : "";
        } else {
          a2Class = "yellow-text";
        }
      }

      // ── Balance: deduct immediately for each completed audit ──
      if (a1Done) totalUtilized += 3000;
      if (a2Done) totalUtilized += 3000;

      // ── Status column ─────────────────────────────────────────
      //   Only shown AFTER the period has ended (month-end reached)
      //   Text rules:
      //     2 audits done  → "6000 DC Used · Not Lapsed"   (green)
      //     1 audit done   → "3000 DC Used · 3000 DC Lapsed" (yellow/orange)
      //     0 audits done  → "6000 DC Lapsed"               (red)
      let statusText  = "";
      let statusClass = "";

      if (periodEnded) {
        const completedCount = (a1Done ? 1 : 0) + (a2Done ? 1 : 0);

        if (completedCount === 2) {
          statusText  = "6000 DC Used · Not Lapsed";
          statusClass = "text-success fw-bold";
        } else if (completedCount === 1) {
          statusText  = "3000 DC Used · 3000 DC Lapsed";
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

    // ── 8. Update wallet balance ──────────────────────────────────
    //   Balance = 60,000 − (every completed audit × 3,000)
    //   Lapsed DCs are shown in Status column but do NOT reduce the wallet —
    //   the wallet only reflects DCs that have been redeemed/utilized.
    const balanceEl = document.getElementById("balance-amount");
    if (balanceEl) {
      const currentBalance = 60000 - totalUtilized;
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