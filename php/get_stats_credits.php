<?php
require_once 'database.php';
header('Content-type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            DATE(created_at) AS jour,
            SUM(credits) AS total_credits
        
        FROM covoiturage
        
        WHERE credits IS NOT NULL
        
        GROUP BY DATE(created_at)
        
        ORDER BY jour ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $credits = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "credits" => $credits
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
