<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);

$id_utilisateur = $data["id_utilisateur"] ?? null;
$id_trajet      = $data["id_trajet"] ?? null;
$commentaire    = $data["commentaire"] ?? "";

if (!$id_utilisateur || !$id_trajet || !$commentaire) {


    addLog("ride_report_failed", "Paramètres manquants lors du signalement de trajet", [
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet,
        "commentaire"    => $commentaire
    ]);

    echo json_encode(["error" => "Paramètres manquants"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Mettre la participation à "confirmé"
    $stmt = $pdo->prepare("
        UPDATE participe
        SET statut_participation = 'confirmé'
        WHERE id_utilisateur = :id_utilisateur AND id_covoiturage = :id_trajet
    ");
    $stmt->execute([
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet
    ]);

    addLog("ride_participation_confirmed", "Participation confirmée malgré un signalement", [
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet
    ]);

    // 2. Enregistrer le problème dans un avis KO
    $stmt2 = $pdo->prepare("
        INSERT INTO avis (id_utilisateur, id_covoiturage, commentaire, note, statut_avis, date_avis)
        VALUES (:id_utilisateur, :id_covoiturage, :commentaire, NULL, 'signalé', NOW())
    ");
    $stmt2->execute([
        "id_utilisateur" => $id_utilisateur,
        "id_covoiturage" => $id_trajet,
        "commentaire"    => $commentaire
    ]);

    addLog("ride_reported", "Trajet signalé par un utilisateur", [
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet,
        "commentaire"    => $commentaire
    ]);

    $pdo->commit();

    echo json_encode(["success" => true]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) $pdo->rollBack();

    addLog("ride_report_error", "Erreur SQL lors du signalement de trajet", [
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet,
        "error"          => $e->getMessage()
    ]);

    echo json_encode(["error" => $e->getMessage()]);
}
