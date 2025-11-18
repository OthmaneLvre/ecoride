// --- SIGNUP.JS - Création de compte ---- 


// Sélection du formulaire et du message 
const signupForm = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

// Ecoute de la somission du formulaire 
signupForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page 

    // Récupération des valeurs des champs 
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const pseudo = document.getElementById("pseudo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Vérification que tous les champs sont remplis 
    if (!nom || !prenom || !email || !password || !confirmPassword) {
        return displayMessage("Veuillez remplir tous les champs.", "error");
    }

    // Vérification du format de l'email 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return displayMessage("Veuillez saisir une adresse e-mail valide.", "error");
    }

    // Vérification du mot de passe sécurisé (8 caractéres, 1 majuscule, 1 chiffre, 1 symbole)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
         return displayMessage(
            "Le mot de passe doit contenir au moins 8 caractère dont 1 majuscule, 1 chiffre et 1 symbole.", 
            "error"
        );
    }

    // Vérification de la correspondance du mot de passe 
    if (password !== confirmPassword) {
        return displayMessage("Les mots de passe ne correspondent pas", "error");
    }

    // --- Envoi des données vers le backend PHP --- 
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("pseudo", pseudo);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    fetch("php/signup.php", {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Réponse du serveur :", data);

            if (data.status === "ok") {
                displayMessage("Compte créé avec succés ! Redirection en cours...", "success");
                setTimeout(() => {
                    globalThis.location.href = "login.html";
                }, 2000);
            } else {
                displayMessage(data.error || "Une erreur est survenue.", "error");
            }
        })
        .catch((err) => {
            console.error("Erreur de communication :", err);
            displayMessage("Erreur de connexion au serveur.", "error")
        });
});        

    // Fontion d'affiche de message (succès ou erreur)
    function displayMessage(text, type) {
        message.textContent = text; 
        message.className = "message " + type;
    }
