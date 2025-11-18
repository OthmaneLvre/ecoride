<?php
require_once 'database.php';
require_once 'log.php';
header('Content-type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);

$nom = trim($data["nom"] ?? "");
$prenom = trim($data["prenom"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");

// Vérification des champs
if (!$nom || !$prenom || !$email || !$password) {

    addLog("employee_create_failed", "Champs manquants pour la création d'un employé", [
        "nom" => $nom,
        "prenom" => $prenom,
        "email" => $email
    ]);
    echo json_encode(["success" => false, "error" => "Champs manquants"]);
    exit;
}

try {
    // Vérifier si l'email existe déjà
    $check = $pdo->prepare("SELECT id_utilisateur FROM utilisateur WHERE email = :email");
    $check->execute(["email" => $email]);

    if ($check->rowCount() > 0) {

        addLog("employee_create_failed", "Tentative de création employé avec email existant", [
            "email" => $email
        ]);

        echo json_encode(["success" => false, "error" => "Cet email est déjà utilisé"]);
        exit;
    }

    // HASH MDP
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 1. Insérer utilisateur
    $sql = "
        INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, statut)
        VALUES (:nom, :prenom, :email, :password, 'actif')
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        "nom"       => $nom,
        "prenom"    => $prenom,
        "email"     => $email,
        "password"  => $hashedPassword
    ]);

    // Récupérer l'ID nouvellement créé
    $id_utilisateur = $pdo->lastInsertId();

    // 2. Attribuer le rôle employé (id_role = 6)
    $roleSQL = "
        INSERT INTO utilisateur_role (id_utilisateur, id_role)
        VALUES (:id, 6)
    ";
    $roleStmt = $pdo->prepare($roleSQL);
    $roleStmt->execute(["id" => $id_utilisateur]);

    // ---- LOG : création employé réussie ----
    addLog("employee_created", "Nouvel employé créé avec succès", [
        "id_employe" => $id_utilisateur,
        "email" => $email,
        "nom" => $nom,
        "prenom" => $prenom
    ]);

    echo json_encode(["success" => true]);

} catch (PDOException $e) {

    // ---- LOG ERREUR SQL ----
    addLog("employee_create_error", "Erreur SQL lors de la création d’un employé", [
        "email" => $email,
        "error" => $e->getMessage()
    ]);

    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

