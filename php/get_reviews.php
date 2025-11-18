<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

// 1. Vérification présence ID Chauffeur
if (!isset($_GET["id_chauffeur"])) {
    echo json_encode(["error" => "ID chauffeur manquant"]);
    exit;
}

$id = intval($_GET["id_chauffeur"]);

try {

    // 2. Récupération des AVIS validés pour ce chauffeur
    $sqlAvis = "
        SELECT
            avis.note,
            avis.commentaire,
            CONCAT(utilisateur.prenom, ' ', utilisateur.nom) AS auteur

        FROM avis
        -- auteur de l'avis (passager)
        INNER JOIN utilisateur
            ON utilisateur.id_utilisateur = avis.id_utilisateur
        
        -- covoiturage qui permet de retrouver le chauffeur noté
        INNER JOIN covoiturage
            ON covoiturage.id_covoiturage = avis.id_covoiturage

        WHERE covoiturage.id_chauffeur = :id_chauffeur
        
        AND avis.statut_avis = 'validé'

        ORDER BY avis.date_avis DESC
    ";

    $stmtAvis = $pdo->prepare($sqlAvis);
    $stmtAvis->execute(["id_chauffeur" => $id]);
    $avis = $stmtAvis->fetchAll(PDO::FETCH_ASSOC);

    // 3. Calcul de la moyenne (AVG)
    $sqlMoyenne = "
        SELECT AVG(avis.note) AS moyenne
        
        FROM avis
        INNER JOIN covoiturage
            ON covoiturage.id_covoiturage = avis.id_covoiturage
        WHERE covoiturage.id_chauffeur = :id_chauffeur
        AND avis.statut_avis = 'validé'
    ";
    $stmtM = $pdo->prepare($sqlMoyenne);
    $stmtM->execute(["id_chauffeur" => $id]);

    $moyenne = $stmtM->fetch(PDO::FETCH_ASSOC)["moyenne"];

    // 4. Retour JSON complet
    echo json_encode([
        "moyenne" => $moyenne ? floatval($moyenne) : null,
        "avis" => $avis
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
