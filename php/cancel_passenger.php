<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);

$id_passager = $data["id_passager"] ?? null;
$id_trajet = $data["id_trajet"] ?? null;

// Vérification des paramètres
if (!$id_passager || !$id_trajet) {

    addLog("cancel_passenger_failed", "Paramètres manquants", [
        "id_passager" => $id_passager,
        "id_trajet"   => $id_trajet
    ]);

    echo json_encode(["error" => "Paramètres manquants"]);
    exit;
}

// Vérifier le statut du trajet
$check =$pdo->prepare("SELECT statut_covoiturage FROM covoiturage WHERE id_covoiturage = ?");
$check->execute([$id_trajet]);
$check = $check->fetchColumn();

if ($statut !== 'a_venir') {

    addLog("cancel_passenger_rejected", "Passager tente d'annuler un trajet déjà commencé", [
        "id_passager" => $id_passager,
        "id_trajet"   => $id_trajet,
        "statut"      => $statut
    ]);

    echo json_encode(["error" => "Impossible d'annuler un trajet déjà commencé."]);
    exit;
}

try {
    // 1. Annuler la participation du passager 
    $sql = "UPDATE participe
            SET statut_participation = 'annule'
            WHERE id_utilisateur = :passager AND id_covoiturage = :trajet";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":passager"     => $id_passager,
        ":trajet"       => $id_trajet
    ]);
    
    // 2. +1 place dans le covoiturage
    $sql2 = "UPDATE covoiturage
            SET nb_places = nb_places + 1
            WHERE id_covoiturage = :trajet";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([
        ":trajet" => $id_trajet
    ]);

    // LOG - Annulation réussie
    addLog("cancel_passenger", "Réservation annulée par le passager", [
        "id_passager" => $id_passager,
        "id_trajet"   => $id_trajet
    ]);
    
    echo json_encode(["success" => true, "message" => "Réservation annulée."]);

} catch (PDOException $e) {

    // LOG erreur SQL
    addLog("cancel_passenger_error", "Erreur SQL lors de l'annulation par le passager", [
        "id_passager" => $id_passager,
        "id_trajet"   => $id_trajet,
        "error"       => $e->getMessage()
    ]);

    echo json_encode(["error" => $e->getMessage()]);
}
