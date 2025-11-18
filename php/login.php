<?php
require_once 'database.php'; // SQL
require_once 'log.php'; // MongoDB
session_start();
header("Content-Type: application/json");

// Récupération des données
$input = json_decode(file_get_contents("php://input"), true);

$email = $input["email"] ?? null;
$password = $input["password"] ?? null;

if (!$email || !$password) {
    echo json_encode(["error" => "missing_fields"]);
    exit;
}

// Vérifier utilisateur
$sql = "SELECT id_utilisateur, nom, prenom, email, mot_de_passe, statut
        FROM utilisateur
        WHERE email = :email";

$stmt = $pdo->prepare($sql);
$stmt->execute([":email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Log : email inconnu
if (!$user) {
    addLog("login_failed", "Tentative de connexion avec un email inconnu", [
        "email" => $email
    ]);

    echo json_encode(["error" => "Identifiant incorrect"]);
    exit;
}

// Vérifier mot de passe
if (!password_verify($password, $user["mot_de_passe"])) {

    // Log : mauvais mot de passe
    addLog("login_failed", "Mot de passe incorrect", [
        "email" => $email,
        "user_id" => $user["id_utilisateur"]
    ]);

    echo json_encode(["error" => "Mot de passe incorrect"]);
    exit;
}

// Vérifier suspension
if ($user["statut"] === "suspendu") {

    // Log : compte suspendu tenté de se connecter
    addLog("login_blocked", "Tentative de connexion sur un compte suspendu", [
        "user_id" => $user["id_utilisateur"],
        "email" => $email
    ]);
    
    echo json_encode(["success" => false, "error" => "Compte suspendu"]);
    exit;
}

// Récupération des rôles du user
$sqlRoles = "
    SELECT role.libelle
    FROM utilisateur_role
    INNER JOIN role ON role.id_role = utilisateur_role.id_role
    WHERE utilisateur_role.id_utilisateur = :id
";
$stmtRoles = $pdo->prepare($sqlRoles);
$stmtRoles->execute([":id" => $user["id_utilisateur"]]);
$rolesArray = $stmtRoles->fetchAll(PDO::FETCH_COLUMN);

// CREATION SESSION
$_SESSION["user_id"] = $user["id_utilisateur"];
$_SESSION["user_name"] = $user["prenom"] . " " . $user["nom"];
$_SESSION["role"] = $rolesArray;

// Envoi au front
echo json_encode([
    "success"           => true,
    "user_id"           => $user["id_utilisateur"],
    "name"              => $user["prenom"] . " " . $user["nom"],
    "roles"         => $rolesArray
]);
