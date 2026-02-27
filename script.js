// script.js

// const users = [
//     { email: "hr@itsyinfotech.com", company: "Itsy Infotech" },
//     { email: "siby.philip@waywedesign.com", company: "Waywe design Pvt Ltd" },
//     { email: "ctisind@gmail.com", company: "CTIS&Fortrust Group" },
//     { email: "jaluka@dpcmakeseasy.com", company: "Decision Point Consultancy" },
//     { email: "jalukanandan@gmail.com", company: "Decision Point Consultancy" },
//     { email: "ankur@utkarshinisoftware.com", company: "Utkarshini Software" },
//     { email: "mahesh.k@orchidglobalit.tech", company: "Orchid Technologies and Consulting Services" },
//     { email: "sachin.jain@naminathinfotech.shop", company: "Naminath Infotech LLP" },
//     { email: "jishnulaxman@gmail.com", company: "WhitePapers" },
//     { email: "agency@whitepaper.ae", company: "WhitePapers" },
//     { email: "jyoti@chrysalisconsulting.co.in", company: "Chrysalis Consulting" },
//     { email: "shahbhumit@18studiioz.com", company: "18 Sudios" },
//     { email: "surya@ssisindia.com", company: "S&S InfoTech Software Pvt Ltd" },
//     { email: "minalmg@gmail.com", company: "MASNX Global OPC Pvt Ltd" },
//     { email: "minalmg.x@gmail.com", company: "MASNX Global OPC Pvt Ltd" },
//     { email: "infotrend.technologies@gmail.com", company: "Infotrend Technologies" },
//     { email: "r.sadhana6@outlook.com", company: "Maintec Technologies Pvt. Ltd." },
//     { email: "sharanya.eshwaran@pentadacademy.com", company: "Pentad Education" },
//     { email: "prathmesh@pinsoftek.com", company: "Pinsoftek" },
//     { email: "bnsinghco3@gmail.com", company: "B N Singh & Co." },
//     { email: "amar.kalvikatte@gmail.com", company: "Employeed (Avande) / Public speaker" },
//     { email: "shruti@itcraft.net.in", company: "ITCraft" }
// ];

  // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
    import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDKaa99EeFbXPP4YxPZMPqTuqjMQyFsMio",
    authDomain: "partner-dashboard-83433.firebaseapp.com",
    projectId: "partner-dashboard-83433",
    storageBucket: "partner-dashboard-83433.firebasestorage.app",
    messagingSenderId: "998003403808",
    appId: "1:998003403808:web:c59c6b584b0a3a9568a045",
    measurementId: "G-5Z0BPGB8JD"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
//   const analytics = getAnalytics(app);

  // Initialize Firestore
  const db = getFirestore(app);

  // Make db globally available (so other functions can use it)
  window.db = db;

  console.log("Firebase & Firestore initialized successfully!");



// const API_URL = "https://script.google.com/macros/s/AKfycbw01RY9CSfv-L7qH5XWCA9QY4EgFZtIqbbvT02zu80m0KWWO2S5YDiyDmEyQhsiBlDgvQ/exec";  
// // ↑↑↑ Replace with your actual /exec URL from step 2 above

// const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// function populateTable() {
//   const tbody = document.getElementById("audit-table");
//   tbody.innerHTML = "";
  
//   months.forEach(month => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td>${month}</td>
//       <td class="red-text">3000 DC</td>
//       <td class="red-text">3000 DC</td>
//       <td></td>
//     `;
//     tbody.appendChild(row);
//   });
// }

// async function populateTable() {
//   const tbody = document.getElementById("audit-table");
//   if (!tbody) {
//     console.error("audit-table tbody not found");
//     return;
//   }

//   tbody.innerHTML = ""; // Clear table

//   const company = localStorage.getItem("company");
//   if (!company) {
//     console.warn("No company in localStorage");
//     tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Please log in</td></tr>';
//     return;
//   }

//   try {
//     // Find client
//     const clientsRef = collection(db, "clients");
//     const clientQ = query(clientsRef, where("company", "==", company));
//     const clientSnap = await getDocs(clientQ);

