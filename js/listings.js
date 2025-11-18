// EcoRide - listings.js

let trajets = []; // Rend la liste des trajets accessible globalement

// Fonction pour mettre majuscule au début 
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Calcul automatique de la durée ---
function calculerDuree(departureTime, arrivalTime) {
  const [hDep, mDep] = departureTime.split(":").map(Number);
  const [hArr, mArr] = arrivalTime.split(":").map(Number);

  let diff = (hArr * 60 + mArr) - (hDep * 60 + mDep);
  if (diff < 0) diff += 24 * 60; // arrivée lendemain
  return +(diff / 60).toFixed(1); // heures décimales
}

function parseFrenchDate(dateStr) {
  if (!dateStr) return new Date();

  // Si la date contient des "/", on est en format JJ/MM/AAAA
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  // Si la date contient des "-", on est en format SQL AAAA-MM-JJ
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Par défaut, on renvoie la date actuelle
  return new Date();
}
// --- Format JJ/MM/AAAA ---
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Chercher le prochain trajet similaire ---
function findNextAvailableRideForRoute(rides, from, to, requestedDate) {

  // Normaliser les villes 
  const fFrom = from.trim().toLowerCase();
  const fTo = to.trim().toLowerCase();

  // Normaliser la date rechechée à minuit 
  const req = new Date(requestedDate);
  req.setHours(0, 0, 0, 0);

  const candidates = rides
    .filter((r) => {
      const rideFrom = r.departureCity.trim().toLowerCase();
      const rideTo = r.arrivalCity.trim().toLowerCase();

      return (
        rideFrom === fFrom &&
        rideTo === fTo &&
        r.parsedDate >= req &&
        r.seats > 0
      );
    })
    .sort((a, b) => a.parsedDate - b.parsedDate);

  return candidates.length ? candidates[0] : null;
}

// --- Génération des étoiles ---
function generateStars(rating) {
  let starsHTML = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<img src="assets/icons/star-full.png" alt="étoile" class="star-icon">`;
  }

  if (hasHalfStar) {
    starsHTML += `<img src="assets/icons/star-half.png" alt="étoile demi" class="star-icon">`;
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<img src="assets/icons/star-empty.png" alt="étoile vide" class="star-icon">`;
  }

  return starsHTML;
}

// --- Fonction utilitaire : extraire le prix numérique depuis une string --- 
function parsePrice(priceStr) {
  if(!priceStr) return 0;
  return Number.parseFloat(priceStr.replaceAll(/[^\d.,]/g,"").replace(',', '.'))  || 0;
}

// Génération dynamique des covoiturages selon disponibilité et filtres stricts

document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.querySelector(".results-container");
    const resultsSection = document.querySelector(".results-section");

// --- Vérification : a-t-on des paramètres de recherche ? ---
    const urlParams = new URLSearchParams(globalThis.location.search);
    const from = urlParams.get("from")?.trim().toLowerCase();
    const to = urlParams.get("to")?.trim().toLowerCase();
    const date = urlParams.get("date");

// Si aucun paramètre -> afficher un message d'accueil chaleureux
if (!from || !to || !date) {
  if (resultsSection && resultsContainer) {
    // Section visible mais titre masquer 
    const title = resultsSection.querySelector("h2");
    if (title) title.style.display = "none";

    resultsContainer.innerHTML = `
      <div class="welcome-message fade-in">
        <img src="assets/images/eco-car.png" alt="EcoRide illustration" class="welcome-image">
        <h2>Bienvenue sur EcoRide</h2>
        <p>Trouvez votre covoiturage écologique en quelques clics !</p>
        <p class="welcome-sub">Saisissez une ville de départ, une destination et une date pour commencer votre voyage responsable.</p>
      </div>
    `;
  }
  return; // stoppe complètement le script ici
}


// Remplissage automatique des champs de recherche --- 
const inputFrom = document.getElementById("from");
const inputTo = document.getElementById("to");
const inputDate = document.getElementById("date");

if (from) inputFrom.value = capitalizeFirstLetter(from);
if (to) inputTo.value = capitalizeFirstLetter(to);
if (date) inputDate.value = date;

