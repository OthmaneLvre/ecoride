<?php
require_once 'database.php';
header('Content-Type: application/json; charset=utf-8');

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode(["error" => "Aucun ID de trajet fourni."]);
        exit;
    }

    $id_covoiturage = intval($_GET['id']);

    $stmt = $pdo->prepare("
        SELECT
            covoiturage.id_covoiturage,
            covoiturage.date_depart,
            covoiturage.heure_depart,
            covoiturage.lieu_depart,
            covoiturage.date_arrivee,
            covoiturage.heure_arrivee,
            covoiturage.lieu_arrivee,
            covoiturage.nb_places,
            covoiturage.prix_personne,

            utilisateur.id_utilisateur AS chauffeur_id,
            utilisateur.nom AS chauffeur_nom,
            utilisateur.prenom AS chauffeur_prenom,
            utilisateur.photo AS chauffeur_photo,

            voiture.modele,
            voiture.couleur,
            voiture.energie,
            voiture.immatriculation,
            marque.libelle AS marque,

            preference.fumeur,
            preference.animal,
            preference.preferences_personnalisees

        FROM covoiturage
        INNER JOIN utilisateur ON covoiturage.id_chauffeur = utilisateur.id_utilisateur
        LEFT JOIN voiture ON covoiturage.id_voiture = voiture.id_voiture
        LEFT JOIN marque ON voiture.id_marque = marque.id_marque
        LEFT JOIN preference ON preference.id_utilisateur = utilisateur.id_utilisateur

        WHERE covoiturage.id_covoiturage = :id
    ");
    $stmt->execute([":id" => $id_covoiturage]);

    $trajet = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$trajet) {
        echo json_encode(["error" => "Aucun trajet trouvé avec cet ID."]);
        exit;
    }

    echo json_encode($trajet, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(["error" => "Erreur SQL " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => "Erreur inconnue : " . $e->getMessage()]);
}
