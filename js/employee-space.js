// EcoRide - employee-space.js


// Fonction pour charger un JSON 

async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Erreur de chargement : ${path}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }    
}

// Fonction pour afficher les avis à valider 
async function displayPendingReviews() {
    const container = document.querySelector(".reviews-list");
    const reviews = await loadJSON("data/pendingReviews.json");

    container.innerHTML = "";

    if (reviews.length === 0) {
        container.innerHTML = `<p class="empty-msg">Aucun avis en attente.</p>`;
        return;
    }

    for(const review of reviews) {
        const card = document.createElement("div");
        card.classList.add("review-card");

        card.innerHTML = `
            <div class="review-header">
                <h3>${review.driver}</h3>
                <span class="review-date">${review.date}</span>
            </div>
            <p class="review-note">"${review.note}"</p>
            <p class="review-rating">Note : ${review.rating}/5</p>
            <div class="review-actions">
                <button class="btn btn-validate" data-id="${review.id}">Valider</button>
                <button class="btn btn-refuse" data-id="${review.id}">Refuser</button>
            </div>
        `;

        container.appendChild(card);
    }


    // Ajout des écouteurs sur les boutons 
    document.querySelectorAll(".btn-validate").forEach((btn) => 
        btn.addEventListener("click", (e) => handleValidation(e, true))
    );

    document.querySelectorAll(".btn-refuse").forEach((btn) =>
        btn.addEventListener("click", (e) => handleValidation(e,false))
    );
}

// Fonction pour afficher les covoiturages problématiques 
async function displayBadRides() {
    const container = document.querySelector(".rides-list");
    const rides = await loadJSON("data/badRides.json");

    container.innerHTML = "";

    if (rides.length === 0) {
        container.innerHTML = `<p class="empty-msg">Aucun covoiturage signalé.</p>`
        return;
    }

    for(const ride of rides) {
        const card = document.createElement("div");
        card.classList.add("ride-card");
        
        card.innerHTML = `
            <h3>Covoiturage #${ride.id}</h3>
            <p><strong>Chauffeur :</strong> ${ride.driver.pseudo} (${ride.driver.email})</p>
            <p><strong>Passager :</strong> ${ride.passager.pseudo} (${ride.passager.email})</p>
            <p><strong>Trajet :</strong> ${ride.departure} -> ${ride.arrival}</p>
            <p><strong>Date :</strong> ${ride.dateDeparture} - ${ride.dateArrival}</p>
            <p><strong>Description :</strong> ${ride.description}</p>
            `;

            container.appendChild(card);
    };
}

// Fonction de validation/Refus des avis 
function handleValidation(e,isValid) {
    const id = e.target.dataset.id;
    const action = isValid ? "validé" : "refusé";

    alert(`L'avis #${id} a été ${action}.`);
    e.target.closest(".review-card").remove();
}

// Initialisation au chargement 
document.addEventListener("DOMContentLoaded", () => {
    displayPendingReviews();
    displayBadRides();
});