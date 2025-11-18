// ---- USER-SPACE.JS ---- 

/* Fonction pour autorisation laisser un avis */
function postReview(trip) {
  return trip.statut_covoiturage === "termine" && trip.id_avis === null;
}

/* Fonction formatage date */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR");
}

/* Fonction formatage heure */
function formatTime(timeStr) {
    return timeStr.slice(0,5); 
}

// --- Chargement dynamique des marques --- 
async function loadBrands() {
  const brandSelect = document.getElementById("brand");

  try {
    const response = await fetch("php/get_brands.php");
    const brands = await response.json();

    if (brands.error) {
      brandSelect.innerHTML = `<option value="">Erreur de chargement des marques</option>`;
      return;
    }

    // Vide les anciennes options sauf la première
    brandSelect.innerHTML = `<option value="">-- Choisissez une marque --</option>`;

    // Ajoute les marques dynamiquement
    for(const b of brands) {
      const option = document.createElement("option");
      option.value = b.id_marque;       // on envoie l’ID à la BDD
      option.textContent = b.libelle;   // on affiche le nom de la marque
      brandSelect.appendChild(option);
    };
  } catch (err) {
    console.error("Erreur lors du chargement des marques :", err);
    brandSelect.innerHTML = `<option value="">Impossible de charger les marques</option>`;
  }
}

// --- Appel automatique au chargement de la page ---
document.addEventListener("DOMContentLoaded", () => {
  loadBrands();
});

// Fonction crédits 
function displayDriverCredits() {
  const currentUserId = localStorage.getItem("currentUserId") || "1";
  const userCredits = JSON.parse(localStorage.getItem("userCredits")) || {};
  const creditDisplay = document.getElementById("driver-credit");
  if (creditDisplay) {
    creditDisplay.textContent = userCredits[currentUserId] || 0;
  }
}
document.addEventListener("DOMContentLoaded", displayDriverCredits);

// Sélecteurs
const roleInputs = document.querySelectorAll('input[name="role"]');
const driverSection = document.getElementById('driver-section');
const vehicleList = document.getElementById('vehicle-list');
const smokerCheckbox = document.getElementById('smoker');
const animalCheckbox = document.getElementById('animal');
const addPreferenceBtn = document.getElementById('add-preference-btn');
const customPreferenceInput = document.getElementById('custom-preference');
const customPreferenceList = document.getElementById('custom-preference-list');
const saveBtn = document.getElementById('save-btn');


// ---- INFOS PERSONNELLES ---- 

const photoInput = document.getElementById('user-photo');
const photoDisplay = document.getElementById('photo-display');

photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      photoDisplay.src = event.target.result;
      localStorage.setItem('userPhoto', event.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// ---- GESTION DU ROLE ---- 

// Gestion de la visibilité de la section "Saisir un nouveau voyage"
const tripSection = document.getElementById("create-trip");

function updateTripSectionVisibility(role) {
  if (!tripSection) return;

  if (role.includes("chauffeur") || role.includes("les-deux")) {
    tripSection.classList.remove("hidden");
  } else {
    tripSection.classList.add("hidden");
  }
}

for (const input of roleInputs) {
  input.addEventListener('change', async () => {
    const selectedRole = input.value;
    const currentUserId = localStorage.getItem("currentUserId") || "1";

    // Affiche/masque la section voyage selon le rôle choisi 
    updateTripSectionVisibility(selectedRole);

    // Affiche/Masque la section chauffeur
    if (selectedRole === 'chauffeur' || selectedRole === 'les-deux') {
      driverSection.classList.remove('hidden');
    } else {
      driverSection.classList.add('hidden');
    }

    // --- Envoi du rôle à la BDD ---
    console.log("ID:", currentUserId, "Rôle sélectionné:", selectedRole);
    
    try {
      const response = await fetch("php/update_user_role.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilisateur: currentUserId,
          role: selectedRole
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log("Succès" + result.message);
        alert("Rôle mis à jour avec succès.");
      } else {
        console.error("Erreur : " + result.error);
        alert("X" + (result.error || "Erreur lors de la mise à jour du rôle."));
      }

    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Impossible d'enregistrer le rôle (erreur de connexion).");
    }
  });
}  

// ---- GESTION DES VEHICULES ----
const addVehicleForm = document.getElementById("add-vehicle-form");
const addVehicleBtn = document.getElementById('add-vehicle-btn');
const cancelAdd = document.getElementById("cancel-add");

async function displayVehicles() {
  vehicleList.innerHTML = "";

  const currentUserId = localStorage.getItem("currentUserId") || "1";
  if (!currentUserId) {
    vehicleList.innerHTML = `<p class="error">ID utilisateur introuvable.</p>`;
    return;
  }  

  try {
    // Récupération depuis la base 
    const response = await fetch(`php/get_vehicles.php?id_utilisateur=${currentUserId}`);
    const vehicles = await response.json();

    if (vehicles.error) {
      vehicleList.innerHTML = `<p class="error">Erreur : ${vehicles.error}</p>`;
      return;
    }

    // Aucun véhicule trouvé ? 
    if (vehicles.length === 0) {
      vehicleList.innerHTML = `
        <div class="no-vehicle">
          <p>Aucun véhicule enregistré pour le moment.</p>
        </div>
      `;

      // Redirige vers la section "Mes véhicules"
      document.getElementById("btnGoVehicle").addEventListener("click", () => {
        const vehicleSelection = document.querySelector(".vehicles");
        vehicleSelection.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }
    
    // si on a des véhicules -> on les affiche
    for (const v of vehicles) {
      const vehicleCard = document.createElement("div");
      vehicleCard.classList.add("vehicle-card");

      vehicleCard.innerHTML = `
        <div class="vehicle-info">
          <p><strong>${v.marque} ${v.modele}</strong> (${v.couleur})</p>
          <p>Immatriculation : ${v.immatriculation}</p>
          <p>Énergie : ${v.energie}</p>
          <p>Date 1ère immatriculation : ${formatDate(v.date_premiere_immatriculation)}</p>
        </div>
        <button class="btn-danger remove-vehicle" data-id="${v.id_voiture}">Supprimer</button>
      `;

      vehicleList.appendChild(vehicleCard);
    }

  } catch (err) {
    console.error("Erreur lors du chargement des véhicules :", err);
    vehicleList.innerHTML = `<p class="error">Impossible de charger les véhicules.</p>`;
  }  
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Affichage / masquage du formulaire véhicule --- 
  addVehicleBtn.addEventListener("click", () => {
    addVehicleForm.classList.remove("hidden");
    addVehicleBtn.classList.add("hidden");
  });

  cancelAdd.addEventListener("click", () => {
    addVehicleForm.classList.add("hidden");
    addVehicleBtn.classList.remove("hidden");
  });

  // Suppression d'un véhicule 
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-vehicle")) {
      const idVoiture = e.target.dataset.id;
      const currentUserId = localStorage.getItem("currentUserId") || "1";

      if (!idVoiture) {
        alert("ID du véhicule manquant.");
        return;
      }

      if (!confirm("Voulez-vous vraiment supprimer ce véhicule ?")) return;

      try {
        const response = await fetch("php/delete_vehicle.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `id_voiture=${idVoiture}&id_utilisateur=${currentUserId}`
        });

        const result = await response.json();
        if (result.success) {
          alert(result.message);
          displayVehicles(); // 🔄 Recharge la liste
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
        alert("Erreur de connexion au serveur");
      }
    }  
  });
});

