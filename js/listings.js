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

// --- Conversion JJ/MM/AAAA -> Date JS ---
function parseFrenchDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
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
  const candidates = rides
    .filter((r) => {
      const rideFrom = r.departureCity.trim().toLowerCase();
      const rideTo = r.arrivalCity.trim().toLowerCase();
      return (
        rideFrom === from &&
        rideTo === to &&
        r.parsedDate > requestedDate &&
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

  // --- Charger les données depuis rides.json ---
  fetch("data/rides.json")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur de chargement du fichier JSON");
      return response.json();
    })
    .then((rides) => {
      // --- Conversion des dates FR en objets Date valides + ajout auto de la durée ---
      const formattedRides = rides.map((ride) => ({
        ...ride,
        parsedDate: parseFrenchDate(ride.departureDate, ride.arrivalDate), // convertit en Date fr
        duration: calculerDuree(ride.departureTime, ride.arrivalTime), // ajout de la durée
      }));

      trajets = formattedRides;

    // --- Filtrage strict ---
    const filteredRides = formattedRides.filter((ride) => {
        const rideFrom = ride.departureCity.trim().toLowerCase();
        const rideTo = ride.arrivalCity.trim().toLowerCase();

        // Conversion manuelle de la date URL au format JJ/MM/AAAA
        const [year, month, day] = date.split("-");
        const requestedDateStr = `${day}/${month}/${year}`.trim();

        return (
            rideFrom === from.toLowerCase() &&
            rideTo === to.toLowerCase() &&
            ride.departureDate.trim() === requestedDateStr &&
            ride.seats > 0
        );
    });

    // Stock les résultats trouvés dans la variable globale 
    trajets = filteredRides


      // --- Cas 1 : trajets trouvés ---
      if (filteredRides.length > 0) {
        renderRides(filteredRides, resultsContainer);
        return;
      }

// --- Cas 2 : aucun trajet trouvé à la date exacte ---
const nextRide = findNextAvailableRideForRoute(formattedRides, from, to, new Date(date));
if (nextRide) {
  // Message d'information clair
  resultsContainer.innerHTML = `
    <div class="no-results">
      <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
      <h3>Aucun trajet disponible le ${formatDate(new Date(date))}</h3>
      <p class="next-ride-message">
        Le plus proche pour cette ligne est disponible le 
        <strong>${formatDate(nextRide.parsedDate)}</strong> 
        à <strong>${nextRide.departureTime}</strong>.
      </p>
    </div>
  `;

  // Stockage du trajet plus proche pour filtres 
  trajets = [nextRide];

    // Ajout du trajet proposé en dessous
    const wrapper = document.createElement("div");
    wrapper.classList.add("next-ride-wrapper");
    resultsContainer.appendChild(wrapper);
    renderRides([nextRide], wrapper);
    } else {
    // --- Cas 3 : aucun trajet du tout 
    resultsContainer.innerHTML = `
        <div class="no-results">
        <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
        <h3>Aucun trajet disponible pour cette recherche</h3>
        <p>Revenez plus tard pour découvrir de nouveaux trajets.</p>
        </div>
    `;
    }
})
.catch((error) => {
  console.error("Erreur :", error);
  resultsContainer.innerHTML = "<p>Impossible de charger les trajets.</p>";
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

    container.appendChild(card);
  };
}


//  FILTRAGE DES COVOITURAGES 

// Sélection des éléments du DOM
const ecoFilter = document.getElementById('filter-eco');
const priceFilter = document.getElementById('filter-price');
const durationFilter = document.getElementById('filter-duration');
const ratingFilter = document.getElementById('filter-rating');
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
  const minRating = Number.parseFloat(ratingSelected?.dataset?.value || 0);

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
    selected.querySelector("span").innerHTML = option.innerHTML; // copie visuelle
    selected.querySelector("span").dataset.value = option.dataset.value; 
    selected.dataset.value = option.dataset.value; // stocke la valeur
    customSelect.classList.remove("active");
  });
}

// Ferme le menu si clic à l’extérieur
document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    customSelect.classList.remove("active");
  }
});
});