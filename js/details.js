// EcoRide - details.js 
// Page DETAILS D'UN COVOITURAGE 


function generateStars(rating) {
  let starsHTML = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<img src="assets/icons/star-full.png" alt="étoile pleine" class="star-icon">`;
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

// Calcul de la durée estimée
function calculerDuree(departureTime, arrivalTime) {
  if (!departureTime || !arrivalTime) return "—";

  const [depH, depM] = departureTime.split(":").map(Number);
  const [arrH, arrM] = arrivalTime.split(":").map(Number);

  let depMinutes = depH * 60 + depM;
  let arrMinutes = arrH * 60 + arrM;

  // Si l'heure d'arrivée est inférieure, on suppose un trajet sur 2 jours
  if (arrMinutes < depMinutes) arrMinutes += 24 * 60;

  const totalMinutes = arrMinutes - depMinutes;
  const heures = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${heures}h${minutes.toString().padStart(2, "0")}`;
}

// ---- SCRIPT PRINCIPAL ---- 
document.addEventListener("DOMContentLoaded",() => {
    // Récupération de l'ID du trajet dans l'URL 
    const urlParams = new URLSearchParams(globalThis.location.search);
    const trajetID = urlParams.get("id");

    // Vérification : si aucun ID n'est présent -> retour vers listings
    if(!trajetID) {
        console.warn("Aucun détails trouvé. Redirection vers la liste des covoiturages");
        globalThis.location.href = "listings.html";
        return;
    }

    // Chargement du fichier JSON contenant les covoiturages 
    fetch("data/rides.json")
        .then((response) => {
            if (!response.ok) throw new Error("Impossible de charger les trajets");
            return response.json();
        })
        .then((data) => {
            // Recherche du trajet correspondant à l'ID récupéré 
            const trajet = data.find((item) => item.id == trajetID);

            if (!trajet) {
                console.error("Trajet introuvable pour l'ID :", trajetID);
                document.querySelector("main").innerHTML = "<p>Trajet introuvable.<p>";
                return;
            }

            // Injection des données dans la page 
            afficherDetailsTrajet(trajet);
            afficherPreferences(trajet.preferences);
            afficherAvis(trajet.reviews);
        })
        .catch((error) => {
            console.error("Error :", error);
            document.querySelector("main").innerHTML =
                "<p> Erreur de chargement des données. Veuillez réessayer plus tard.</p>";
        });
});

// ---- FONCTION -> Afficher les infos principales du trajet ----

function afficherDetailsTrajet(trajet) {
    const container = document.getElementById("ride-info");
    const ecoIcon = trajet.eco
        ?"assets/icons/ecologic.png"
        : "assets/icons/fuel.png";

  // 🚗 Gestion de l’énergie utilisée
    const energyLabel = trajet.energy
      ? trajet.energy
      : "Type d'énergie non renseigné";

    const dureeEstimee = calculerDuree(trajet.departureTime, trajet.arrivalTime);  

    // Création du contenu HTML à partir des données JSON 
    container.innerHTML = `
    <h2>Informations du trajet</h2>

      <div class="driver-info">
        <img src="${trajet.photo}" alt="Photo du conducteur ${trajet.driverName}" class="driver-photo">
        <div>
          <h3 class="driver-name">${trajet.driverName}</h3>
          <div class="driver-rating">
            ${generateStars(trajet.rating)}
          </div>
        </div>
      </div>  

      <div class="ride-details">
        <div class="details-row two-cols">
          <div>
            <p><strong>Départ :</strong> ${trajet.departureCity}</p>
            <p><strong>Date :</strong> ${trajet.departureDate}</p>
            <p><strong>Heure :</strong> ${trajet.departureTime}</p>
          </div>
          <div>
          <p><strong>Arrivée :</strong> ${trajet.arrivalCity}</p>
          <p><strong>Date :</strong> ${trajet.arrivalDate}</p>
          <p><strong>Heure :</strong> ${trajet.arrivalTime}</p>
        </div>
      </div>

      <div class="details-row center-row">
        <p><strong>Durée estimée :</strong></p><p>${dureeEstimee || "—"}</p>
      </div>

      <div class="vehicle-info center-row">
        <div class="vehicle-title">
        <img src="assets/icons/car.png" alt="Icône véhicule" class="vehicle-icon">
        <h4>Véhicule</h4>
        </div>

        <p class="vehicle-type"><strong>Marque :</strong> ${trajet.carBrand} - <strong>Modèle :</strong> ${trajet.carModel} - <strong>Énergie :</strong> ${trajet.energy}</p>
        </div>    

      <div class="details-row center-row">
        <p><strong>Prix / place :</strong></p><p>${trajet.price}</p>
      </div>

      <div class="details-row center-row">
          <p><strong>Places restantes :</strong></p><p>${trajet.seats}</p>
      </div>
 
      <div class="details-row eco-section center-row">
        <p><strong>Mention écologique :</strong></p>
        <img src="${ecoIcon}" alt="${trajet.eco}" class="eco-icon">
      </div>   
  `;
}

