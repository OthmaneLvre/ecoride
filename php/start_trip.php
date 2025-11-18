<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Récupération des données envoyées par JS 
$data =json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? null;

if (!$id) {

    // --- LOG : erreur id manquant ---
    addLog("start_ride_failed", "ID covoiturage manquant");

    echo json_encode(["error" => "Trajet manquant"]);
    exit;

}

try {
    $sql = "UPDATE covoiturage
            SET statut_covoiturage = 'en_cours'
            WHERE id_covoiturage = :id";

    $stmt =$pdo->prepare($sql);
    $stmt->execute(["id" => $id]);

    addLog("start_ride", "Trajet démarré avec succès", [
        "trajet_id" => $id,
        "utilisateur_id" => $userId,
        "endpoint" => "start_ride.php"
    ]);
    
    echo json_encode(["success" => true, "message" => "Trajet démarré"]);
}
catch (PDOException $e) {

        // --- LOG : erreur SQL ---
    addLog("start_ride_error", "Erreur SQL lors du démarrage du trajet", [
        "trajet_id" => $id,
        "error" => $e->getMessage()
    ]);
    
    echo json_encode(["error" => $e->getMessage()]);
}
