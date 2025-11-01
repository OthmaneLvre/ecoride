// ---- USER-SPACE.JS ---- 


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
        reader.onload = function(event) {
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

  // Suppression du véhicule 
  vehicleCard.querySelector('.remove-vehicle').addEventListener('click', () => {
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
    for (const v of saved.vehicles) {
      const vehicleCard = document.createElement('div');
      vehicleCard.classList.add('vehicle-card');

      vehicleCard.innerHTML = `
        <input type="text" placeholder="Marque" class="brand" value="${v.brand}">
        <input type="text" placeholder="Modèle" class="model" value="${v.model}">
        <input type="text" placeholder="Couleur" class="color" value="${v.color}">
        <input type="text" placeholder="Plaque d'immatriculation" class="plate" value="${v.plate}">
        <input type="date" class="registrationDate" value="${v.registrationDate}">
        <input type="number" min="1" max="7" placeholder="Places dispo" class="seats" value="${v.seats}">
        <button class="remove-vehicle btn">Supprimer</button>
      `;

      vehicleCard.querySelector('.remove-vehicle').addEventListener('click', () => {
        vehicleCard.remove();
      });

      vehicleList.appendChild(vehicleCard);
    }
  }

  // Charger préférences
  smokerCheckbox.checked = saved.preferences.smoker;
  animalCheckbox.checked = saved.preferences.animal;

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
