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

  links.forEach((link) => {
    link.addEventListener("click", () => {
      burger.classList.remove("active");
      mobileMenu.classList.remove("active");
    });
  });
}


// ==========================
// 3️⃣ BARRE DE RECHERCHE
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".search-bar");

  if (!form) {
    console.warn("Formulaire de recherche introuvable sur cette page.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const from = document.querySelector("#from")?.value.trim();
    const to = document.querySelector("#to")?.value.trim();
    const date = document.querySelector("#date")?.value;

    if (from && to && date) {
      const url = `listings.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
      console.log("Redirection vers :", url);
      window.location.href = url;
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
      window.location.href = `listings.html?from=${encodeURIComponent(departure)}&to=${encodeURIComponent(arrival)}&date=${encodeURIComponent(date)}`;
    }, 400); // même durée que la transition CSS
  });
}
