<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

$id_utilisateur = $_GET["id_utilisateur"] ?? null;

if (!$id_utilisateur) {
    echo json_encode([]);
    exit;
}

try {
    $sql = "
        SELECT
            covoiturage.id_covoiturage,
            covoiturage.lieu_depart,
            covoiturage.lieu_arrivee,
            covoiturage.date_depart,
            covoiturage.heure_depart,
            covoiturage.date_arrivee,
            covoiturage.heure_arrivee,

            utilisateur.id_utilisateur AS id_chauffeur,
            utilisateur.nom AS chauffeur_nom,
            utilisateur.prenom AS chauffeur_prenom,

            covoiturage.statut_covoiturage

        FROM covoiturage

        INNER JOIN participe
            ON participe.id_covoiturage = covoiturage.id_covoiturage
        
        INNER JOIN utilisateur
            ON utilisateur.id_utilisateur = covoiturage.id_chauffeur
        
        LEFT JOIN avis
            ON avis.id_covoiturage = covoiturage.id_covoiturage
            AND avis.id_utilisateur = participe.id_utilisateur

        WHERE participe.id_utilisateur = :id_utilisateur
            AND participe.statut_participation = 'en_attente'
            AND covoiturage.statut_covoiturage = 'termine'
            AND avis.id_avis IS NULL
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id_utilisateur" => $id_utilisateur]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
