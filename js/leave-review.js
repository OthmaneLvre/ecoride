
/* --- RÉCUPÉRATION DU TRAJET DANS L’URL --- */
const urlParams = new URLSearchParams(globalThis.location.search);
const id_covoiturage = urlParams.get("id_covoiturage");


//--------------------------------------
// GESTION DES ÉTOILES
//--------------------------------------
let selectedRating = 0;

const stars = document.querySelectorAll(".star-icon");

for(const star of stars) {

    // Hover : colorer jusqu’à l’étoile survolée
    star.addEventListener("mouseover", () => {
        resetStars();
        const rating = Number(star.dataset.value);
        highlightStars(rating);
    });

    // Quitter le hover → revenir à la vraie sélection
    star.addEventListener("mouseleave", () => {
        resetStars();
        if (selectedRating > 0) highlightStars(selectedRating);
    });

    // Clic → sélectionner la note
    star.addEventListener("click", () => {
        selectedRating = Number(star.dataset.value);
        resetStars();
        highlightStars(selectedRating);
    });
};

//Allume les étoiles jusqu'à rating
function highlightStars(rating) {
    for(const img of stars) {
        if (Number(img.dataset.value) <= rating) {
            img.src= "assets/icons/star-full.png";
        }
    };
}

function resetStars() {
    for(const img of stars) { 
        img.src = "assets/icons/star-empty.png";
    };
}    

//--------------------------------------
// ENVOI DU FORMULAIRE
//--------------------------------------
document.getElementById("review-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedRating === 0) {
        alert("Veuillez sélectionner une note.");
        return;
    }

    const commentaire = document.getElementById("commentaire").value.trim();
    const id_passager = localStorage.getItem("currentUserId");

    const data = {
        id_covoiturage: id_covoiturage,
        id_passager: id_passager,
        note: selectedRating,
        commentaire: commentaire
    };

    const response = await fetch("php/leave_review.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    const message = document.getElementById("result-message");

    if (result.success) {
        message.textContent = "Votre avis a été envoyé avec succès !";
        message.style.color = "var(--primary)";

        // Retour automatique après 2 secondes
        setTimeout(() => {
            globalThis.location.href = "user-space.html";
        }, 2000);

    } else {
        message.textContent = "Erreur : " + (result.error || "Impossible d'envoyer l'avis.");
        message.style.color = "red";
    }
});