// --- Met à jour le SELECT des véhicules dans la section "Saisir un voyafe" ---
async function loadVehiclesToSelect() {
  const select = document.getElementById("vehicle");
  if (!select) return;

  select.innerHTML = `<option value="">--Choississez un véhicule --</option>`;

  const currentUserId = localStorage.getItem("currentUserId") || '1';

  try {
    const response = await fetch(`php/get_vehicles.php?id_utilisateur=${currentUserId}`);
    const vehicles = await response.json();

    if (!Array.isArray(vehicles)) return;

    for (const v of vehicles) {
      const option = document.createElement("option");
      option.value = v.id_voiture;
      option.textContent = `${v.marque} ${v.modele} (${v.couleur})`;
      select.appendChild(option);
    };

  } catch (err) {
      console.error("Erreur lors du chargement du select véhicules :", err);
  }
}

// --- Soumission du formulaire d'ajout ---
document.getElementById("vehicleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentUserId = localStorage.getItem("currentUserId");
  const brand = document.getElementById("brand").value;
  const model = document.getElementById("model").value;
  const color = document.getElementById("color").value;
  const plate = document.getElementById("plate").value;
  const energy = document.getElementById("energy").value;
  const firstRegDate = document.getElementById("firstRegDate").value;

  if (!brand || !model || !color || !plate || !energy || !firstRegDate) {
    alert("Merci de remplir tous les champs requis");
    return;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("marque", brand);
    formData.append("modele", model);
    formData.append("couleur", color);
    formData.append("immatriculation", plate);
    formData.append("energie", energy);
    formData.append("date_premiere_immatriculation", firstRegDate);
    formData.append("id_utilisateur", currentUserId);

    const response = await fetch("php/add_vehicle.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      await loadBrands(); // Recharge la liste des marques
      alert("Véhicule ajouté avec succès !");
      displayVehicles(); // Rafraichis la liste 
      await loadVehiclesToSelect(); // Met à jours la liste déroule de sélection des véhicules
      addVehicleForm.classList.add("hidden");
      addVehicleBtn.classList.remove("hidden");
      e.target.reset();
    } else {
      alert(result.error || "Erreur lors de l'ajout du véhicule.");
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau lors de l'ajout du véhicule.");
  }
});

// --- CHARGEMENT DES DONNEES UTILISATEUR DEPUIS LA BDD ---
async function loadUserFromDatabase() {
  const currentUserId = localStorage.getItem("currentUserId") || "1";

  try {
    const response = await fetch("php/get_user_data.php?id_utilisateur=" + currentUserId);
    const user = await response.json();

    if (user.error) {
      console.error("Erreur serveur :", user.error);
      alert("Impossible de charger les données utilisateur.");
      return;
    }

    // --- Afficher les crédits --- 
    document.getElementById("user-credit").textContent = user.credits || 0;

    // --- Remplissage des champs --- 
    document.getElementById("user-lastname").value = user.nom || "";
    document.getElementById("user-firstname").value = user.prenom || "";
    document.getElementById("user-pseudo").value = user.pseudo || "";
    document.getElementById("user-phone").value = user.telephone || "";
    document.getElementById("user-address").value = user.adresse || "";
    document.getElementById("user-birthdate").value =
      (user.date_naissance && user.date_naissance !== "0000-00-00")
        ? user.date_naissance
        : "";
    document.getElementById("user-email").value = user.email || "";

    if (user.photo) {
      document.getElementById("photo-display").src = user.photo;
    }

    // --- Cocher automatiquement le rôle au rechargement --- 
    if (user.role) {
    const role = user.role.toLowerCase();

    // Mise à jour du rôle dans le localStorage (pour le header / menu)
    localStorage.setItem("currentUserRoles", JSON.stringify([role]));

    // Mise à jour en mémoire globale
    globalThis.currentUserRoles = [role];

    // On met à jour immédiatement la navigation
    if (typeof updateNavLinks === "function") updateNavLinks();

    if (role.includes("chauffeur") && role.includes("passager")) {
      document.querySelector('input[value="les-deux"]').checked = true;
      driverSection.classList.remove("hidden");
    } else if (role.includes("chauffeur")) {
      document.querySelector('input[value="chauffeur"]').checked = true;
      driverSection.classList.remove("hidden");
    } else if (role.includes("passager")) {
      document.querySelector('input[value="passager"]').checked = true;
      driverSection.classList.add("hidden");
    }

    updateTripSectionVisibility(role);
}

    // --- Préférences --- 
    if (user.preferences) {
      smokerCheckbox.checked = !!Number.parseInt(user.preferences.fumeur);
      animalCheckbox.checked = !!Number.parseInt(user.preferences.animal);

      // Affichage des préférences personnalisées 
      customPreferenceList.innerHTML = "";
      try {
        const prefsPerso = JSON.parse(user.preferences.preferences_personnalisees || "[]");
        for (const pref of prefsPerso) {
          const li = document.createElement("li");
          li.textContent = pref;

          const removeBtn = document.createElement("button");
          removeBtn.textContent = "x";
          removeBtn.classList.add("remove-pref");
          removeBtn.addEventListener("click", () => li.remove());

          li.appendChild(removeBtn);
          customPreferenceList.appendChild(li);
        };
      } catch (e) {
        console.warn("Erreur lecteur préférences perso :", e);
      }
    }

    console.log("Données utilisateur chargées depuis la base.");

  } catch (err) {
    console.error("Erreur réseau :", err);
    alert("Connexion perdue avec le serveur.");
  }
};

