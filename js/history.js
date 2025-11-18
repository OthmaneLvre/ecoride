// EcoRide - history.js

// Fonction pour charger les trajets depuis BDD 
async function loadTrips() {
    const userId =localStorage.getItem("currentUserId");

    // On récupère les bons conteneurs HTML 
    const upcomingContainer = document.getElementById("upcomingRides");
    const ongoingContainer = document.getElementById("ongoingRides");
    const pastContainer = document.getElementById("pastRides");
    const canceledContainer = document.getElementById("canceledRides")

    upcomingContainer.innerHTML = "";
    ongoingContainer.innerHTML = "";
    pastContainer.innerHTML = "";
    canceledContainer.innerHTML = "";

    const response = await fetch("php/get_user_trips.php?id_utilisateur=" + userId);
    const trips = await response.json();

    if (!trips.length) {
        upcomingContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        pastContainer.innerHTML = `<p class="no-rides">Aucun covoiturage trouvé.</p>`;
        return;
    }

    // Envoie des trajets à la fonction d'affichage 
    renderRides(trips);
}    

/* --- Rendu des trajets dans les bons conteneurs --- */

function renderRides(trips) {
    const upcomingContainer = document.getElementById("upcomingRides");
    const ongoingContainer = document.getElementById("ongoingRides");
    const pastContainer = document.getElementById("pastRides");
    const canceledContainer = document.getElementById("canceledRides");


    upcomingContainer.innerHTML = "";
    ongoingContainer.innerHTML = "";
    pastContainer.innerHTML = "";
    canceledContainer.innerHTML = "";

    for (const ride of trips) {

        const status = (ride.statut_covoiturage || "").trim();

        /* --- Mapping des status --- */ 
        let statusLabel = "";
        if (status === "a_venir") statusLabel ='<span class="status upcoming">À venir</span>';
        if (status === "en_cours") statusLabel = '<span class="status ongoing">En cours</span>';
        if (status === "termine") statusLabel = '<span class="status ended">Terminé</span>';
        if (status === "annule") statusLabel = '<span class="status canceled">Annulé</span>';

        /* --- Bouton dynamiques --- */
        let actionButton = "";

        // Chauffeur -> démarrer ou terminer 
        if (ride.role === "chauffeur") {
            if (status === "a_venir") {
                actionButton += `<button class="btn btn-start" onclick="startTrip(${ride.id_covoiturage})">Démarrer</button>`;
            } else if (status === "en_cours") {
                actionButton += `<button class="btn btn-end" onclick="endTrip(${ride.id_covoiturage}">Arrivée</button>`;
            }
        }

        // Chauffeur -> Annuler 
        if (ride.role === "chauffeur" && status === "a_venir") {
            actionButton += `
                <button class="btn btn-cancel" onclick="cancelRideDriver(${ride.id_covoiturage})">
                    Annuler le covoiturage
                </button>`;
        }

         // Passager → annuler
        if (ride.role === "passager" && status === "a_venir") {
            actionButton += `
                <button class="btn btn-cancel" onclick="cancelRidePassenger(${ride.id_covoiturage})">
                    Annuler ma réservation
                </button>`;
        }

        /* ----- Création de la carte ----- */
        const card = document.createElement("div");
        card.classList.add("ride-card");

        card.innerHTML = `
            <div class="ride-header">
                <h3>${ride.lieu_depart} -> ${ride.lieu_arrivee}</h3>
                <span class="user-role">${ride.role}</span>
            </div>
            
            <div class="ride-info">
                <p><strong>Statut :</strong> ${statusLabel}</p>
                <p><strong>Date :</strong> ${formatDate(ride.date_depart)} (${formatTime(ride.heure_depart)}</p>
                <p><strong>Véhicule :</strong> ${ride.marque} ${ride.modele} (${ride.couleur})</p>
            </div>    

            <div class="ride-actions">
                ${actionButton}
            </div>    
        `;

        /* --- Tri dans les bons blocs --- */
        if (status === "a_venir") {
            upcomingContainer.appendChild(card);
        }
        else if (status === "en_cours") {
            ongoingContainer.appendChild(card);
        }
        else if (status === "termine") {
            pastContainer.appendChild(card);
        }
        else if (status === "annule") {
            canceledContainer.appendChild(card);
        }
    }
}    

/* --- Bouton démarrer covoiturage --- */
async function startTrip(id) {
    await fetch("php/start_trip.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    loadTrips();
}

/* --- Bouton Arrivée à destination --- */
async function endTrip(id) {
    await fetch("php/end_trip.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    loadTrips();
}

/* --- Annulation (côté passager) --- */
async function cancelRidePassenger(id_covoiturage) {
    
    const currentUserId = localStorage.getItem("currentUserId");

    const response = await fetch("php/cancel_passenger.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_passager: currentUserId,
            id_trajet: id_covoiturage
        })
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    alert("Votre réservation a été annulée.");
    loadTrips();
}

/* ---- Annulation (côté chauffeur) ---- */
async function cancelRideDriver(id_covoiturage) {

    try {
        const response = await fetch("php/cancel_driver.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_trajet: id_covoiturage
            })
        });

        const result = await response.json();

        // Vérification si le serveur renvoie une erreur
        if (result.error) {
            alert(result.error);
            return;
        }

        alert("Covoiturage annulé.");
        loadTrips();

    } catch (err) {
        console.error("Erreur réseau:", err);
        alert("Imposssible d'annuler le trajet");
    }   
}

// Chargement initial 
document.addEventListener("DOMContentLoaded", () => {
    loadTrips();
});

