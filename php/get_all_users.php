<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT
            utilisateur.id_utilisateur,
            utilisateur.nom,
            utilisateur.prenom,
            utilisateur.email,
            utilisateur.statut,
            
            GROUP_CONCAT(role.libelle) AS roles
        
        FROM utilisateur
        
        LEFT JOIN utilisateur_role 
            ON utilisateur.id_utilisateur = utilisateur_role.id_utilisateur
        
        LEFT JOIN role
            ON utilisateur_role.id_role = role.id_role
        
        GROUP BY utilisateur.id_utilisateur
        
        ORDER BY utilisateur.id_utilisateur ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "users" => $users]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}