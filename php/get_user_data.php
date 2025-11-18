<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['id_utilisateur'])) {
    echo json_encode(["error" => "ID utilisateur manquant"]);
    exit;
}

$id_utilisateur = intval($_GET['id_utilisateur']);

try {
    // --- Récupération des infos utilisateur + rôles ---
    $sqlUser = "
        SELECT
            utilisateur.id_utilisateur,
            utilisateur.nom,
            utilisateur.prenom,
            utilisateur.pseudo,
            utilisateur.email,
            utilisateur.telephone,
            utilisateur.adresse,
            utilisateur.date_naissance,
            utilisateur.photo,
            utilisateur.credits,
            GROUP_CONCAT(role.libelle) AS role
        FROM utilisateur
        LEFT JOIN utilisateur_role ON utilisateur.id_utilisateur = utilisateur_role.id_utilisateur
        LEFT JOIN role ON utilisateur_role.id_role = role.id_role
        WHERE utilisateur.id_utilisateur = :id
        GROUP BY utilisateur.id_utilisateur
    ";
    $stmt = $pdo->prepare($sqlUser);
    $stmt->execute([':id' => $id_utilisateur]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["error" => "Utilisateur introuvable"]);
        exit;
    }

    // --- Récupération des préférences ---
    $sqlPref = "
        SELECT fumeur, animal, preferences_personnalisees
        FROM preference
        WHERE id_utilisateur = :id
    ";
    $stmt= $pdo->prepare($sqlPref);
    $stmt->execute([':id' => $id_utilisateur]);
    $prefs = $stmt->fetch(PDO::FETCH_ASSOC);

    $user['preferences']  = $prefs ?: [
        "fumeur" => 0,
        "animal" => 0,
        "preferences_personnalisees" => "[]"
    ];


    echo json_encode($user);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
