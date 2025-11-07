// EcoRide - history.js


function getStatus(ride) {
    if (ride.manualStatus) return ride.manualStatus;

    const now = new Date();

    // Convertir les dates "JJ/MM/AAAA" en format ISO pour Date()
    const [depDay, depMonth, depYear] = ride.departureDate.split("/");
    const [arrDay, arrMonth, arrYear] = ride.arrivalDate.split("/");

    const departure = new Date(`${depYear}-${depMonth.padStart(2, "0")}-${depDay.padStart(2, "0")}T${ride.departureTime}`);
    const arrival = new Date(`${arrYear}-${arrMonth.padStart(2, "0")}-${arrDay.padStart(2, "0")}T${ride.arrivalTime}`);

    if (now < departure) return "a_venir";
    if (now >= departure && now <= arrival) return "en_cours";
    return "termine";
}


// Simule l'utilisateur connecté 
const currentUser = localStorage.getItem("currentUserName") || "Othmane";

// Seclecteurs DOM 
document.addEventListener("DOMContentLoaded", () => {
    const upcomingContainer = document.getElementById("upcomingRides");
    const pastContainer = document.getElementById("pastRides");
    let trips = [];

// Fonction pour charger les trajets depuis le JSON Global 
async function loadTrips() {
    try {
        // Vérification d'une version sauvegardée dans le localStorage 
        const savedTrips = JSON.parse(localStorage.getItem("trips"));
        if (savedTrips && savedTrips.length > 0) {
            const normalizedTrips = savedTrips.map(trip => ({
                ...trip,
                departureCity: trip.departureCity || trip.departure || "",
                arrivalCity: trip.arrivalCity || trip.arrival || "",
                departureDate: trip.departureDate || (trip.date ? trip.date.split("-").reverse().join("/") : ""),
                departureTime: trip.departureTime || trip.time || "",
                carBrand: trip.carBrand || trip.vehicle || "Inconnu",
                carModel: trip.carModel || "",
                manualStatus: trip.manualStatus || "a_venir",
                seats: trip.seats || 1,
                price: trip.price || 0
            }));
            trips = normalizedTrips;

            // Mise à jour du localStoorage
            localStorage.setItem("trips", JSON.stringify(trips));

            console.log("Données récupérées depuis localStorage :", trips);
            renderRides();
            return; // Evite de recharger depuis le fichier JSON  
        }

        const response = await fetch("data/rides.json");
        const rides = await response.json();

        console.log("✅ Données JSON chargées :", rides);
        console.log("🔍 Utilisateur courant :", currentUser);

        // On filtre les trajets où l'utilisateur est chauffeur ou passager 
        trips = rides.filter(
            (ride) =>
            ride.driverName === currentUser ||
            ride.participants?.includes(currentUser)
        );

        console.log("🎯 Trajets trouvés :", trips)

        renderRides(); 
    } catch (error) {
        console.error("Erreur lors du chargement", error);
    }    
}

/* ---- Rendu des trajets ---- */ 

function renderRides() {
    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    if (trips.length === 0) {
        upcomingContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        pastContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        return;
    }

    for (const ride of trips) {
        let status = ride.manualStatus ? ride.manualStatus : getStatus(ride);      

        let statusLabel = "";
        if (status === "a_venir") statusLabel = '<span class="status upcoming">A venir</span>';
        else if (status === "en_cours") statusLabel = '<span class="status ongoing">En cours</span>';
        else statusLabel = '<span class="status ended">Terminé</span>';

        let actionButton = "";
        if (ride.driverName === currentUser) {
            if (status === "a_venir") {
                actionButton = `<button class="btn btn-start" data-id="${ride.id}">Démarrer le covoiturage</button>`;
            } else if (status === "en_cours") {
                actionButton = `<button class="btn btn-end" data-id="${ride.id}">Arrivée à destination</button>`;
            }
        }

        const card = document.createElement("div");
        card.classList.add("ride-card");

        card.innerHTML = `
            <div class="ride-header">
                <h3>${ride.departureCity} -> ${ride.arrivalCity}</h3>
                <span class="user-role">${ride.driverName === currentUser ? "Chauffeur" : "Passager"}</span>
            </div>
            <div class="ride-info">
                <p><strong>Statut :</strong> ${statusLabel}</p>
                <p><strong>Date de départ :</strong> ${ride.departureDate} (${ride.departureTime})</p>
                <p><strong>Véhicule :</strong> ${ride.carBrand} ${ride.carModel}</p>
                <p><strong>Places :</strong> ${ride.seats}</p>
            </div>
            <div class="ride-actions">
                ${actionButton || ""}
                ${
                    status === "a_venir" && ride.driverName !== currentUser
                    ? `<button class="cancel-btn" onclick="cancelRide(${ride.id})">Annuler</button>`
                    : ""
                }
            </div>    
        `;

        if (status === "a_venir" || status === "en_cours") {
            upcomingContainer.appendChild(card);
        } else {
            pastContainer.appendChild(card);
        } 
    }
}

document.addEventListener("click", (e) => {

    // Démarrer le covoiturage 
    if (e.target.classList.contains("btn-start")) {
        const card = e.target.closest(".ride-card");
        const statusSpan = card.querySelector(".status");
        const rideId = Number.parseInt(e.target.dataset.id);

        // Met à jour le texte et la classe 
        statusSpan.textContent = "En cours";
        statusSpan.className = "status ongoing";

        // Change le bouton 
        e.target.textContent = "Arrivée à destination";
        e.target.classList.remove("btn-start");
        e.target.classList.add("btn-end");

        // Sauvegarde du changement dans l'objet local 
        const ride = trips.find(r => r.id === rideId);
        if (ride) ride.manualStatus = "en_cours";

        // Sauvegarde 
        localStorage.setItem("trips", JSON.stringify(trips));

        // Message visuel 
        alert (`Covoiturage #${e.target.dataset.id} démarré`);
    }

    // Arrivée à destination
    else if (e.target.classList.contains("btn-end")) {
        const card = e.target.closest(".ride-card");
        const statusSpan = card.querySelector(".status");
        const rideId = Number.parseInt(e.target.dataset.id);

        // Met à jour le texte et la classe
        statusSpan.textContent = "Terminé";
        statusSpan.className = "status ended";

        // Sauvegarde du changement dans l'objet local 
        const ride = trips.find(r => r.id === rideId);
        if (ride) ride.manualStatus = "terminé";

        // Sauvegarde
        localStorage.setItem("trips", JSON.stringify(trips));

        // Retire le bouton
        e.target.remove();

        // Déplace la carte dans la section "trajets terminés"
        const pastContainer = document.getElementById("pastRides");
        pastContainer.appendChild(card);

        // Message visuel  
        alert(`Covoiturage #${e.target.dataset.id} terminé`);
    }
});

/* ---- Annulation (simulation) ---- */ 

globalThis.cancelRide = function (id, role) {
    const ride = trips.find(r => r.id === id);
    if (!ride) return;


    // Cas chauffeur
    if (ride.driverName === currentUser) {
        alert(`Le covoiturage ${ride.departureCity} -> ${ride.arrivalCity} est annulé pour tous les passagers.`);
        console.log(`Mail envoyé aux participants.`);
    }

    // Cas passager 
    if (role === "passager") {
        alert(`Votre participation au trajet ${ride.departureCity} -> ${ride.arrivalCity} est annulée. Une place est libérée.`);
        console.log(`Crédit remboursé au passager ${currentUser}.`);
    }
    
    // Suppression locale (simulation)
    trips = trips.filter(r => r.id !== id);

    // Sauvegarde temporaire 
    localStorage.setItem("trips", JSON.stringify(trips));

    // Raffraichit l'affichage
    renderRides();
};

// --- Initialisation ---- 
    loadTrips();
});

