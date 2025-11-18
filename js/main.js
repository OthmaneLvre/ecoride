// EcoRide - main.js
// Gestion du header/footer, menu burger et redirection recherche

/* Fonction formatage date */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
}

/* Fonction formatage heure */
function formatTime(timeStr) {
    return timeStr.slice(0,5); 
}

// ==========================
// 1️⃣ CHARGEMENT PARTIELS
// ==========================
function loadHTML(id, file) {
  fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error("Erreur de chargement : " + file);
      return response.text();
    })
    .then((data) => {
      document.getElementById(id).innerHTML = data;

      // Quand le header est chargé → on initialise le menu burger
      if (id === "header") {
        initBurgerMenu();

        // Vérifie le statut de connexion APRES injection du header
        const userId = localStorage.getItem("currentUserId");
        const userName = localStorage.getItem("currentUserName");

        let storedRoles = localStorage.getItem("currentUserRoles");
        let userRoles = [];

        try {
          if (storedRoles && storedRoles !== "undefined") {
            userRoles = JSON.parse(storedRoles);
          }

        } catch (e) {
          console.warn("Roles invalides -> reset", e);
          userRoles = [];
          localStorage.removeItem("currentUserRoles");
        }

        // Statut connecté
        if (userId && userName) {
          globalThis.isLoggedIn = true;   
        } else {
          globalThis.isLoggedIn = false;
        }

        globalThis.currentUserRoles = userRoles;

        // Mise à jour de la nav selon l'état 
        updateNavLinks();
      }

      // Pose les listeners (logout) une fois le header injecté 
      initLogin();

    })
    .catch((error) => console.error(error));
}

// Chargement du header et footer
document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "partials/header.html");
  loadHTML("footer", "partials/footer.html");
});

document.dispatchEvent(new Event("headerReady"));

// ==========================
// 2️⃣ MENU BURGER
// ==========================
function initBurgerMenu() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const links = document.querySelectorAll(".mobile-menu a");

  // Vérification : si le header n'est pas encore injecté
  if (!burger || !mobileMenu) {
    console.warn("Header pas encore prêt, recheck dans 200ms...");
    setTimeout(initBurgerMenu, 200); // réessaie après un court délai
    return;
  }

  burger.addEventListener("click", () => {
    burger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
  });

  for(const link of links) {
    link.addEventListener("click", () => {
      burger.classList.remove("active");
      mobileMenu.classList.remove("active");
    });
  }
}


