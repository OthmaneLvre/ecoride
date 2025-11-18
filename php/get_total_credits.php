<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            SUM(credits) AS total_credits
        FROM covoiturage
        WHERE credits IS NOT NULL
    ";

    $stmt = $pdo->query($sql);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $total = $result["totalcredits"] ?? 0;

    echo json_encode([
        "success" => true,
        "total_credits" => $total
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
