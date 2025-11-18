<?php
require_once 'database.php';
require_once 'log.php';

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);

$id_trajet = $data["id_trajet"] ?? null;

if (!$id_trajet) {

    addLog("cancel_failed", "ID trajet manquant lors de l'annulation");
    
    echo json_encode(["error" => "ID trajet manquant"]);
    exit;
}

try {
    // Vérifier le statut du trajet
    $check = $pdo->prepare("SELECT statut_covoiturage FROM covoiturage WHERE id_covoiturage = ?");
    $check->execute([$id_trajet]);
    $statut = $check->fetchColumn();   // <-- ICI on stocke dans $statut

    if ($statut !== 'a_venir') {

        addLog("cancel_rejected", "Annulation refusée : trajet déjà commencé", [
            "trajet_id" => $id_trajet,
            "statut" => $statut
        ]);

        echo json_encode(["error" => "Impossible d'annuler un trajet déjà commencé."]);
        exit;
    }

    // 1. Annuler le covoiturage
    $sql = "UPDATE covoiturage
            SET statut_covoiturage = 'annule'
            WHERE id_covoiturage = :trajet";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":trajet" => $id_trajet]);

    // 2. Annuler toutes les participations
    $sql2 = "UPDATE participe
             SET statut_participation = 'annule'
             WHERE id_covoiturage = :trajet";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([":trajet" => $id_trajet]);

    // LOG DE L’ANNULATION RÉUSSIE
    addLog("cancel_trip", "Covoiturage annulé", [
        "trajet_id" => $id_trajet
    ]);
    
    echo json_encode(["success" => true, "message" => "Covoiturage annulé."]);

} catch (PDOException $e) {

    // LOG ERREUR SQL
    addLog("cancel_error", "Erreur SQL lors de l'annulation du trajet", [
        "trajet_id" => $id_trajet,
        "error" => $e->getMessage()
    ]);

    echo json_encode(["error" => $e->getMessage()]);
}
