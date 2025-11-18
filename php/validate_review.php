<?php
require_once "database.php";
header("Content-Type: application/json");

// Récupération
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$decision = $data['decision'] ?? null;

if (!$id || !$decision) {
    echo json_encode(["error" => "Données manquantes"]);
    exit;
}

$sql = "UPDATE avis SET statut_avis = :decision WHERE id_avis = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":decision" => $decision,
    ":id" => $id
]);

echo json_encode(["success" => true]);
