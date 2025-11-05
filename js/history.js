// EcoRide - history.js

// Simule l'utilisateur connecté 
const currentUser = "Othmane"; // à remplacer par utilisateur connecté

// Seclecteurs DOM 
document.addEventListener("DOMContentLoaded", () => {
    const upcomingContainer = document.getElementById("upcomingRides");
    const pastContainer = document.getElementById("pastRides");
    let userRides = [];

// Fonction pour charger les trajets depuis le JSON Global 
async function loadUserRides() {
    try {
        const response = await fetch("data/rides.json");
        const rides = await response.json();
        const today = new Date();

        console.log("✅ Données JSON chargées :", rides);
        console.log("🔍 Utilisateur courant :", currentUser);

        // On filtre les trajets où l'utilisateur est chauffeur ou passager 
        userRides = rides.filter(
            (ride) =>
            ride.driverName === currentUser ||
            ride.participants?.includes(currentUser)
        );

        console.log("🎯 Trajets trouvés :", userRides)

        // On ajout un statut dynamique : à venir / terminé 
        userRides = userRides.map(ride => {
            const depDate = new Date(ride.departureDate.split("/").reverse().join("-"));
            return {
                ...ride,
                statut: depDate > today ? "à venir" : "terminé",
                role: ride.driverName === currentUser ? "chauffeur" : "passager"
            };
        });

        renderRides(); 
    } catch (error) {
        console.error("Erreur lors du chargement", error);
    }    
}

/* ---- Rendu des trajets ---- */ 

function renderRides() {
    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    if (userRides.length === 0) {
        upcomingContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        pastContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        return;
    }

    for (const ride of userRides) {
        const card = document.createElement("div");
        card.classList.add("ride-card");

        card.innerHTML = `
            <div class="ride-header">
                <h3>${ride.departureCity} -> ${ride.arrivalCity}</h3>
                <span class="user-role">${ride.role.charAt(0).toUpperCase() + ride.role.slice(1)}</span>
            </div>
            <div class="ride-info">
                <p><strong>Date :</strong> ${ride.departureCity} (${ride.departureTime})</p>
                <p><strong>Véhicule :</strong> ${ride.carBrand} ${ride.carModel}</p>
                <p><strong>Places :</strong> ${ride.seats}</p>
            </div>
            ${
                ride.statut === "à venir"
                    ?`<button class="cancel-btn" onclick="cancelRide(${ride.id})">Annuler</button>`
                    : ""
            }
        `;

        if (ride.statut === "à venir") upcomingContainer.appendChild(card);
        else pastContainer.appendChild(card);
    }
}

/* ---- Annulation (simulation) ---- */ 

globalThis.cancelRide = function (id, role) {
    const ride = userRides.find(r => r.id === id);
    if (!ride) return;


    // Cas chauffeur
    if (ride.role === "chauffeur") {
        alert(`Le covoiturage ${ride.departureCity} -> ${ride.arrivalCity} est annulé pour tous les passagers.`);
        console.log(`Mail envoyé aux participants.`);
    }

    // Cas passager 
    if (role === "passager") {
        alert(`Votre participation au trajet ${ride.departureCity} -> ${ride.arrivalCity} est annulée. Une place est libérée.`);
        console.log(`Crédit remboursé au passager ${currentUser}.`);
    }
    
    // Suppression locale (simulation)
    userRides = userRides.filter(r => r.id !== id);

    // Sauvegarde temporaire 
    localStorage.setItem("userRides", JSON.stringify(userRides));

    // Raffraichit l'affichage
    renderRides();
};

// --- Initialisation ---- 
    loadUserRides();
});