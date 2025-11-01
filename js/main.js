// EcoRide - main.js
// Gestion du header/footer, menu burger et redirection recherche

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

        // Header bien injecté pour gérer la connexion 
        initLoginSimulation();
      }
    })
    .catch((error) => console.error(error));
}

// Chargement du header et footer
document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "partials/header.html");
  loadHTML("footer", "partials/footer.html");
});


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
      logout: document.getElementById("link-logout-desktop")
    },
    {
      login: document.getElementById("link-login-mobile"),
      register: document.getElementById("link-register-mobile"),
      account: document.getElementById("link-account-mobile"),
      logout: document.getElementById("link-logout-mobile")
    }
  ];

  // Boucle sur les deux versions de la nav (desktop + mobile )
  for(const set of navSets) {
    if (!set.login || !set.register || !set.account || !set.logout) continue;

    if (isLoggedIn) {
      set.login.classList.add("hidden");
      set.register.classList.add("hidden");
      set.account.classList.remove("hidden");
      set.logout.classList.remove("hidden");
    } else {
      set.login.classList.remove("hidden");
      set.register.classList.remove("hidden");
      set.account.classList.add("hidden");
      set.logout.classList.add("hidden");
    }
  }
}

// --- GESTION CONNEXION / DECONNEXION ---
function initLoginSimulation() {
  const loginLinkDesktop = document.getElementById("link-login-desktop");
  const accountLinkDesktop = document.getElementById("link-account-desktop");
  const logoutLinkDesktop = document.getElementById("link-logout-desktop");
  const logoutLinkMobile = document.getElementById("link-logout-mobile");

  if (!loginLinkDesktop || !accountLinkDesktop) {
    setTimeout(initLoginSimulation, 200);
    return;
  }

  // Connexion simulée 
  if (loginLinkDesktop) {
    loginLinkDesktop.addEventListener("click", (e) => {
      e.preventDefault();
      globalThis.isLoggedIn = true;
      localStorage.setItem("isLoggedIn", "true");
      updateNavLinks();
      globalThis.location.href = "user-space.html"; // redirection vers espace utilisateur 
    });
  }

  // Déconnexion réelle 
  const handleLogout = () => {
    const confirmLogout = confirm("Voulez-vous vraiment vous déconnecter ?");
    if (confirmLogout) {
      globalThis.isLoggedIn = false;
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("userPhoto");
      updateNavLinks();
      alert("Déconnexion réussie !");
      globalThis.location.href = "login.html"
    }
  };

  if (logoutLinkDesktop) {
    logoutLinkDesktop.addEventListener("click", handleLogout);
  }

  if (logoutLinkMobile) {
    logoutLinkMobile.addEventListener("click", handleLogout);
  }


  // --- Restauration automatique de l’état ---
  const savedLogin = localStorage.getItem("isLoggedIn");
  if (savedLogin === "true") {
    globalThis.isLoggedIn = true;
    updateNavLinks();
  }
}


// --- INITIALISATION ---
// appel automatique quand la page est chargée
document.addEventListener("DOMContentLoaded", updateNavLinks);

// --- BOUTON DE SIMULATION DE CONNEXION --- 
if (typeof toggleBtn !== "undefined" && toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    // Inversion du bouton de connexion 
    globalThis.isLoggedIn = !globalThis.isLoggedIn;

    // Mise à jour visuelle de la nav 
    updateNavLinks();

    // Feedback utilisateur 
    if (typeof feedback !== "undefined" && feedback) {
      feedback.textContent = isLoggedIn
        ? "✅ Vous êtes connecté (mode utilisateur)"
        : "🚫 Vous êtes maintenant en mode visiteur";
      feedback.style.color = isLoggedIn ? "var(--success)" : "var(--error)"; 
    }

    // Mise à jour du texte du bouton simulateur 
    toggleBtn.textContent = isLoggedIn ? "Mode utilisateur" : "Mode visiteur";
  });
}