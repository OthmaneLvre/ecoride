// EcoRide - employee-space.js

document.addEventListener("DOMContentLoaded", () => {
    loadEmployeeTasks();
});

// 1. Récupérer toutes les données depuis la BDD

async function loadEmployeeTasks() {
    try {
        const response = await fetch("php/get_employee_tasks.php");
        const data = await response.json();

        displayPendingReviews(data.reviews);
        displayBadRides(data.badRides);

    } catch (err) {
        console.error("Erreur chargement tâches employé :", err);
    }    
}    

// 2. Affichage des avis en attente (statut_avis = en attente)
function displayPendingReviews(reviews) {
    const container = document.querySelector(".reviews-list");
    container.innerHTML = "";

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `<p class="empty-msg">Aucun avis en attente.</p>`;
        return;
    }

    for(const rev of reviews) {
        const card = document.createElement("div");
        card.classList.add("review-card");

        card.innerHTML = `
            <h3>${rev.utilisateur_prenom} ${rev.utilisateur_nom}</h3>
            <p><strong>Chauffeur :</strong> ${rev.chauffeur_prenom} ${rev.chauffeur_nom}</p>
            <p><strong>Note :</strong> ${rev.note} /5</p>
            <p class="comment">"${rev.commentaire}"</p>

            <div class="actions">
                <button class="btn btn-validate" data-id="${rev.id_avis}">
                    Valider l'avis
                </button>
                <button class="btn btn-refuse" data-id="${rev.id_avis}">
                    Refuser l'avis
                </button>
            </div>
        `;

        container.appendChild(card);
    }


    // Ajout des écouteurs sur les boutons 
    document.querySelectorAll(".btn-validate").forEach((btn) => {
        btn.onclick = () => handleReview(btn.dataset.id, "valide");
    });

    document.querySelectorAll(".btn-refuse").forEach((btn) => {
        btn.onclick = () => handleReview(btn.dataset.id, "refuse");
    });
}

// 3. Valider / Refuser un avis 
async function handleReview(id_avis, decision) {
    try {
        await fetch("php/validate_review.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id_avis, decision })
        });

        loadEmployeeTasks();
    
    } catch (err) {
        console.error("Erreur validation avis :", err);
    } 
} 

// 4. Affichage des covoiturages problématiques (statut_avis = 'en_attente' + note IS NULL)
async function displayBadRides(rides) {
    const container = document.querySelector(".rides-list");
    container.innerHTML = "";

    if (!rides || rides.length === 0) {
        container.innerHTML = `<p class="empty-msg">Aucun covoiturage signalé.</p>`
        return;
    }

    for(const ride of rides) {
        const card = document.createElement("div");
        card.classList.add("ride-card");
        
        card.innerHTML = `
            <h3>Covoiturage #${ride.id_covoiturage}</h3>

            <p><strong>Passager :</strong> ${ride.utilisateur_prenom} (${ride.utilisateur_nom})</p>
            <p><strong>Chauffeur :</strong> ${ride.chauffeur_prenom} (${ride.chauffeur_nom})</p>
            
            <p><strong>Trajet :</strong> ${ride.lieu_depart} -> ${ride.lieu_arrivee}</p>
            <p><strong>Date :</strong> ${ride.date_depart}</p>
            
            <button class="btn btn-validate-ride"
                    data-id="${ride.id_avis}">
                Marquer comme résolu
            </button>
        `;

        container.appendChild(card);
    };

    document.querySelectorAll(".btn-validate-ride").forEach((btn) => {
        btn.onclick = () => handleResolveBadRide(btn.dataset.avis);
    });
}

// 5. Employé valide un avis utilisateur (commentaire + note)
async function validateRide(id_covoiturage, id_utilisateur) {
    try {
        await fetch("php/validate_trip_ok.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_covoiturage: id_covoiturage,
                id_utilisateur: id_utilisateur
            })
        });

        loadEmployeeTasks();

    } catch (err) {
        console.error("Erreur validation trajet :", err);
    }
}

// 6. Employé Confirme que le problème sur covoiturage est résolu 
async function handleResolveBadRide(idAvis) {
    if (!confirm("Confirmer que ce problème est résolu ?")) return;

    try {
        const response = await fetch("php/resolve_bad_ride.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_avis: idAvis}),
        });

        const data = await response.json();
        console.log("Réponse résolution:", data);

        if (data.success) {
            alert("Le covoiturage a été marqué comme résolu.");
            // Rechargement des tâches employé pour mettre à jour les deux listes 
            loadEmployeeTasks();
        } else {
            alert("Erreur côté serveur : " + (data.error || "Inconnue"));
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Impossible de contacter le serveur.");
    }
}