//     if (clientSnap.empty) {
//       console.warn("Client not found:", company);
//       tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Client not found</td></tr>';
//       return;
//     }

//     const clientDoc = clientSnap.docs[0];
//     const clientId = clientDoc.id;

//     // Get audits
//     const auditsRef = collection(db, `clients/${clientId}/audits`);
//     const auditsSnap = await getDocs(auditsRef);

//     const auditMap = {};
//     auditsSnap.forEach((doc) => {
//       const data = doc.data();
//       const key = `${data.year}-${data.month}`;
//       auditMap[key] = data;
//     });

//     // Define months to show (all 12)
//     const displayYear = 2026; // your test year
//     const months = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];

//     // Months that contribute to balance (only Feb and March)
//     const activeMonths = ["February", "March"];

//     let totalLapsed = 0;

//     months.forEach((month) => {
//       const key = `${displayYear}-${month}`;
//       const audit = auditMap[key] || {
//         audit1Status: "pending",
//         audit1ClientName: "",
//         audit2Status: "pending",
//         audit2ClientName: "",
//         lapsedDC: 6000
//       };

//       // Colors & names (always show real status or default pending)
//       let a1Class = "red-text", a1Text = "3000 DC", a1Name = "";
//       let a2Class = "red-text", a2Text = "3000 DC", a2Name = "";

//       if (audit.audit1Status === "project_conversion") {
//         a1Class = "green-text";
//         a1Name = audit.audit1ClientName ? ` (${audit.audit1ClientName})` : "";
//       } else if (audit.audit1Status === "initiated") {
//         a1Class = "yellow-text";
//       }

//       if (audit.audit2Status === "project_conversion") {
//         a2Class = "green-text";
//         a2Name = audit.audit2ClientName ? ` (${audit.audit2ClientName})` : "";
//       } else if (audit.audit2Status === "initiated") {
//         a2Class = "yellow-text";
//       }

//       // Only count lapsed from active months (Feb & March)
//       let monthLapsed = 0;
//       if (activeMonths.includes(month)) {
//         monthLapsed = audit.lapsedDC || 0;
//         totalLapsed += monthLapsed;
//       }

//       const row = document.createElement("tr");

//       // Optional: gray out disabled months for visual distinction
//       if (!activeMonths.includes(month)) {
//         row.style.opacity = "0.6";
//         row.style.background = "#f8fafc";
//       }

//       row.innerHTML = `
//         <td>${month}</td>
//         <td class="${a1Class}">${a1Text}${a1Name}</td>
//         <td class="${a2Class}">${a2Text}${a2Name}</td>
//         <td></td>
//       `;
//       tbody.appendChild(row);
//     });

//     // Update header balance using only active months' lapsed
//     const initialBalance = 60000;
//     const currentBalance = initialBalance - totalLapsed;
//     const balanceEl = document.getElementById("balance-amount");
//     if (balanceEl) {
//       balanceEl.textContent = currentBalance.toLocaleString() + " DC";

//       // Optional: low balance warning
//       if (currentBalance < 10000) {
//         balanceEl.style.color = "#ef4444";
//         balanceEl.style.background = "rgba(239,68,68,0.1)";
//       } else {
//         balanceEl.style.color = "";
//         balanceEl.style.background = "";
//       }
//     }

//   } catch (err) {
//     console.error("populateTable error:", err);
//     tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading audit data</td></tr>';
//   }
// }


