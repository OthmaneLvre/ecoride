<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

$id_user = $_GET['id_utilisateur'] ?? null;

if (!$id_user) {
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
            covoiturage.statut_covoiturage,
            covoiturage.nb_places,
            voiture.modele,
            voiture.couleur,
            marque.libelle AS marque,

            CASE
                WHEN covoiturage.id_chauffeur = :id THEN 'chauffeur'
                ELSE 'passager'
            END AS role

        FROM covoiturage
        INNER JOIN voiture ON voiture.id_voiture = covoiturage.id_voiture
        INNER JOIN marque ON marque.id_marque = voiture.id_marque

        LEFT JOIN participe
          ON participe.id_covoiturage = covoiturage.id_covoiturage
          AND participe.id_utilisateur = :id

        WHERE covoiturage.id_chauffeur = :id
           OR participe.id_utilisateur = :id
           
        ORDER BY covoiturage.date_depart DESC, covoiturage.heure_depart DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $id_user]);

    $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($trips);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