// Appelle de la fonction au chargement global de la page 
document.addEventListener("DOMContentLoaded", () => {
  loadUserFromDatabase();
  displayVehicles();
  loadVehiclesToSelect();
  displayPendingTrips();
  displayUserTrips();
});

// ---- GESTION DES PREFERENCES ---- 

addPreferenceBtn.addEventListener('click', () => {
  const value = customPreferenceInput.value.trim();
  if (value !== '') {
    const li = document.createElement('li');
    li.textContent = value;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.classList.add('remove-pref');
    removeBtn.addEventListener('click', () => li.remove());

    li.appendChild(removeBtn);
    customPreferenceList.appendChild(li);
    customPreferenceInput.value = '';
  }
});

// ---- SAUVEGARDE DES DONNEES ---- 

saveBtn.addEventListener('click', async () => {
  const currentUserId = localStorage.getItem("currentUserId") || "1";

  
  const personalInfo = {
    nom: document.getElementById('user-lastname').value,
    prenom: document.getElementById('user-firstname').value,
    pseudo: document.getElementById('user-pseudo').value,
    email: document.getElementById('user-email') ? document.getElementById('user-email').value : "",
    telephone: document.getElementById('user-phone').value,
    adresse: document.getElementById('user-address').value,
    date_naissance: document.getElementById('user-birthdate').value,
    photo: localStorage.getItem('userPhoto') || null,
  };

  const preferences = {
    fumeur: smokerCheckbox.checked ? 1 : 0,
    animal: animalCheckbox.checked ? 1 : 0,
    preferences_personnalisees: Array.from(customPreferenceList.querySelectorAll('li')).map(li => li.firstChild.textContent)
  };

  const userData = {
    id_utilisateur: currentUserId,
    ...personalInfo,
    preferences
  };

  try {
    // --- Mise à jour des infos utilisateur --- 
    const response = await fetch("php/update_user_data.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    // --- Mise à jour des préférences --- 
    const preferencesData = {
      id_utilisateur: currentUserId,
      fumeur: smokerCheckbox.checked ? 1 : 0,
      animal:animalCheckbox.checked ? 1 : 0,
      preferences_personnalisees: Array.from(customPreferenceList.querySelectorAll('li')).map(
        li => li.firstChild.textContent
      ),
    };

    try {
      const prefResponse = await fetch("php/update_user_preferences.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencesData),
      });

      const prefResult = await prefResponse.json();
      if (prefResult.success) {
        console.log("Succès" + prefResult.message);
      } else {
        console.error("! " + (prefResult.error || "Erreur lors de la mise à jour des préférences."));
      }
    } catch (err) {
      console.error("Erreur réseau lors de la mise à jour des préférences :", err);
    }

    if (result.success) {
      alert("Données mises à jour avec succès !");
    } else {
      alert ("Erreur" + (result.error || "Erreur lors de la mise à jour."));
    }

  } catch (err) {
    console.error("Erreur réseau :", err);
    alert("Impossible d'enregistrer les données (connexion perdue).");
  }
});  