// ---- FONCTION -> Afficher les préférences du conducteur 
function afficherPreferences(preferences) {
    const container = document.getElementById("preferences");
    if (!container) return;

    if (!preferences || preferences.length === 0) {
        container.innerHTML = `
          <section class="driver-preferences">          
            <h2>Préférences du conducteur</h2>
            <p>Aucune préférences renseignée.</p>
          </section>  
        `;
        return;
    }

// Association texte + icône 
const iconMap = {
  "Accepte les animaux": "assets/icons/paw.png",
  "N'accepte pas les animaux": "assets/icons/no-paw.png",
  "Aime la musique": "assets/icons/music.png",
  "Pas de musique": "assets/icons/no-music.png",
  "Fumeur": "assets/icons/smoke.png",
  "Non fumeur": "assets/icons/no-smoke.png",
  "Aime discuter": "assets/icons/chat.png",
  "Pause café possible": "assets/icons/coffee.png"
};

// Génération dynamique des éléments <li>
  const prefList = preferences
    .map(
      (pref) => `
        <li>
         <img src="${iconMap[pref] || 'assets/icons/default.png'}" alt="${pref}">
         <span>${pref}</span>
        </li>
    `
  )
  .join("");

  container.innerHTML = `
    <section class="driver-preferences">
      <h3>Préférences du conducteur</h3>
      <ul>${prefList}</ul>
    </section>
  `;
}

// ---- FONCTION -> Afficher les avis du conducteur 
function afficherAvis(reviews) {
  const reviewsSection = document.getElementById("reviews");

  if (!reviews || reviews.length === 0) {
    container.innerHTML += `
      <p>Aucun avis pour le moment.</p>
    `;
    return;
  }

  // Conteneur des avis
  const list = document.createElement("div");
  list.classList.add("reviews-list");

  reviews.forEach((avis) => {
    const card = document.createElement("div");
    card.classList.add("review-card");

    // Colonne 1 : pseudo
    const pseudo = document.createElement("p");
    pseudo.classList.add("pseudo");
    pseudo.textContent = avis.auteur;

    // Colonne 2 : étoiles
    const stars = document.createElement("div");
    stars.classList.add("stars");
    const fullStars = Math.floor(avis.note);
    const hasHalf = avis.note % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.innerHTML += `<img src="assets/icons/star-full.png" alt="★">`;
    }
    if (hasHalf) {
      stars.innerHTML += `<img src="assets/icons/star-half.png" alt="☆">`;
    }
    for (let i = stars.children.length; i < 5; i++) {
      stars.innerHTML += `<img src="assets/icons/star-empty.png" alt="☆">`;
    }

    // Colonne 3 : commentaire
    const comment = document.createElement("p");
    comment.classList.add("comment");
    comment.textContent = avis.commentaire;

    // Injection dans la grille
    card.append(pseudo, stars, comment);
    list.appendChild(card);
  });

  reviewsSection.appendChild(list);
}

// ---- BOUTON PARTICIPER ----
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "participer-btn") {
    alert(" Fonctionnalité de réservation à venir !");
  }
});

// --- BOUTON RETOUR A LA LISTE --- 
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-to-list");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Si recherche enregistrée : 
      const lastSearchURL = localStorage.getItem("lastSearchURL");
      if (lastSearchURL) {
        window.location.href = lastSearchURL;
      } else { 
        // On renvoie à la page listings 
        window.location.href = "listings.html"; 
      }
    });
  }
});