<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            DATE(created_at) AS jour,
            COUNT(*) AS total
        
        FROM covoiturage
        
        GROUP BY DATE(created_at)

        ORDER BY jour ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $rides = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"       => true,
        "rides"         => $rides
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
