// LOGIN.JS - Connexion utilisateur --- 

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            return displayMessage("Veuillez remplir tous les champs.", "error");
        }

        // Envoi en JSON
        fetch("php/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Réponse du serveur :", data);

                if (!data.success) {
                    // Gestion des erreurs serveur
                    return displayMessage(data.error || "Identifiants incorrects.", "error");
                }

                // Sauvegarde des infos de session côté navigateur 
                localStorage.setItem("currentUserId", data.user_id);
                localStorage.setItem("currentUserName", data.name);
                localStorage.setItem("currentUserRoles", JSON.stringify(data.roles));

                displayMessage("Connexion réussie ! Redirection en cours...", "success");

                // Redirection selon rôle 
                setTimeout(() => {
                    if (data.roles.includes("admin")) {
                        globalThis.location.href = "admin.html";
                    } else {
                        globalThis.location.href = "user-space.html";
                    }
                }, 1500);
            })
            .catch((err) => {
                console.error("Erreur :", err);
                displayMessage("Erreur de connexion au serveur.", "error");
            });
    });
}

// Fonction pour afficher les messages 
function displayMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}