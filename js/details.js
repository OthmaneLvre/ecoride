// EcoRide - details.js 
// Page DETAILS D'UN COVOITURAGE 

function generateStars(note) {
  let starsHTML = "";
  const fullStars = Math.floor(note);
  const hasHalfStar = note % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<img src="assets/icons/star-full.png" alt="étoile pleine" class="star-icon">`;
  }
  if (hasHalfStar) {
    starsHTML += `<img src="assets/icons/star-half.png" alt="étoile demi" class="star-icon">`;
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<img src="assets/icons/star-empty.png" alt="étoile vide" class="star-icon">`;
  }

  return starsHTML;
}

/* --- Mise à jour de la note moyenne du chauffeur --- */
function updateAverageRating(moyenne) {
  const ratingBox = document.querySelector(".driver-rating");

  if (!ratingBox) return;

  if (!moyenne) {
    ratingBox.innerHTML = `<p>Aucune note</p>`;
    return;
  }

  ratingBox.innerHTML = generateStars(moyenne);
}



// ---- Convertit les préférences "brutes" du trajet en texte lisible ----
function extrairePreferencesTrajet(trip) {
    let prefs = [];

    // Fumeur
    if (trip.fumeur == 1) prefs.push("Fumeur");
    if (trip.fumeur == 0) prefs.push("Non fumeur");

    // Animaux
    if (trip.animal == 1) prefs.push("Accepte les animaux");
    if (trip.animal == 0) prefs.push("N'accepte pas les animaux");

    // Préférences personnalisées
    if (trip.preferences_personnalisees) {
        try {
            const custom = JSON.parse(trip.preferences_personnalisees);
            prefs = prefs.concat(custom);
        } catch (e) {
            console.warn("Erreur JSON préférences perso :", e);
        }
    }

    return prefs;
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

function restaurerReservation(trajetID) {
    console.log("Réservation restaurée pour le trajet ID :", trajetID);
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
    fetch(`php/get_trips_details.php?id=${trajetID}`)
        .then((response) => {
            if (!response.ok) throw new Error("Erreur de chargement depuis la base");
            return response.json();
        })
        .then((trajet) => {
          if (trajet.error) {
            document.querySelector("main").innerHTML = `<p> Erreur : ${trajet.error}</p>`;
            return;
          }

          if (trajet.message) {
            document.querySelector("main").innerHTML = `<p> ${trajet.message}</p>`;
            return;
          }

          console.log("Détails du trajet récupérés :", trajet);

          // --- Conversion pour compatibilité avec tes fonctions existantes ---
          const dataFormat = {
            id: trajet.id_covoiturage,
            driverName: `${trajet.chauffeur_prenom} ${trajet.chauffeur_nom}`,
            departureCity: trajet.lieu_depart,
            arrivalCity: trajet.lieu_arrivee,
            departureDate: trajet.date_depart,
            arrivalDate: trajet.date_arrivee,
            departureTime: trajet.heure_depart,
            arrivalTime: trajet.heure_arrivee,
            seats: trajet.nb_places,
            price: trajet.prix_personne + " €",
            rating: 0,
            photo: trajet.chauffeur_photo || "assets/images/default-user.png",
            carBrand: trajet.marque || "Non renseignée",
            carModel: trajet.modele || "—",
            carColor: trajet.couleur || "—",
            energy: trajet.energie || trajet.energy || "—",
            eco: true,
            preferences: [],
            reviews: []
          };

            // Appel des fonctions existantes  
            afficherDetailsTrajet(dataFormat);

            const preferencias = extrairePreferencesTrajet(trajet);
            afficherPreferences(preferencias);
            
            // Chargement des avis du chauffeur 
            const chauffeurID = trajet.chauffeur_id;
            console.log("ID chauffeur :", trajet.chauffeur_id);

            loadDriverNotice(chauffeurID);
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

    // Vérification si c'est une voiture électrique ou non 
    let isElectric = false;

    if (trajet.energy) {
      const energy = trajet.energy.toLowerCase();
      if (energy.includes("elect")) {
        isElectric = true;
      }
    }  

    // Gestion de l'énergie utilisée 
    let energyLabel = "Type d'énergie non renseigné";
    let energyClass = "";
    
    if (trajet.energy) {
        const energy = trajet.energy.toLowerCase();
        if (energy.includes("élect")) {
            energyLabel = trajet.energy;
            energyClass = "electric";
        } else if (energy.includes("essence") || energy.includes("diesel")) {
            energyLabel = trajet.energy;
            energyClass = "fossil";
        } else {
          energyLabel = trajet.energy
        }
    }

    const dureeEstimee = calculerDuree(trajet.departureTime, trajet.arrivalTime);  

    // Icone selon le type d'energie 
    const ecoIcon = isElectric
      ? "assets/icons/ecologic.png"
      : "assets/icons/fuel.png";

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
            <p><strong>Date :</strong> ${formatDate(trajet.departureDate)}</p>
            <p><strong>Heure :</strong> ${formatTime(trajet.departureTime)}</p>
          </div>
          <div>
          <p><strong>Arrivée :</strong> ${trajet.arrivalCity}</p>
          <p><strong>Date :</strong> ${formatDate(trajet.arrivalDate)}</p>
          <p><strong>Heure :</strong> ${formatTime(trajet.arrivalTime)}</p>
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

        <p class="vehicle-type">
          <strong>Marque :</strong> ${trajet.carBrand} -
          <strong>Modèle :</strong> ${trajet.carModel} - 
          <strong>Couleur :</strong> ${trajet.carColor} - 
          <strong>Énergie :</strong> <span class="energy-text ${energyClass}">${energyLabel}</span>
        </p>  
      </div>    

      <div class="details-row center-row">
        <p><strong>Prix / place :</strong></p><p>${trajet.price}</p>
      </div>

      <div class="details-row center-row">
          <p><strong>Places restantes :</strong></p><p>${trajet.seats}</p>
      </div>
 
      ${
        isElectric
          ? `
        <div class="details-row eco-section center-row">
          <p><strong>Mention écologique :</strong></p>
          <img src="${ecoIcon}" alt="Véhicule écologique" class="eco-icon">
        </div>   
      `
          : ""
      }
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
function showReview(reviews) {
  const reviewsSection = document.getElementById("reviews");

  if (!reviews || reviews.length === 0) {
    reviewsSection.innerHTML += `
      <p>Aucun avis pour le moment.</p>
    `;
    return;
  }

  // Conteneur des avis
  const list = document.createElement("div");
  list.classList.add("reviews-list");

  for(const review of reviews) {
    const card = document.createElement("div");
    card.classList.add("review-card");

    // Colonne 1 : pseudo
    const pseudo = document.createElement("p");
    pseudo.classList.add("pseudo");
    pseudo.textContent = review.auteur;

    // Colonne 2 : étoiles
    const stars = document.createElement("div");
    stars.classList.add("stars");
    const fullStars = Math.floor(review.note);
    const hasHalfStar = review.note % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.innerHTML += `<img src="assets/icons/star-full.png" alt="★">`;
    }
    if (hasHalfStar) {
      stars.innerHTML += `<img src="assets/icons/star-half.png" alt="☆">`;
    }
    for (let i = stars.children.length; i < 5; i++) {
      stars.innerHTML += `<img src="assets/icons/star-empty.png" alt="☆">`;
    }

    // Colonne 3 : commentaire
    const comment = document.createElement("p");
    comment.classList.add("comment");
    comment.textContent = review.commentaire;

    // Injection dans la grille
    card.append(pseudo, stars, comment);
    list.appendChild(card);
  };

  reviewsSection.appendChild(list);
}

/* Chargement des Avis + moyenne chauffeur */

async function loadDriverNotice(id_chauffeur) {
  try {
    const response = await fetch("php/get_reviews.php?id_chauffeur=" + id_chauffeur);
    const result = await response.json();

    console.log("Avis du chauffeur :", result);

    const moyenne = result.moyenne;
    const avis = result.avis;

    // Mettre à jour la note moyenne 
    updateAverageRating(moyenne);

    // Afficher les avis 
    showReview(avis);

  } catch (err) {
    console.error("Erreur lors du chargement des avis :", err);
  }
}

// --- BOUTON RETOUR A LA LISTE --- 
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-to-list");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Si recherche enregistrée : 
      const lastSearchURL = localStorage.getItem("lastSearchURL");
      if (lastSearchURL) {
        globalThis.location.href = lastSearchURL;
      } else { 
        // On renvoie à la page listings 
        globalThis.location.href = "listings.html"; 
      }
    });
  }
});