async function populateTable() {
  const tbody = document.getElementById("audit-table");
  if (!tbody) {
    console.error("audit-table tbody not found");
    return;
  }

  tbody.innerHTML = ""; // Clear table

  const company = localStorage.getItem("company");
  if (!company) {
    console.warn("No company in localStorage");
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Please log in</td></tr>';
    return;
  }

  try {
    // Find client
    const clientsRef = collection(db, "clients");
    const clientQ = query(clientsRef, where("company", "==", company));
    const clientSnap = await getDocs(clientQ);

    if (clientSnap.empty) {
      console.warn("Client not found:", company);
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Client not found</td></tr>';
      return;
    }

    const clientDoc = clientSnap.docs[0];
    const clientId = clientDoc.id;

    // Get audits
    const auditsRef = collection(db, `clients/${clientId}/audits`);
    const auditsSnap = await getDocs(auditsRef);

    const auditMap = {};
    auditsSnap.forEach((doc) => {
      const data = doc.data();
      const key = `${data.year}-${data.month}`;
      auditMap[key] = data;
    });

    // Show all 12 months, active months affect balance
    const displayYear = 2026;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const activeMonths = ["February", "March", "April"]; // only these deduct 6000 each

    let totalDeduction = 0;

    months.forEach((month) => {
      const key = `${displayYear}-${month}`;
      const audit = auditMap[key] || {
        audit1Status: "pending",
        audit1ClientName: "",
        audit2Status: "pending",
        audit2ClientName: "",
      };

      // === FIXED 6000 deduction per active month ===
      let monthDeduction = 0;
      if (activeMonths.includes(month)) {
        monthDeduction = 6000;
        totalDeduction += monthDeduction;
      }

      // Colors & names
      let a1Class = "red-text", a1Name = "";
      let a2Class = "red-text", a2Name = "";

      if (audit.audit1Status === "project_conversion") {
        a1Class = "green-text";
        a1Name = audit.audit1ClientName ? ` (${audit.audit1ClientName})` : "";
      } else if (audit.audit1Status === "initiated") {
        a1Class = "yellow-text";
      }

      if (audit.audit2Status === "project_conversion") {
        a2Class = "green-text";
        a2Name = audit.audit2ClientName ? ` (${audit.audit2ClientName})` : "";
      } else if (audit.audit2Status === "initiated") {
        a2Class = "yellow-text";
      }

      // STATUS: Lapsed if any pending, else Not Lapsed
      const hasPending = audit.audit1Status === "pending" || audit.audit2Status === "pending";
      const statusText = hasPending ? "Lapsed" : "Not Lapsed";
      const statusClass = hasPending ? "text-danger fw-bold" : "text-success fw-bold";

      const row = document.createElement("tr");

      // Gray out disabled months (Jan + May–Dec)
      if (!activeMonths.includes(month)) {
        row.classList.add("disabled-month");
      }

      row.innerHTML = `
        <td>${month}</td>
        <td class="${a1Class}">3000 DC${a1Name}</td>
        <td class="${a2Class}">3000 DC${a2Name}</td>
        <td class="${statusClass}">${statusText}</td>
      `;
      tbody.appendChild(row);
    });

    // 5. Update header balance (fixed 6000 per active month)
    const initialBalance = 60000;
    const currentBalance = initialBalance - totalDeduction;
    const balanceEl = document.getElementById("balance-amount");
    if (balanceEl) {
      balanceEl.textContent = currentBalance.toLocaleString() + " DC";
    }

  } catch (err) {
    console.error("populateTable error:", err);
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading audit data</td></tr>';
  }
}


// Updated login function to use Firestore instead of Google Sheets

// async function handleLogin() {
//   const email = document.getElementById("email").value.trim().toLowerCase();
//   const password = document.getElementById("password").value;
//   const messageEl = document.getElementById("login-message");

//   // Your existing debug logs
//   console.log("Sending:", { email, password });

//   messageEl.style.display = "none";
//   messageEl.textContent = "";

//   if (!email || !password) {
//     messageEl.textContent = "Please enter Email ID and Password.";
//     messageEl.style.display = "block";
//     return;
//   }

//   try {
//     // Firestore query for client
//     const clientsRef = collection(db, "clients");
//     const q = query(clientsRef, where("E-MAIL", "==", email));
//     const querySnapshot = await getDocs(q);

//     let found = false;
//     let company = "Unknown";

//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       if (data.PASSWORD === password) {  // plain text comparison
//         found = true;
//         company = data.COMPANY || "Unknown";
//       }
//     });

