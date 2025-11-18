<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

// --- 1. Récupérer tous les avis en attente ---
$sqlReviews = "
    SELECT
        avis.id_avis,
        avis.commentaire,
        avis.note,
        avis.date_avis,
        utilisateur.prenom AS utilisateur_prenom,
        utilisateur.nom AS utilisateur_nom,
        chauffeur.prenom AS chauffeur_prenom,
        chauffeur.nom AS chauffeur_nom
        
    FROM avis
    INNER JOIN utilisateur ON utilisateur.id_utilisateur = avis.id_utilisateur
    INNER JOIN covoiturage ON covoiturage.id_covoiturage = avis.id_covoiturage
    INNER JOIN utilisateur AS chauffeur ON chauffeur.id_utilisateur = covoiturage.id_chauffeur
    
    WHERE avis.statut_avis = 'en_attente'
    AND avis.note IS NOT NULL
    
    ORDER BY avis.date_avis DESC
";

$stmt = $pdo->query($sqlReviews);
$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

// --- 2. Récupérer les trajets problématiques ---
$sqlBadRides = "
    SELECT
        avis.id_avis,
        avis.id_covoiturage,
        avis.id_utilisateur,
        avis.commentaire,
        avis.date_avis,
        
        utilisateur.nom AS utilisateur_nom,
        utilisateur.prenom AS utilisateur_prenom,

        chauffeur.nom AS chauffeur_nom,
        chauffeur.prenom AS chauffeur_prenom,

        covoiturage.lieu_depart,
        covoiturage.lieu_arrivee,
        covoiturage.date_depart

    FROM avis
    INNER JOIN utilisateur
        ON utilisateur.id_utilisateur = avis.id_utilisateur
    INNER JOIN covoiturage
        ON covoiturage.id_covoiturage = avis.id_covoiturage
    INNER JOIN utilisateur AS chauffeur
        ON chauffeur.id_utilisateur = covoiturage.id_chauffeur

    WHERE avis.note IS NULL
    AND avis.statut_avis = 'en_attente'

    ORDER BY avis.date_avis DESC
";

$stmt2 = $pdo->query($sqlBadRides);
$badRides = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// --- Retour JSON ---
echo json_encode([
    "reviews" => $reviews,
    "badRides" => $badRides
], JSON_UNESCAPED_UNICODE);