// SAISIR UN VOYAGE 

document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments du DOM
  const tripForm = document.getElementById("trip-form");
  const addVehicleCheckbox = document.getElementById("addVehicle");
  const redirectMsg = document.getElementById("redirect-add-vehicle");
  const btnGoVehicle = document.getElementById("btnGoVehicle");
  const confirmMsg = document.getElementById("confirm-message");

  if (!tripForm) {
    console.error("Formulaire introuvable !");
    return;
  }

  // ---- Gérer la redirection vers la section véhicule ---- 

  addVehicleCheckbox.addEventListener("change", () => {
    if (addVehicleCheckbox.checked) {
      redirectMsg.classList.remove("hidden");
    } else {
      redirectMsg.classList.add("hidden");
    }
  });

  btnGoVehicle.addEventListener("click", () => {
    const vehicleSection = document.querySelector(".vehicles");
    if (vehicleSection) {
      vehicleSection.scrollIntoView({ behavior: "smooth" });
    }
    // On décoche la case pour éviter les conflits
    addVehicleCheckbox.checked = false;
    redirectMsg.classList.add("hidden");
  });

  // ---- Soumission du formulaire de trajet ----
  tripForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Formulaire soumis !");

    // Récupération des données saisies
    const newTrip = {
      departureCity: document.getElementById("departure").value.trim(),
      arrivalCity: document.getElementById("arrival").value.trim(),
      departureDate: document.getElementById("dateDeparture").value,
      departureTime: document.getElementById("timeDeparture").value,
      seats: Number.parseInt(document.getElementById("seats").value),
      price: Number.parseFloat(document.getElementById("price").value),
      vehicle: document.getElementById("vehicle").value,
      id_chauffeur: localStorage.getItem("currentUserId") || "1", // temporaire
      id: Date.now(), // id unique
      statut: "à venir"
    };

    // Vérification des champs obligatoires
    if (
      !newTrip.departureCity ||
      !newTrip.arrivalCity ||
      !newTrip.departureDate ||
      !newTrip.departureTime ||
      !newTrip.vehicle
    ) {
      alert(" Veuillez remplir tous les champs avant de publier votre trajet.");
      return;
    }

    console.log("Données envoyées", newTrip);

    try {
      const response = await fetch("http://localhost/EcoRide_Project/php/add_trip.php", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newTrip),
      });

      const result = await response.json();
      console.log("Réponse du serveur :", result);

      if (result.success) {

        // retirer 2 crédits en BDD 
        await fetch("php/update_credits.php", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({ id_utilisateur: localStorage.getItem("currentUserId") })
        });

        // Recharger les informations utilisateur pour afficher les crédits mis à jour 
        loadUserFromDatabase();

        // Recharger les covoiturages 
        await displayUserTrips();

        confirmMsg.classList.remove("hidden");
        confirmMsg.scrollIntoView({ behavior: "smooth"});
        setTimeout(() => confirmMsg.classList.add("hidden"), 3000);
        tripForm.reset();
      } else {
        alert(result.error || "Erreur lors de l'ajout du trajet.");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Impossible d'enregistrer le trajet (erreur de connexion).");
    }
  });
})

  // --- AFFICHAGE DES TRAJETS A VALIDER (PASSAGER) ---

  async function displayPendingTrips() {
    const container = document.getElementById("pending-trips");
    if (!container) return;

    const currentUserId = localStorage.getItem("currentUserId"); 

    const response = await fetch("php/get_pending_trips.php?id_utilisateur=" + currentUserId);
    const trips = await response.json();

    container.innerHTML = "<h2>Trajets à valider</h2>";

    if (!trips.length) {
      container.innerHTML += "<p>Aucun trajet en attente de validation.</p>";
      return;
    }

    for(const trip of trips) {
      const card = document.createElement("div");
      card.classList.add("pending-card");

      card.innerHTML = `
        <h3>${trip.lieu_depart} -> ${trip.lieu_arrivee}</h3>
        <p>Date : ${formatDate(trip.date_depart)} à ${formatTime(trip.heure_depart)}</p>
        <p>Chauffeur : ${trip.chauffeur_prenom} ${trip.chauffeur_nom}</p>

        <button class="btn-ok">Tout s'est bien passé</button>
        <button class="btn-ko">Problème rencontré</button>

        <div class="feedback hidden">
          <textarea rows="2" placeholder="Décrivez le problème..."></textarea>
          <button class="btn-send">Envoyer</button>
        </div>
      `;

      // Bouton ok (note)
      card.querySelector(".btn-ok").addEventListener("click",() => handleValidateOK(trip));


      // Bouton KO (commentaire)
      card.querySelector(".btn-ko").addEventListener("click", () => {
        card.querySelector(".feedback").classList.remove("hidden");
      });

      // --- Bouton "Laisser un avis" --- 
      if(postReview(trip)) {
        
        const btnAvis = document.createElement("button");
        btnAvis.classList.add("btn-primary");
        btnAvis.textContent = "Laisser un avis";

        btnAvis.addEventListener("click", () => {
          globalThis.location.href = `leave-review.html?id_trajet=${trip.id_covoiturage}`;
        });

        card.appendChild(btnAvis);
      }

      // Bouton envoyer commentaire 
      card.querySelector(".btn-send").addEventListener("click", () => handleValidateKO(trip, card));

      container.appendChild(card);
    };
  }

  async function handleValidateOK(trip) {
    const rating = Number(prompt("Notez le chauffuer (1 à 5) :"));
    if (!rating || rating < 1 || rating >5) {
      alert("Note invalide.");
      return;
    }

    const comment = prompt("Souhaitez-vous laisser un commentaire ?") || "";

    await fetch("php/validate_trip_ok.php", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({
          id_utilisateur: localStorage.getItem("currentUserId"),
          id_trajet: trip.id_covoiturage,
          id_chauffeur: trip.id_chauffeur,
          note: rating,
          commentaire: comment
      })
    });

    displayPendingTrips();
  }

  async function handleValidateKO(trip, card) {
    const comment = card.querySelector("textarea").value.trim();
    if (!comment) {
      alert("Veuillez décrire le problème.");
      return;
    }

    await fetch("php/validate_trip_ko.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_utilisateur: localStorage.getItem("currentUserId"),
        id_trajet: trip.id_covoiturage,
        commentaire: comment
      })
    });

    displayPendingTrips();
  }
      

  // Fontion mise à jour du crédit chauffeur 
  function updateDriverCredits(driverId) {
    const userCredits = JSON.parse(localStorage.getItem("userCredits")) || {};

    // Si le chauffeur n'a pas encore de crédit, on initialise 
    if (!userCredits[driverId]) userCredits[driverId] = 0;

    // on ajoute +5 crédits pour chaque trajet validé 
    userCredits[driverId] +=5;

    // Sauvegarde 
    localStorage.setItem("userCredits", JSON.stringify(userCredits));

    alert(`Crédits du chauffeur ${driverId} mis à jour : +5 points`);
  }

  // Charger à l'ouverture 
  document.addEventListener("DOMContentLoaded", displayPendingTrips);

