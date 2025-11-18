<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data['id_utilisateur']) {

    addLog("credit_update_failed", "ID utilisateur manquant lors de la tentative de retrait de crédits");

    echo json_encode(["error" => "ID utilisateur manquant"]);
    exit;
}

$id = intval($data['id_utilisateur']);

try {
    // retir 2 crédits
    $sql = "UPDATE utilisateur
            SET credits = credits - 2
            WHERE id_utilisateur = :id";


    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);

    // Log Mongo : succès
    addLog("credit_update", "Retrait de 2 crédits effectué", [
        "id_utilisateur" => $id,
        "credits_retrait" => 2
    ]);

    echo json_encode(["success" => true]);

} catch (PDOException $e) {

    // Log Mongo : erreur SQL
    addLog("credit_update_error", "Erreur SQL lors du retrait de crédits", [
        "id_utilisateur" => $id,
        "error" => $e->getMessage()
    ]);
    echo json_encode(["error" => $e->getMessage()]);
}
