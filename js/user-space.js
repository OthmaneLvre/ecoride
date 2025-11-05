// ---- USER-SPACE.JS ---- 


// --- MISE À JOUR DE LA LISTE DES VÉHICULES ---
function updateVehicleSelect() {
  const select = document.getElementById("vehicle");
  if (!select) return;

  // Vider la liste actuelle
  select.innerHTML = `<option value="">-- Choisissez un véhicule --</option>`;

  // Charger les véhicules depuis le localStorage
  const savedData = JSON.parse(localStorage.getItem("userData")) || {};
  const vehicles = savedData.vehicles || [];

  // Ajouter chaque véhicule dans la liste
  for (const v of vehicles) {
    const option = document.createElement("option");
    option.value = v.plate; // On peut utiliser la plaque comme identifiant unique
    option.textContent = `${v.brand} ${v.model} - ${v.color}`;
    select.appendChild(option);
  }
}

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
const addVehicleBtn = document.getElementById('add-vehicle-btn');
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

for (const input of roleInputs) {
  input.addEventListener('change', () => {
    const selectedRole = input.value;
    localStorage.setItem('userRole', selectedRole);

    // Affiche le bloc chauffeur uniquement si chauffeur ou les-deux
    if (selectedRole === 'chauffeur' || selectedRole === 'les-deux') {
      driverSection.classList.remove('hidden');
    } else {
      driverSection.classList.add('hidden');
    }
  });
}

// Charge le rôle sauvegardé au chargement 
globalThis.addEventListener('DOMContentLoaded', () => {
  const savedRole = localStorage.getItem('userRole');
  if (savedRole) {
    document.querySelector(`input[value="${savedRole}"]`).checked = true;

    if (savedRole === 'chauffeur' || savedRole === 'les-deux') {
      driverSection.classList.remove('hidden');
      loadUserData();
    }
  }
});


// ---- GESTION DES VEHICULES ----

function displayVehicles() {
  vehicleList.innerHTML = "";

  const savedData = JSON.parse(localStorage.getItem("userData")) || {};
  const vehicles = savedData.vehicles || [];

  for (const [index, v] of vehicles.entries()) {
    const vehicleCard = document.createElement("div");
    vehicleCard.classList.add("vehicle-card");

    vehicleCard.innerHTML = `
      <input type="text" class="brand" value="${v.brand}" readonly>
      <input type="text" class="model" value="${v.model}" readonly>
      <input type="text" class="color" value="${v.color}" readonly>
      <input type="text" class="plate" value="${v.plate}" readonly>
      <input type="date" class="registrationDate" value="${v.registrationDate}" readonly>
      <input type="number" class="seats" value="${v.seats}" readonly>
      <button class="remove-vehicle btn">Supprimer</button>
    `;

    // Suppression d'un véhicule 
    vehicleCard.querySelector(".remove-vehicle").addEventListener("click", () => {
      vehicles.splice(index, 1);
      savedData.vehicles = vehicles;
      localStorage.setItem("userData", JSON.stringify(savedData));

      displayVehicles();
      updateVehicleSelect(); // Mise à jour de la liste déroulante
    });

    vehicleList.appendChild(vehicleCard);
  };
}

  // Ajouter un véhicule 
