<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');


$data = json_decode(file_get_contents("php://input"), true);

$id_utilisateur =$data["id_utilisateur"] ?? null; // PASSAGER
$id_trajet = $data["id_trajet"] ?? null;
$id_chauffeur = $data["id_chauffeur"] ?? null;
$rating = $data["note"] ?? null;
$commentaire = $data["commentaire"] ?? "";

if (!$id_utilisateur || !$id_trajet || !$id_chauffeur || !$rating) {

    addLog("ride_validation_failed", "Paramètres manquants pour la validation du trajet", [
        "id_utilisateur" => $id_utilisateur,
        "id_trajet"      => $id_trajet,
        "id_chauffeur"   => $id_chauffeur,
        "note"           => $rating
    ]);

    echo json_encode(["error" => "Paramètres manquants"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Mettre à jour la participation
    $stmt = $pdo->prepare("
        UPDATE participe
        SET statut_participation = 'confirmé'
        WHERE id_utilisateur = :id AND id_covoiturage = :trajet
    ");
    $stmt->execute([
        "id"    => $id_utilisateur,
        "trajet" => $id_trajet
    ]);

    addLog("ride_participation_confirmed", "Participation confirmée", [
        "id_passager" => $id_utilisateur,
        "id_trajet"   => $id_trajet
    ]);
    
    // 2. Créer un avis
    $stmt2 = $pdo->prepare("
        INSERT INTO avis (id_utilisateur, id_covoiturage, commentaire, note, statut_avis, date_avis)
        VALUES (:id_utilisateur, :id_covoiturage, :commentaire, :note, 'en_attente', NOW())
    ");
    $stmt2->execute([
        "id_utilisateur"    => $id_utilisateur,
        "id_covoiturage"    => $id_trajet,
        "commentaire"       => $commentaire,
        "note"             => $rating
    ]);

    addLog("review_submitted", "Avis soumis par le passager (en attente)", [
        "id_passager" => $id_utilisateur,
        "id_trajet"   => $id_trajet,
        "note"        => $rating
    ]);

    // 3. Crédits chauffeur +5
    $stmt3 = $pdo->prepare("
        UPDATE utilisateur
        SET credits = COALESCE(credits, 0) + 5
        WHERE id_utilisateur = :id
    ");
    $stmt3->execute([
        "id" => $id_chauffeur
    ]);

    addLog("credit_update", "Ajout de +5 crédits suite à confirmation du trajet", [
        "id_chauffeur" => $id_chauffeur,
        "id_trajet"    => $id_trajet
    ]);

    $pdo->commit();

    echo json_encode(["success" => true]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) $pdo->rollBack();

    addLog("ride_validation_error", "Erreur SQL lors de la validation de trajet", [
        "id_passager"  => $id_utilisateur,
        "id_trajet"    => $id_trajet,
        "id_chauffeur" => $id_chauffeur,
        "error"        => $e->getMessage()
    ]);

    echo json_encode(["error" => $e->getMessage()]);
}
