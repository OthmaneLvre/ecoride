<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id_utilisateur"] ?? null;

if (!$id) {

    // Log : ID manquant
    addLog("user_status_change_failed", "ID utilisateur manquant lors de la tentative de changement de statut");

    echo json_encode(["success" => false, "error" => "ID utilisateur manquant"]);
    exit;
}

try {
    // Vérifier l'utilisateur
    $check = $pdo->prepare("SELECT statut FROM utilisateur WHERE id_utilisateur = :id");
    $check->execute(["id" => $id]);

    if ($check->rowCount() === 0) {

        // Log : utilisateur introuvable
        addLog("user_status_change_failed", "Utilisateur introuvable lors du changement de statut", [
            "id_utilisateur" => $id
        ]);

        echo json_encode(["success" => false, "error" => "Utilisateur introuvable"]);
        exit;
    }

    $user = $check->fetch(PDO::FETCH_ASSOC);
    $currentStatus = $user["statut"];

    // Déterminer le ,nouveau statut
    $newStatus = ($currentStatus === "actif") ? "suspendu" : "actif";

    // Mise à jour
    $update = $pdo->prepare("
        UPDATE utilisateur
        SET statut = :newStatus
        WHERE id_utilisateur = :id
    ");

    $update->execute([
        "newStatus" => $newStatus,
        "id"        => $id
    ]);

    // Log : succès
    addLog("user_status_changed", "Changement de statut utilisateur effectué", [
        "id_utilisateur"  => $id,
        "ancien_statut"   => $currentStatus,
        "nouveau_statut"  => $newStatus
    ]);

    // Réponse JSON
    echo json_encode([
        "success"   => true,
        "newStatus" =>  $newStatus
    ]);

} catch (PDOException $e) {

    // Log : erreur SQL
    addLog("user_status_change_error", "Erreur SQL lors du changement de statut utilisateur", [
        "id_utilisateur" => $id,
        "error"          => $e->getMessage()
    ]);

    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
