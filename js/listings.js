// EcoRide - listings.js
// Génération dynamique des covoiturages selon disponibilité et filtres stricts

document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.querySelector(".results-container");
    const resultsSection = document.querySelector(".results-section");

// --- Vérification : a-t-on des paramètres de recherche ? ---
    const urlParams = new URLSearchParams(window.location.search);
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

  const requestedDate = new Date(date);

  // --- Charger les données depuis rides.json ---
  fetch("data/rides.json")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur de chargement du fichier JSON");
      return response.json();
    })
    .then((rides) => {
      // --- Conversion des dates FR en objets Date valides ---
      const formattedRides = rides.map((ride) => ({
        ...ride,
        parsedDate: parseFrenchDate(ride.date), // convertit JJ/MM/AAAA en Date
      }));

    // --- Filtrage strict ---
    const filteredRides = formattedRides.filter((ride) => {
        const rideFrom = ride.departure.split(" - ")[0].trim().toLowerCase();
        const rideTo = ride.arrival.split(" - ")[0].trim().toLowerCase();

        // Conversion manuelle de la date URL au format JJ/MM/AAAA
        const [year, month, day] = date.split("-");
        const requestedDateStr = `${day}/${month}/${year}`;

        // date du JSON déjà au bon format 
        const rideDateStr = ride.date.trim();
        
        return (
            rideFrom === from &&
            rideTo === to &&
            rideDateStr === requestedDateStr &&
            ride.seats > 0
        );
    });


      // --- Cas 1 : trajets trouvés ---
      if (filteredRides.length > 0) {
        renderRides(filteredRides, resultsContainer);
        return;
      }

// --- Cas 2 : aucun trajet trouvé à la date exacte ---
const nextRide = findNextAvailableRideForRoute(formattedRides, from, to, requestedDate);

if (nextRide) {
  // Message d'information clair
  resultsContainer.innerHTML = `
    <div class="no-results">
      <img src="assets/icons/calendar.png" alt="Aucun trajet" class="empty-icon">
      <h3>Aucun trajet disponible le ${formatDate(requestedDate)}</h3>
      <p class="next-ride-message">
        Le plus proche pour cette ligne est disponible le 
        <strong>${formatDate(nextRide.parsedDate)}</strong> 
        à <strong>${nextRide.departure.split(" - ")[1]}</strong>.
      </p>
    </div>
  `;

    // Ajout du trajet proposé en dessous
    const wrapper = document.createElement("div");
    wrapper.classList.add("next-ride-wrapper");
    resultsContainer.appendChild(wrapper);

    renderRides([nextRide], wrapper);
    } else {
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
});

// --- Conversion JJ/MM/AAAA -> Date fiable ---
function parseFrenchDate(dateStr) {
  // Exemple : "25/10/2025"
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day); // mois = 0-11
}


// --- Trouver le prochain trajet similaire ---
function findNextAvailableRideForRoute(rides, from, to, requestedDate) {
  const candidates = rides
    .filter((r) => {
      const rideFrom = r.departure.split(" - ")[0].trim().toLowerCase();
      const rideTo = r.arrival.split(" - ")[0].trim().toLowerCase();
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

// --- Affichage des trajets ---
function renderRides(rides, container) {
  container.innerHTML = "";

  rides.forEach((ride) => {
    const card = document.createElement("div");
    card.classList.add("ride-card", "fade-in");

    const ecoIcon = ride.eco
      ? "assets/icons/ecologic.png"
      : "assets/icons/fuel.png";

    card.innerHTML = `
      <div class="driver-info">
        <img src="${ride.photo}" alt="Conducteur" class="driver-photo">
        <h3 class="driver-name">${ride.driverName}</h3>
        <div class="driver-rating">
          ${generateStars(ride.rating)}
        </div>
      </div>

      <div class="ride-details">
        <div class="details-row"><p>Places restantes</p><p>${ride.seats} places</p></div>
        <div class="details-row"><p>Prix</p><p>${ride.price}</p></div>
        <div class="details-row"><p>Date</p><p>${ride.date}</p></div>
        <div class="details-row"><p>Départ</p><p>${ride.departure}</p></div>
        <div class="details-row"><p>Arrivée</p><p>${ride.arrival}</p></div>
        <div class="details-row"><p>Écologique ?</p><img src="${ecoIcon}" class="eco-icon"></div>
      </div>

      <button class="btn-detail">Détail</button>
    `;

    container.appendChild(card);
  });
}

// --- Formatage des dates JJ/MM/AAAA sans décalage ---
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
