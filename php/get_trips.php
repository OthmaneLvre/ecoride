<?php
require_once 'database.php';
header('Content-type: application/json; charset=utf-8');

try {
    // --- Récupération des paramètres depuis l'URL ---
    $from = isset($_GET['from']) ? trim($_GET['from']) : null;
    $to = isset($_GET['to']) ? trim($_GET['to']) : null;
    $date = isset($_GET['date']) ? trim($_GET['date']) : null;

    // --- Construction de la requête de base ---
    $sql = "
        SELECT
            covoiturage.id_covoiturage,
            covoiturage.id_chauffeur,
            covoiturage.id_voiture,
            covoiturage.date_depart,
            covoiturage.heure_depart,
            covoiturage.lieu_depart,
            covoiturage.date_arrivee,
            covoiturage.heure_arrivee,
            covoiturage.lieu_arrivee,
            covoiturage.nb_places,
            covoiturage.prix_personne,
            covoiturage.statut_covoiturage,
            utilisateur.nom AS chauffeur_nom,
            utilisateur.prenom AS chauffeur_prenom
        FROM covoiturage
        INNER JOIN utilisateur
            ON covoiturage.id_chauffeur = utilisateur.id_utilisateur
        WHERE 1=1
    ";

    // --- Ajout des filtres dynamiques ---
    $params = [];

    if ($from) {
        $sql .= " AND LOWER(CONVERT(covoiturage.lieu_depart USING utf8mb4)) LIKE LOWER(CONVERT(:from USING utf8mb4))";
        $params[':from'] = "%$from%";
    }

    if ($to) {
        $sql .= " AND LOWER(CONVERT(covoiturage.lieu_arrivee USING utf8mb4)) LIKE LOWER(CONVERT(:to USING utf8mb4))";
        $params[':to'] = "%$to%";
    }

    $sql .= " ORDER BY covoiturage.date_depart ASC, covoiturage.heure_depart ASC";

    // --- Exécution de la requête préparée ---
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- Réponse JSON
    if ($trips && count($trips) > 0) {
        echo json_encode($trips, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["message" => "Aucun trajet trouvé pour ces critères."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
