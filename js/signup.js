// --- SIGNUP.JS - Création de compte ---- 


// Sélection du formulaire et du message 
const signupForm = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

// Ecoute de la somission du formulaire 
signupForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page 

    // Récupération des valeurs des champs 
    const pseudo = document.getElementById("pseudo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Vérification que tous les champs sont remplis 
    if (!pseudo || !email || !password || !confirmPassword) {
        displayMessage("Veuillez remplir tous les champs.", "error");
        return;
    }

    // Vérification du format de l'email 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        displayMessage("Veuillez saisir une adresse e-mail valide.", "error");
        return;
    }

    // Vérification du mot de passe sécurisé (8 caractéres, 1 majuscule, 1 chiffre, 1 symbole)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        displayMessage("Le mot de passe doit contenir au moins 8 caractère dont 1 majuscule, 1 chiffre et 1 symbole.", "error");
        return;
    }

    // Vérification de la correspondance du mot de passe 
    if (password !== confirmPassword) {
        displayMessage("Les mots de passe ne correspondent pas", "error");
        return;
    }

    // Récupération des utilisateurs existant depuis le local storage 
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Vérification si l'email existe déjà 
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        displayMessage ("Un compte existe déjà avec cet e-mail.", "error");
        return;
    }

    // Création du nouvel utilisateur 
    const newUser = {
        pseudo: pseudo, 
        email: email, 
        password: password,
        credits: 20,
    };

    // Ajout au tableau + sauvegarde 
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Message de succès 
    displayMessage("Compte crée avec succès ! Redirection en cours...", "success");

    // Redirection après 2 secondes vers login.html
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);    
    });

    // Fontion d'affiche de message (succès ou erreur)
    function displayMessage(text, type) {
        message.textContent = text; 
        message.className = "message " + type;
    }