// ==========================
// 3️⃣ BARRE DE RECHERCHE
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".search-bar");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const from = document.querySelector("#from")?.value.trim();
    const to = document.querySelector("#to")?.value.trim();
    const date = document.querySelector("#date")?.value;

    if (from && to && date) {
      const url = `listings.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
      console.log("Redirection vers :", url);
      globalThis.location.href = url;
    } else {
      alert("Merci de remplir tous les champs avant de lancer la recherche !");
    }
  });
});



// --- Animation d'apparition de page ---
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

// --- Animation de sortie avant redirection ---
const searchForm = document.getElementById("search-form");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Récupération des champs
    const departure = document.getElementById("departure").value.trim();
    const arrival = document.getElementById("arrival").value.trim();
    const date = document.getElementById("date").value;

    if (!departure || !arrival || !date) return;

    // Transition de sortie
    document.body.style.opacity = 0;

    // Redirection après légère attente
    setTimeout(() => {
      globalThis.location.href = `listings.html?from=${encodeURIComponent(departure)}&to=${encodeURIComponent(arrival)}&date=${encodeURIComponent(date)}`;
    }, 400); // même durée que la transition CSS
  });
}

// --- ÉTAT GLOBAL DE CONNEXION UTILISATEUR ---
globalThis.isLoggedIn = false; // false = visiteur, true = utilisateur

// --- SYNCHRO NAV AVEC ETAT UTILISATEUR ---
function updateNavLinks() {
  const navSets = [
    {
      login: document.getElementById("link-login-desktop"),
      register: document.getElementById("link-register-desktop"),
      account: document.getElementById("link-account-desktop"),
      logout: document.getElementById("link-logout-desktop"),
      history : document.getElementById("link-history-desktop"),
      employee: document.getElementById("link-employee-desktop"),
      admin: document.getElementById("link-admin-desktop"),
    },
    {
      login: document.getElementById("link-login-mobile"),
      register: document.getElementById("link-register-mobile"),
      account: document.getElementById("link-account-mobile"),
      logout: document.getElementById("link-logout-mobile"),
      history : document.getElementById("link-history-mobile"),
      employee: document.getElementById("link-employee-mobile"),
      admin: document.getElementById("link-admin-mobile"),
    }
  ];

  const roles = globalThis.currentUserRoles || [];

  // Boucle sur les deux versions de la nav (desktop + mobile )
  for(const set of navSets) {
    if (!set.login || !set.register || !set.account || !set.logout) continue;

    if (isLoggedIn) {

      //--- Visibilité classiques ----
      set.login.classList.add("hidden");
      set.register.classList.add("hidden");
      set.account.classList.remove("hidden");
      set.logout.classList.remove("hidden");

      if (set.history) set.history.classList.remove("hidden");   

      // --- Role employe 
      if (set.employee) {
        if (roles.includes("employe")) {
          set.employee.classList.remove("hidden");
        } else {
          set.employee.classList.add("hidden")
        }
      }

      // --- Role ADMIN 
      if (set.admin) {
        if (roles.includes("admin")) {
          set.admin.classList.remove("hidden");
        } else {
          set.admin.classList.add("hidden")
        }
      }

    } else {
      // Utilisateur déconnecté 
      set.login.classList.remove("hidden");
      set.register.classList.remove("hidden");
      set.account.classList.add("hidden");
      set.logout.classList.add("hidden");

      if (set.history) set.history.classList.add("hidden");
      if (set.employee) set.employee.classList.add("hidden")
      if (set.admin) set.admin.classList.add("hidden");
    }
  }
}

// --- GESTION CONNEXION / DECONNEXION ---
function initLogin() {
  const loginLinkDesktop = document.getElementById("link-login-desktop");
  const accountLinkDesktop = document.getElementById("link-account-desktop");
  const logoutButtons = document.querySelectorAll(".logout-btn")

  if (!loginLinkDesktop || !accountLinkDesktop) {
    setTimeout(initLogin, 200);
    return;
  }

  if (!logoutButtons.length) {
    setTimeout(initLogin, 200);      
    return;
  }

  // Déconnexion réelle 
  const handleLogout = (e) => {
    e.preventDefault();
    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;


      // Etat et stockage réels 
      globalThis.isLoggedIn = false;
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("currentUserName");
      
      // Mise à jour de la navigation
      updateNavLinks();

      // Redirection
      globalThis.location.href = "login.html"
  };

  // Attache le listener sur chaque bouton 
  for(const btn of logoutButtons) {
    btn.addEventListener("click", handleLogout);
  }
}  

document.addEventListener("DOMContentLoaded", updateNavLinks);


// --- SYNCHRONISATION REELLE AVEC LOGIN.JS ---
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("currentUserId");
  const userName = localStorage.getItem("currentUserName");

  let storedRoles = localStorage.getItem("currentUserRoles");
  let userRoles = [];

  try {
    if (storedRoles && storedRoles !== "undefined") {
      userRoles = JSON.parse(storedRoles);
    }
  } catch (e) {
    console.warn("Roles invalides dans localStorage, reset", e);
    userRoles = [];
    localStorage.removeItem("currentUserRoles");

  }  if (userId && userName) {
    globalThis.isLoggedIn = true; // l'utilisateur est connecté
  } else {
    globalThis.isLoggedIn = false; // visiteur
  }
  globalThis.currentUserRoles = userRoles;

  updateNavLinks(); // on met à jour la nav en conséquence
});