/* --- Affichage des covoiturages (chauffeur + passager) --- */ 
async function displayUserTrips() {
  const container = document.getElementById("userTripsList");
  if (!container) return;

  container.innerHTML = "<p>Chargement...</p>";

  const userId = localStorage.getItem("currentUserId");

  // Récupération des trajets depuis la BDD
  const response = await fetch("php/get_user_trips.php?id_utilisateur=" + userId);
  let trips = await response.json();

  // on supprime les covoiturages terminés de la page user-space 
  trips = trips.filter(t => t.statut_covoiturage !== "termine");

  container.innerHTML = ""; // nettoyage

  if (!trips.length) {
    container.innerHTML = `<p>Aucun covoiturage trouvé.</p>`;
    return;
  }

  for (const ride of trips) {

    // --- Statut --- 
    let status = (ride.statut_covoiturage || "").trim().toLowerCase(); // Nettoyage sécurité
    let statusLabel = "";
    switch (status) {
      case "a_venir":
        statusLabel = '<span class="status upcoming">À venir</span>';
        break;
      case "en_cours":
        statusLabel = '<span class="status ongoing">En cours</span>';
        break;
      case "annule":
        statusLabel = '<span class="status canceled">Annulé</span>';
        break;
      case "termine":
        statusLabel = '<span class="status ended">Terminé</span>';
        break;
      default:
        console.warn("Statut inconnu :", status);
        statusLabel = '<span class="status ended">Terminé</span>';
    }      

    // --- Boutons selons rôle --- 
    let actionButtons = "";

    // Chauffeur -> bouton démarrer / terminer / annuler si "à venir"
    if (ride.role === "chauffeur") {
      if (ride.statut_covoiturage === "a_venir") {
        actionButtons = `
          <button class="btn btn-start" onclick="startTrip(${ride.id_covoiturage})">
            Démarrer
          </button>
          <button class="btn btn-cancel" onclick="cancelRideDriver(${ride.id_covoiturage})">
            Annuler le covoiturage
          </button>
        `;
      }
      else if (ride.statut_covoiturage === "en_cours") {
        actionButtons = `
          <button class="btn btn-end" onclick="endTrip(${ride.id_covoiturage})">
            Arrivée à destination
          </button>  
        `;
      }
    }

    // Passager -> bouton Annuler si "à venir"
    if (ride.role === "passager" && ride.statut_covoiturage === "a_venir") {
        actionButtons = `
          <button class="btn btn-cancel" onclick="cancelRidePassenger(${ride.id_covoiturage})">
            Annuler ma réservation
          </button>
        `;
      }

      // Carte HTML 
      const card = document.createElement("div");
      card.classList.add("ride-card");

      card.innerHTML = `
        <div class="ride-header">
          <h3>${ride.lieu_depart} -> ${ride.lieu_arrivee}</h3>
          <span class="user-role-trip">${ride.role}</span>
        </div>
        
        <div class="ride-info">
          <p><strong>Statut :</strong> ${statusLabel}</p>
          <p><strong>Date :</strong> ${formatDate(ride.date_depart)} à ${formatTime(ride.heure_depart)}</p>
          <p><strong>Véhicule :</strong> ${ride.marque} ${ride.modele} (${ride.couleur})</p>
          <p><strong>Places restantes :</strong> ${ride.nb_places}</p>
        </div>
        
        <div class="ride-actions">
          ${actionButtons}
        </div>  
      `;

      container.appendChild(card);
  }
}  

async function startTrip(id_covoiturage) {
    const response = await fetch("php/start_trip.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id_covoiturage })
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    alert("Trajet démarré !");
    displayUserTrips();
}

async function endTrip(id_covoiturage) {
    const response = await fetch("php/end_trip.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id_covoiturage })
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    alert("Trajet terminé !");
    console.log("Envoi des mails :", result.emails);
    
    displayUserTrips();
}

async function cancelRidePassenger(id_covoiturage) {
    const currentUserId = localStorage.getItem("currentUserId");

    const response = await fetch("php/cancel_passenger.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_utilisateur: currentUserId,
            id_trajet: id_covoiturage
        })
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    alert("Votre réservation a été annulée.");
    displayUserTrips();
}

async function cancelRideDriver(id_covoiturage) {
    const response = await fetch("php/cancel_driver.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_trajet: id_covoiturage
        })
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    alert("Covoiturage annulé.");
    displayUserTrips();
}
