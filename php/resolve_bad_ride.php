<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

$data    = json_decode(file_get_contents("php://input"), true);
$id_avis = $data["id_avis"] ?? null;

if (!$id_avis) {
    echo json_encode(["error" => "id_avis manquant"]);
    exit;
}

try {
    $sql = "
        UPDATE avis
        SET statut_avis = 'resolu'
        WHERE id_avis = :id_avis
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_avis" => $id_avis]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