//     console.log("Login attempt →", { email, password, found, company });

//     if (found) {
//       localStorage.setItem("company", company);
//       localStorage.setItem("userName", "User"); // or fetch real name if available

//       document.getElementById("login-section").classList.add("d-none");
//       document.getElementById("dashboard-section").classList.remove("d-none");

//       document.getElementById("company-name").textContent = company;

//       populateTable();  // now uses Firestore (see next step)

//       // Uncomment if you still want T&C modal
//       // setTimeout(() => {
//       //   $('#termsModal').modal('show');
//       // }, 1000);
//     } else {
//       messageEl.textContent = "Invalid Email ID or Password. Please try again.";
//       messageEl.style.display = "block";
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     messageEl.textContent = "Connection error. Check internet or Firebase config.";
//     messageEl.style.display = "block";
//   }
// }

async function handleLogin() {
  const emailInput = document.getElementById("email").value.trim().toLowerCase();
  const passwordInput = document.getElementById("password").value;
  const messageEl = document.getElementById("login-message");

  console.log("Sending:", { email: emailInput, password: passwordInput });

  messageEl.style.display = "none";
  messageEl.textContent = "";

  if (!emailInput || !passwordInput) {
    messageEl.textContent = "Please enter Email ID and Password.";
    messageEl.style.display = "block";
    return;
  }

  try {
  const clientsRef = collection(db, "clients");
  const q = query(clientsRef, where("email", "==", emailInput));
  const querySnapshot = await getDocs(q);

  let found = false;
  let company = "Unknown";

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log("Found matching document:", data);  // This will print the real data if found

    // console.log("Stored password from Firestore:", data.password);
    // console.log("Typed password from input:", passwordInput);
    // console.log("Lengths:", data.password.length, passwordInput.length);
    // console.log("Exact match?", data.password === passwordInput);
    // console.log("Trimmed match?", data.password.trim() === passwordInput.trim());

    // Safe password comparison (handles undefined/missing field)
      const storedPass = (data.password || "").trim();
      const inputPass = passwordInput.trim();

      // console.log("Stored password:", storedPass);
      // console.log("Typed password:", inputPass);
      // console.log("Match?", storedPass === inputPass);

      // if (storedPass === inputPass) {
      //   found = true;
      //   company = (data.company || "Unknown").trim();
      //   console.log("Password matched! Company:", company);
      // }

    if (data.password === passwordInput) {  // lowercase "password"
      found = true;
      company = data.company || "Unknown";  // lowercase "company"
      console.log("Password matched! Company:", company);
    }
  });

  console.log("Login attempt result:", { email: emailInput, found, company });

  if (found) {
    localStorage.setItem("company", company);
    document.getElementById("login-section").classList.add("d-none");
    document.getElementById("dashboard-section").classList.remove("d-none");
    document.getElementById("company-name").textContent = company;

    populateTable();
    // setTimeout(() => $('#termsModal').modal('show'), 1000);
  } else {
    messageEl.textContent = "Invalid Email ID or Password. Please try again.";
    messageEl.style.display = "block";
  }
} catch (err) {
  console.error("Login error:", err);
  messageEl.textContent = "Connection error. Check console.";
  messageEl.style.display = "block";
}
}

// Logout function

function handleLogout() {
  localStorage.clear();
  location.reload();
}

// Auto-login check (page refresh)
if (localStorage.getItem("company")) {
  document.getElementById("login-section").classList.add("d-none");
  document.getElementById("dashboard-section").classList.remove("d-none");
  document.getElementById("company-name").textContent = localStorage.getItem("company");
  populateTable();

//   setTimeout(() => $('#termsModal').modal('show'), 1000);
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Attach click handler safely
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }

  // Also fix togglePassword
  const toggleIcon = document.getElementById("togglePassword");
  if (toggleIcon) {
    toggleIcon.addEventListener("click", togglePassword);
  }
});

// Attach logout handler safely
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // prevent default link behavior
      handleLogout();
    });
  }
});