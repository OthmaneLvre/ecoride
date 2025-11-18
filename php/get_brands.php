<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $stmt = $pdo->query("SELECT id_marque, libelle FROM marque ORDER BY libelle ASC");
    $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($brands);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