// --- PARTICPATION REELLE VIA LA BASE DE DONNEES ---
const participerBtn = document.getElementById("participate-btn");
const feedback = document.getElementById("feedback-msg");

if (participerBtn) {
  participerBtn.addEventListener("click", () => {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const trajetID = urlParams.get("id");

    if (!trajetID) {
      feedback.textContent = "ID du trajet introuvable.";
      feedback.style.error = "var(--error)";
      return;
    }

    const userId =localStorage.getItem("currentUserId");

    if (!userId) {
      feedback.textContent = "Vous devez être connecté pour participer à un covoiturage."
      feedback.style.color = "var(--error)";
      return;
    }

    // Appel vers le back PHP 
    fetch("php/join_trip.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `trip_id=${encodeURIComponent(trajetID)}`
    })
      .then((res) => res.json())
      .then((data) => {
        
        // Cas 1 : non conecté 
        if (data.error === "not_logged_in") {
          feedback.textContent = "Veuillez vous connecter pour participer à ce covoiturage.";
          feedback.style.color = "var(--error)";
          return;
        }

        if (data.status === "ok") {
          feedback.textContent = "Participation confirmée ! Votre place est réservée.";
          feedback.style.color = "var(--success)";
          participerBtn.textContent = "Place réservée";
          participerBtn.disabled = true;
          return;
        }

        if (data.error) {
          feedback.textContent = "Erreur serveur : " + data.error;
          feedback.style.color = "var(--error)";
        } else {
          feedback.textContent = "Une erreur est survenue.";
          feedback.style.color = "var(--error)";
        }
      })
      .catch((err) => {
        console.error("Erreur fetch participation :", err);
        feedback.textContent = "Impossible d'enregistrer votre participation pour ce covoiturage.";
        feedback.style.color = "var(--error)";
      });
  });
}
