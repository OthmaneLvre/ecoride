<?php
require_once 'database.php'; //SQL
require_once 'log.php'; // MongoDB
header('Content-Type: application/json; charset=utf-8');

try {
    // Récupération et nettoyage des données
    $nom = trim($_POST['nom'] ?? '');
    $prenom = trim($_POST['prenom'] ?? '');
    $pseudo = trim($_POST['pseudo'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $confirm = trim($_POST['confirm_password'] ?? '');

    // Vérification des champs
    if (empty($nom) || empty($prenom) || empty($pseudo) || empty($email) || empty($password) || empty($confirm)) {
       
        addLog("signup_failed", "Champs manquants lors de l'inscription", [
            "email" =>$email
        ]);

        echo json_encode(["error" => "Tous les champs sont obligatoires."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        addLog("signup_failed", "Email invalide", [
            "email" => $email
        ]);

        echo json_encode(["error" => "Adresse mail invalide"]);
        exit;
    }

    if ($password !== $confirm) {
        
        addLog("signup_failed", "Mots de passe non correspondants", [
            "email" => $email
        ]);
        echo json_encode(["error" => "Le mots de passe ne correspondent pas."]);
        exit;
    }

    // Vérifier si l'email existe déjà
    $check = $pdo->prepare("SELECT COUNT(*) FROM utilisateur WHERE email = :email");
    $check->execute([':email' => $email]);

    if ($check->fetchColumn() > 0) {

        addLog("signup_failed", "Tentative d'inscription : email déjà utilisé", [
            "email" => $email
        ]);
        echo json_encode(["error" => "Un compte existe déjà avec cette adresse mail."]);
        exit;
    }

    // Hachage du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insertion dans la BDD
    $stmt = $pdo->prepare("
        INSERT INTO utilisateur (nom, prenom, pseudo, email, mot_de_passe, credits, created_at, updated_at)
        VALUES (:nom, :prenom, :pseudo, :email, :mot_de_passe, :credits, NOW(), NOW())
    ");

    $stmt->execute([
        ':nom'              => $nom,
        ':prenom'           => $prenom,
        ':pseudo'           => $pseudo,
        ':email'            => $email,
        ':mot_de_passe'     => $hashedPassword,
        ':credits'          => 20
    ]);

    echo json_encode(["status" => "ok", "message" => "Inscription réussie ! Vous pouvez maintenant vous connecter."]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
