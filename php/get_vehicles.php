<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

// Vérifie si on a bien reçu l'id du chauffeur
if (!isset($_GET['id_utilisateur'])) {
    echo json_encode(["error" => "ID chauffeur manquant"]);
    exit;
}

$id_utilisateur = intval($_GET['id_utilisateur']);

try {
    $sql = "SELECT voiture.id_voiture, voiture.modele, voiture.immatriculation, voiture.energie, voiture.couleur,
                   voiture.date_premiere_immatriculation, marque.libelle AS marque
            FROM voiture
            INNER JOIN marque on voiture.id_marque = marque.id_marque
            WHERE voiture.id_utilisateur = :id_utilisateur";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_utilisateur' => $id_utilisateur]);
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($vehicles);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