// --- Verrouillage des champs si une recherche est effectuée ---
if (from && to && date) {
  inputFrom.setAttribute("readonly", true);
  inputTo.setAttribute("readonly", true);
  inputDate.setAttribute("readonly", true);
}

// --- Gestion d'affichage de la barre de filtres --- 
const filterSection = document.querySelector('.section-filter-bar');

// Si recherche effectuée (from, to, date présents)
if (from && to && date) {
  filterSection.classList.add("show");
} else {
    filterSection.classList.remove("show");
}  

  // --- Charger les données depuis la base (get_trips.php) avec filtres URL  ---
  const queryParams = new URLSearchParams({
    from: from,
    to: to,
    date: date
  }).toString();
  
  fetch(`php/get_trips.php?${queryParams}`)
    .then((response) => {
      if (!response.ok) throw new Error("Erreur de chargement depuis la base");
      return response.json();
    })
    .then((rides) => {
      console.log("Données reçues depuis PHP :", rides);

      if (!Array.isArray(rides)) {
        console.warn("Format inattendu :", rides);
        resultsContainer.innerHTML = `
          <div class="no-results">
            <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
            <h3>${rides.message || "Aucun trajet trouvé"}</h3>
          </div>`;
        return;
      }

      // Adaptation des champs SQL -> strucutre JS attendue 
      const formattedRides = rides.map((r) => ({
          id: r.id_covoiturage,
          departureCity: r.lieu_depart,
          arrivalCity: r.lieu_arrivee,
          departureDate: r.date_depart,
          arrivalDate: r.date_arrivee,
          departureTime: r.heure_depart,
          arrivalTime: r.heure_arrivee,
          seats: r.nb_places,
          price: r.prix_personne + " €",
          eco: false, // par défaut 
          driverName: `${r.chauffeur_nom} ${r.chauffeur_prenom}`,
          photo: "assets/images/default-user.png", // image par défaut 
          parsedDate: parseFrenchDate(r.date_depart),
          duration: calculerDuree(r.heure_depart, r.heure_arrivee),
      }));

      trajets = formattedRides;
      console.log("Trajets filtrés par SQL :", trajets);

      // 1. Récupération de la date recherchée telle qu'elle vient de l'URL
      const requestedDate = date;

      // 2. Trajets excacts sur cette date
      const exactRides = formattedRides.filter(r => {
        const rideFrom = r.departureCity.trim().toLowerCase();
        const rideTo = r.arrivalCity.trim().toLowerCase();

        return (
          rideFrom === from &&
          rideTo === to &&
          r.departureDate === requestedDate
        );
      });

     // --- Cas 1 : trajets exacts trouvés ---  
    if (exactRides.length > 0) {
      renderRides(exactRides, resultsContainer);
      return;
    }  

    // 3: Tous les trajets FUTURS sur cette ligne 
    const futureRides = formattedRides.filter(r => {
      const rideFrom = r.departureCity.trim().toLowerCase();
      const rideTo = r.arrivalCity.trim().toLowerCase();

      return (
        rideFrom === from &&
        rideTo === to &&
        r.departureDate > requestedDate &&
        r.seats > 0
      );
    });

    // --- Cas 2 : aucun trajet du tout
    if (futureRides.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
        <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
        <h3>Aucun trajet disponible pour cette recherche</h3>
        <p>Revenez plus tard pour découvrir de nouveaux trajets.</p>
        </div>
    `;
    return;
    }

    // 4. Recherche de la DATE lap lus proche parmi les futures
    const nextDateStr = futureRides.reduce(
      (min, r) => r.departureDate < min ? r.departureDate : min,
      futureRides[0].departureDate
    );


    // --- Cas 3 : Afficher message + trajet à la date la plus proche ---
      // Message d'information clair
      resultsContainer.innerHTML = `
        <div class="no-results">
          <div class="nearest-info">
            <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
            <h3>Aucun trajet trouvé pour cette date.</h3>

          <p>
            Les trajets les plus proches sont disponible le 
            <strong>${formatDate(parseFrenchDate(nextDateStr))}</strong>.
            <br>Merci de refaire une recherche.
          </p>
          </div>
        </div>

      `;

  })
  .catch((err) => {
    console.error("Erreur :", err);
  });  

// --- Affichage des trajets ---
function renderRides(rides, container) {
  container.innerHTML = "";

  for (const ride of rides) {
    const ecoIcon = ride.eco
      ? "assets/icons/ecologic.png"
      : "assets/icons/fuel.png";

    const card = document.createElement("div");
    card.classList.add("ride-card", "fade-in");

    card.innerHTML = `
      <div class="driver-info">
        <img src="${ride.photo}" alt="${ride.driverName}" class="driver-photo">
        <h3 class="driver-name">${ride.driverName}</h3>
        <div class="driver-rating">
          ${generateStars(ride.rating)}
        </div>
      </div>

      <div class="ride-details">
        <div class="details-row"><p>Places restantes</p><p>${ride.seats} places</p></div>
        <div class="details-row"><p>Prix</p><p>${ride.price}</p></div>
        <div class="details-row"><p>Date de départ</p><p>${ride.departureDate}</p></div>
        <div class="details-row"><p>Départ</p><p>${ride.departureCity} - ${ride.departureTime}</p></div>
        <div class="details-row"><p>Date d'arrivée</p><p>${ride.arrivalDate}</p></div>
        <div class="details-row"><p>Arrivée</p><p>${ride.arrivalCity} - ${ride.arrivalTime}</p></div>
        <div class="details-row"><p>Écologique ?</p><img src="${ecoIcon}" class="eco-icon"></div>
      </div>

      <button class="btn-detail">Détail</button>
    `;

    // --- Redirection vers la page détail ---
const detailBtn = card.querySelector(".btn-detail");
if (detailBtn) { 
  detailBtn.addEventListener("click", () => {

    // Sauvegarde de l'URL actuelle de la page listings 
    localStorage.setItem("lastSearchURL", globalThis.location.href);

    // Redirection vers page details du trajet cliqué 
    globalThis.location.href = `details.html?id=${ride.id}`;
  });
}

    container.appendChild(card);
  };
}


//  FILTRAGE DES COVOITURAGES 

// Sélection des éléments du DOM
const ecoFilter = document.getElementById('filter-eco');
const priceFilter = document.getElementById('filter-price');
const durationFilter = document.getElementById('filter-duration');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFilterBtn = document.getElementById('reset-filters');


// --- Fonction d'affichage des trajets filtres ---
function afficherTrajets(trajetsArray) {
  resultsContainer.innerHTML = "";

  if (!trajetsArray || trajets.length === 0) {
    resultsContainer.innerHTML = `<p class="no-results">Aucun trajet ne correspond à vos filtres 😔</p>`;
    return;
  }

for (const trajet of trajetsArray) {
  const ecoIcon = trajet.eco
    ? "assets/icons/ecologic.png"
    : "assets/icons/fuel.png";

  const card = document.createElement("div");
  card.classList.add("ride-card", "fade-in");

  card.innerHTML = `
    <div class="driver-info">
      <img src="${trajet.photo}" alt="${trajet.driverName}" class="driver-photo">
      <div class="driver-text">
        <h3 class="driver-name">${trajet.driverName}</h3>
        <div class="driver-rating">
          ${generateStars(trajet.rating)}
        </div>
      </div>
    </div>

    <div class="ride-details">
      <div class="details-row"><p><strong>Places restantes :</strong></p><p>${trajet.seats}</p></div>
      <div class="details-row"><p><strong>Prix :</strong></p><p>${trajet.price}</p></div>
      <div class="details-row"><p><strong>Date :</strong></p><p>${trajet.departureDate}</p></div>
      <div class="details-row"><p><strong>Départ :</strong></p><p>${trajet.departureCity} - ${trajet.departureTime}</p></div>
      <div class="details-row"><p><strong>Arrivée :</strong></p><p>${trajet.arrivalCity} - ${trajet.arrivalTime}</p></div>
      <div class="details-row"><p><strong>Durée estimée :</strong></p><p>${trajet.duration} h</p></div>
      <div class="details-row"><p><strong>Écologique :</strong></p>
        <p><img src="${ecoIcon}" alt="Éco" class="eco-icon"></p>
      </div>
    </div>

    <button class="btn-detail">Détail</button>
  `;

  // --- Bouton detail actif après filtrage --- 
  const detailBtn = card.querySelector(".btn-detail");
  if (detailBtn) {
    detailBtn.addEventListener("click", () => {
      localStorage.setItem("lastSearchURL", globalThis.location.href);
      globalThis.location.href = `details.html?id=${trajet.id}`;
    });
  }

  resultsContainer.appendChild(card);
}
}

// --- Fonction principale de filtrage --- 
function filtrerTrajets() {
  if (!trajets || trajets.length === 0) return;


// Récupération des valeurs de filtres 
  const isEco = ecoFilter.checked;
  const maxPrice = Number.parseFloat(priceFilter.value);
  const maxDuration = Number.parseFloat(durationFilter.value);
  const ratingSelected = document.querySelector("#filter-rating .select-selected span");
  const value = ratingSelected.dataset.value;
  const minRating = value === "" ? 0 : Number(value);

  const trajetsFiltres = trajets.filter((trajet) => {
    const priceValue = parsePrice(trajet.price);
    const duree = calculerDuree(trajet.departureTime, trajet.arrivalTime);

    return (
      (!isEco || trajet.eco === true) && 
      (!maxPrice || priceValue <= maxPrice) && 
      (!maxDuration || duree <= maxDuration) &&
      (!minRating || trajet.rating >= minRating)
    );
  });

  afficherTrajets(trajetsFiltres);
}

// --- Événement sur le bouton "Appliquer" --- 
if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", (e) => {
  e.preventDefault();
  filtrerTrajets();  

  // -- Sauvergarde des filtres actifs 
  const filtersState = {
    eco: ecoFilter.checked,
    price: priceFilter.value, 
    duration: durationFilter.value, 
    rating: document.querySelector("#filter-rating .select-selected span")?.dataset?.value || ""
  };
  localStorage.setItem("activeFilters", JSON.stringify(filtersState));
});
} 


// --- Réinitialisation des filtres --- 
if (resetFilterBtn) {
  resetFilterBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Réinitialiser tous les champs 
    ecoFilter.checked = false;
    priceFilter.value = "";
    durationFilter.value ="";

    const ratingSpan = document.querySelector("#filter-rating .select-selected span");
    if (ratingSpan) {
      ratingSpan.innerHTML = "Toutes";
      ratingSpan.dataset.value = "";
    }

    // Réafficher tous les trajets initiaux 
    afficherTrajets(trajets);
  });
}

// --- Menu déroulant personnalisé pour les notes ---
const customSelect = document.getElementById("filter-rating");
const selected = customSelect.querySelector(".select-selected");
const optionsContainer = customSelect.querySelector(".select-options");

selected.addEventListener("click", () => {
  customSelect.classList.toggle("active");
});

// Gérer le clic sur une option
for (const option of optionsContainer.querySelectorAll("div")) {
  option.addEventListener("click", () => {
    const value = option.dataset.value;
    // Texte affiché
    if (value === "") {
      selected.querySelector("span").innerHTML = "Toutes";
    } else {  
      selected.querySelector("span").innerHTML = option.innerHTML; 
    }  
    selected.querySelector("span").dataset.value = value; 

    customSelect.classList.remove("active");
  });
}

// Ferme le menu si clic à l’extérieur
document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    customSelect.classList.remove("active");
  }
});

  // === Restauration des filtres après retour à la liste ===
  window.addEventListener("load", () => {
    const savedFilters = JSON.parse(localStorage.getItem("activeFilters"));
    if (!savedFilters) return;

    // On restaure les valeurs dans les champs
    ecoFilter.checked = savedFilters.eco || false;
    priceFilter.value = savedFilters.price || "";
    durationFilter.value = savedFilters.duration || "";

    const ratingSpan = document.querySelector("#filter-rating .select-selected span");
      if (ratingSpan) {
        if (savedFilters.rating === "" || savedFilters.rating === undefined) {
          ratingSpan.innerHTML = "Toutes";
          ratingSpan.dataset.value = "";
        } else {
          ratingSpan.innerHTML = savedFilters.rating + " ★";
          ratingSpan.dataset.value = savedFilters.rating;
        }
      }    

    // Appliquer les filtres 
      filtrerTrajets();
  });
});