addVehicleBtn.addEventListener('click', () => {
  const vehicleCard = document.createElement('div');
  vehicleCard.classList.add('vehicle-card');

  vehicleCard.innerHTML = `
    <input type="text" placeholder="Marque" class="brand">
    <input type="text" placeholder="Modèle" class="model">
    <input type="text" placeholder="Couleur" class="color">
    <input type="text" placeholder="Plaque d'immatriculation" class="plate">
    <input type="date" class="registrationDate">
    <input type="number" min="1" max="7" placeholder="Places dispo" class="seats">
    <button class="remove-vehicle btn">Supprimer</button>
  `;

  vehicleList.appendChild(vehicleCard);

  // Bouton suppression du véhicule ajouté
  vehicleCard.querySelector(".remove-vehicle").addEventListener("click", () => {
    vehicleCard.remove();
  });
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

saveBtn.addEventListener('click', () => {
  const vehicles = [];

  for (const card of document.querySelectorAll('.vehicle-card')) {
    vehicles.push({
      brand: card.querySelector('.brand').value,
      model: card.querySelector('.model').value,
      color: card.querySelector('.color').value,
      plate: card.querySelector('.plate').value,
      registrationDate: card.querySelector('.registrationDate').value,
      seats: card.querySelector('.seats').value
    });
  }

  const preferences = {
    smoker: smokerCheckbox.checked,
    animal: animalCheckbox.checked,
    custom: Array.from(customPreferenceList.querySelectorAll('li')).map(li => li.firstChild.textContent)
  };

  const personalInfo = {
    lastname: document.getElementById('user-lastname').value,
    firstname: document.getElementById('user-firstname').value,
    birthdate: document.getElementById('user-birthdate').value,
    phone: document.getElementById('user-phone').value,
    address: document.getElementById('user-address').value,
    pseudo: document.getElementById('user-pseudo').value,
    photo: localStorage.getItem('userPhoto') || null
  };

  const userData = {
    personalInfo,
    role: localStorage.getItem('userRole'),
    vehicles,
    preferences
  };

  localStorage.setItem('userData', JSON.stringify(userData));
  loadUserData();
  updateVehicleSelect();

  alert('Vos information ont été enregistrées avec succès !');
});


// ---- CHARGEMENT DES DONNEES ---- 

function loadUserData() {
  const saved = JSON.parse(localStorage.getItem('userData'));
  if (!saved) return;


  //Chargement des infos personnelles 
  if (saved.personalInfo) {
    document.getElementById('user-lastname').value = saved.personalInfo.lastname || '';
    document.getElementById('user-firstname').value = saved.personalInfo.firstname || '';
    document.getElementById('user-birthdate').value = saved.personalInfo.birthdate || '';
    document.getElementById('user-phone').value = saved.personalInfo.phone || '';
    document.getElementById('user-address').value = saved.personalInfo.address || '';
    document.getElementById('user-pseudo').value = saved.personalInfo.pseudo || '';

    if (saved.personalInfo.photo) {
      photoDisplay.src = saved.personalInfo.photo;
      console.log("Photo chargée");
    }
  }


  // Charger véhicules
  if (saved.vehicles) {
    vehicleList.innerHTML = ""; // Vide l'affichage actuel 

    for (const v of saved.vehicles) {
      const vehicleCard = document.createElement('div');
      vehicleCard.classList.add('vehicle-card');

      vehicleCard.innerHTML = `
        <input type="text" placeholder="Marque" class="brand" value="${v.brand}" readonly>
        <input type="text" placeholder="Modèle" class="model" value="${v.model}" readonly>
        <input type="text" placeholder="Couleur" class="color" value="${v.color}" readonly>
        <input type="text" placeholder="Plaque d'immatriculation" class="plate" value="${v.plate}" readonly>
        <input type="date" class="registrationDate" value="${v.registrationDate}" readonly>
        <input type="number" min="1" max="7" placeholder="Places dispo" class="seats" value="${v.seats}" readonly>
        <button class="remove-vehicle btn">Supprimer</button>
      `;

      // Gestion du bouton "Supprimer"
      vehicleCard.querySelector('.remove-vehicle').addEventListener('click', () => {
        const savedData = JSON.parse(localStorage.getItem('userData')) || {};
        const updatedVehicles = savedData.vehicles.filter(x => x.plate !== v.plate);
        savedData.vehicles = updatedVehicles;
        localStorage.setItem('userData', JSON.stringify(savedData));

        loadUserData();
        updateVehicleSelect();
      });

      vehicleList.appendChild(vehicleCard);
    }
  }

  // Charger préférences
  smokerCheckbox.checked = saved.preferences.smoker;
  animalCheckbox.checked = saved.preferences.animal;

  customPreferenceList.innerHTML = "";
  if (saved.preferences.custom) {
    for (const pref of saved.preferences.custom) {
      const li = document.createElement('li');
      li.textContent = pref;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'x';
      removeBtn.classList.add('remove-pref');
      removeBtn.addEventListener('click', () => li.remove());

      li.appendChild(removeBtn);
      customPreferenceList.appendChild(li);
    }
  }
}


// SAISIR UN VOYAGE 

// Récupération des éléments du DOM
const tripForm = document.getElementById("trip-form");
const vehicleSelect = document.getElementById("vehicle");
const addVehicleCheckbox = document.getElementById("addVehicle");
const redirectMsg = document.getElementById("redirect-add-vehicle");
const btnGoVehicle = document.getElementById("btnGoVehicle");
const confirmMsg = document.getElementById("confirm-message");

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

tripForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Récupération des données saisies
  const newTrip = {
    departure: document.getElementById("departure").value.trim(),
    arrival: document.getElementById("arrival").value.trim(),
    date: document.getElementById("dateDeparture").value,
    time: document.getElementById("timeDeparture").value,
    seats: Number.parseInt(document.getElementById("seats").value),
    price: Number.parseFloat(document.getElementById("price").value),
    vehicle: document.getElementById("vehicle").value,
    id_user: localStorage.getItem("currentUserId") || "1", // temporaire
    id: Date.now(), // id unique
  };

  // Vérification des champs obligatoires
  if (
    !newTrip.departure ||
    !newTrip.arrival ||
    !newTrip.date ||
    !newTrip.time ||
    !newTrip.vehicle
  ) {
    alert(" Veuillez remplir tous les champs avant de publier votre trajet.");
    return;
  }

  // Récupération de la liste des trajets déjà enregistrés
  const trips = JSON.parse(localStorage.getItem("trips")) || [];



  // Ajout du nouveau trajet
  newTrip.status = "à venir"; // état initial du trajet 
  trips.push(newTrip);

  // Enregistrement dans le localStorage
  localStorage.setItem("trips", JSON.stringify(trips));

  // Réinitialisation du formulaire
  tripForm.reset();
  vehicleSelect.value = "";

  // Message de confirmation
  confirmMsg.classList.remove("hidden");
  confirmMsg.scrollIntoView({ behavior: "smooth" });

  // Masquer le message après 3 secondes
  setTimeout(() => {
    confirmMsg.classList.add("hidden");
  }, 3000);
});

  // Chargement automatique des données et mise à jour de la liste véhicule
  globalThis.addEventListener("DOMContentLoaded", () => {
  loadUserData();         // charge toutes les infos utilisateur
  updateVehicleSelect();  // met à jour la liste déroulante des véhicules
  });

  // ---- GESTION DEMARRER / ARRETER UN COVOITURAGE ---- 

  // Fonction d'affichage des trajets chauffeur avec boutons dynamiques 
  function displayDriverTrips() {
    const tripsContainer = document.getElementById("driver-trips");
    if (!tripsContainer) return; 

    const trips = JSON.parse(localStorage.getItem("trips")) || [];
    const currentUserId = localStorage.getItem("currentUserId") || "1";

    // Filtrer les trajets créés par le chauffeur connecté 
    const myTrips = trips.filter(t => t.id_user === currentUserId);

    // Nettoyer le conteneur avant affichage 
    tripsContainer.innerHTML = "";

    for(const trip of myTrips) {
      const card = document.createElement("div");
      card.classList.add("ride-card");
      card.dataset.rideId = trip.id;

      card.innerHTML = `
        <div class="ride-info">
          <h3>${trip.departure} -> ${trip.arrival}</h3>
          <p>Date : ${trip.date} à ${trip.time}</p>
          <Places : ${trip.seats} | Prix : ${trip.price} €</p>
          <p>Statut : <span class="ride-status">${trip.status || "à venir"}</span></p>
        </div>
        <div class="ride-actions"></div>
      `;

      const btnContainer = card.querySelector(".ride-actions");
      const statusEl = card.querySelector(".ride-status");

      // Fonction d'affichage des boutons selon le statut
      const updateButton = () => {
        btnContainer.innerHTML = "";
        statusEl.textContent = trip.status;

        if (trip.status === "à venir") {
          const startBtn = document.createElement("button");
          startBtn.textContent = "Démarrer le trajet";
          startBtn.classList.add("btn-start-trip");
          startBtn.addEventListener("click", () => {
            trip.status = "en cours";
            saveTrips(trips);
            updateButton();
          });
          btnContainer.appendChild(startBtn);
        
        } else if (trip.status === "en cours") {
          const stopBtn = document.createElement("button");
          stopBtn.textContent = "Arrivée à destination";
          stopBtn.classList.add("btn-stop-trip");
          stopBtn.addEventListener("click", () => {
            trip.status = "terminé";
            saveTrips(trips);
            updateButton();

            // --- Simulation notification mail ---
            alert("Trajet terminé ! Les passagers reçoivent une notification pour valider le trajet.");

            // Simulation de passagers pour ce trajet
            const participants = trip.participants || ["2", "3"]; // passagers fictifs

            // Récupère ou crée la clé pendingValidations
            const pendingValidations = JSON.parse(localStorage.getItem("pendingValidations")) || {};

            // Ajoute le trajet à valider pour chaque passager
            for(const pid of participants) {
            if (!pendingValidations[pid]) pendingValidations[pid] = [];
            pendingValidations[pid].push({
              tripId: trip.id,
              departure: trip.departure,
              arrival: trip.arrival,
              date: trip.date,
              time: trip.time,
              driverId: trip.id_user
            });
          }

          // Sauvegarde dans le localStorage
          localStorage.setItem("pendingValidations", JSON.stringify(pendingValidations));
        });
        btnContainer.appendChild(stopBtn);

        } else if (trip.status === "terminé") {
          const label = document.createElement("span");
          label.textContent = "Trajet terminé";
          label.classList.add("ride-status", "ended");
          btnContainer.appendChild(label);
        }
      };

      // Lancer le rendu 
      updateButton();

      tripsContainer.appendChild(card);
    };
  }

  // Fonction utilitaire pour sauvegarder les trajets 
  function saveTrips(trips) {
    localStorage.setItem("trips", JSON.stringify(trips));
  }

  // charger les trajets chauffeur au démarrage
  document.addEventListener("DOMContentLoaded", displayDriverTrips);


  // --- AFFICHAGE DES TRAJETS A VALIDER (PASSAGER) ---

  function displayPendingTrips() {
    const container = document.getElementById("pending-trips");
    if (!container) return;

    const currentUserId = localStorage.getItem("currentUserId") || "2"; // simulation passager
    const pendingValidations = JSON.parse(localStorage.getItem("pendingValidations")) || {};

    const myTrips = pendingValidations[currentUserId] || [];

    container.innerHTML = "<h2>Trajets à valider</h2>";

    if (myTrips.length === 0) {
      container.innerHTML += "<p>Aucun trajet en attente de validation.</p>";
      return;
    }

    for(const trip of myTrips) {
      const card = document.createElement("div");
      card.classList.add("pending-card");
      card.innerHTML = `
        <h3>${trip.departure} -> ${trip.arrival}</h3>
        <p>Date : ${trip.date} à ${trip.time}</p>
        <button class="btn-ok">Tout s'est bien passé</button>
        <button class="btn-ko">Problème rencontré</button>
        <div class="feedback hidden">
          <textarea placeholder="Décrivez le problème..." rows="2"></textarea>
          <button class="btn-send">Envoyer</button>
        </div>
      `;

      // Bouton ok 
      card.querySelector(".btn-ok").addEventListener("click",() => {

        // Demande une note 
        const rating = prompt("Merci pour votre trajet ! Donnez une note au chaffeur");

        if (rating && !Number.isNaN(rating) && rating >=1 && rating <= 5) {
          const comment = prompt("Souhaitez-vous laisser un commentaire ? (facultatif)");

          // Récupération du tableau avis 
          const tripReviews = JSON.parse(localStorage.getItem("tripReviews")) || [];

          // Ajout de l'avis 
          tripReviews.push({
            tripId: trip.tripId,
            passengerId: currentUserId,
            driverId: trip.driverId,
            rating: Number(rating),
            comment: comment || "",
            status: "pending" // en attente de validation
          });

          // Sauvegarde dans le localStorage 
          localStorage.setItem("tripReviews", JSON.stringify(tripReviews));

          alert("Merci pour votre avis !");

          // Mise à jour du crédit chauffeur 
          updateDriverCredits(trip.driverId);

          // Suppression du trajet validé 
          removeValidatedTrip(currentUserId, trip.tripId);
          displayPendingTrips();
        } else {
          alert("Veuillez entre une note valide entre 1 et 5.");
        }
      }); 
        
      // Bouton KO 
      card.querySelector(".btn-ko").addEventListener("click", () => {
        card.querySelector(".feedback").classList.remove("hidden");
      });

      // Bouton envoyer commentaire 
      card.querySelector(".btn-send").addEventListener("click", () => {
        const comment = card.querySelector("textarea").value.trim();
        alert("Votre commentaire a été transmis à l'équipe : " + comment);
        removeValidatedTrip(currentUserId, trip.tripId);
        displayPendingTrips();
      });

      container.appendChild(card);
    };
  }

  // Fonction utilitaire : supprimer un trajet validé dans la liste 
  function removeValidatedTrip(userId, tripId) {
    const pendingValidations = JSON.parse(localStorage.getItem("pendingValidations")) || {};
    if (!pendingValidations[userId]) return;
    pendingValidations[userId] = pendingValidations[userId].filter(t => t.tripId !== tripId);
    localStorage.setItem("pendingValidations", JSON.stringify(pendingValidations));
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