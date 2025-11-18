<?php
require_once 'database.php';
require_once 'log.php';
header('Content-type: application/json; charset=utf-8');

$data =json_decode(file_get_contents("php://input"), true);

if (!$data) {

    addLog("trip_creation_failed", "Aucune donnée reçue lors de la création d'un trajet");

    echo json_encode(["error" => "Aucune donnée reçue"]);
    exit;
}

$departureCity = $data['departureCity'] ?? null;
$arrivalCity = $data['arrivalCity'] ?? null;
$departureDate = $data['departureDate'] ?? null;
$departureTime = $data['departureTime'] ?? null;
$seats = (int)($data['seats'] ?? 0);
$price = (float)($data['price'] ?? 0);
$vehicle = $data['vehicle'] ?? null;
$idUser = (int)($data['id_chauffeur'] ?? 0);
$statut = 'a_venir';

$arrivalDate = $departureDate;
$arrivalTime = date('H:i', strtotime(($departureTime ?? '00:00') . ' +1 hour'));


// Vérification minimum des champs
if (!$departureCity || !$arrivalCity || !$departureDate || !$departureTime || !$seats || !$price || !$vehicle || !$idUser) {

    addLog("trip_creation_failed", "Champs manquants", [
        "chauffeur_id" => $idUser,
        "departureCity" => $departureCity,
        "arrivalCity" => $arrivalCity
    ]);

    echo json_encode(["error" => "Champs manquants"]);
    exit;
}

try {

    // --- INSERT DU TRAJET ---
    $sql = "INSERT INTO covoiturage
    (lieu_depart, lieu_arrivee, date_depart, heure_depart, date_arrivee, heure_arrivee, nb_places, prix_personne, id_chauffeur, id_voiture, statut_covoiturage)
    VALUES
    (:lieu_depart, :lieu_arrivee, :date_depart, :heure_depart, :date_arrivee, :heure_arrivee, :nb_places, :prix_personne, :id_chauffeur, :id_voiture, :statut_covoiturage)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':lieu_depart'              => $departureCity,
        ':lieu_arrivee'             => $arrivalCity,
        ':date_depart'              => $departureDate,
        ':heure_depart'             => $departureTime,
        ':date_arrivee'             => $arrivalDate,
        ':heure_arrivee'            => $arrivalTime,
        ':nb_places'                => $seats,
        ':prix_personne'            => $price,
        ':id_chauffeur'             => $idUser,
        ':id_voiture'               => intval($vehicle),
        ':statut_covoiturage'       => $statut
    ]);

    $idTrip = $pdo->lastInsertId();

    // --- LOG: Création réussie
    addLog("trip_creation", "Trajet créé avec succès", [
        "trajet_id"   => $idTrip,
        "chauffeur_id" => $idUser,
        "depart"       => $departureCity,
        "arrivee"      => $arrivalCity,
        "prix"         => $price,
        "places"       => $seats
    ]);    

    // --- DÉDUCTION DES CRÉDITS ---
    $updateCredits = $pdo->prepare("
        UPDATE utilisateur
        SET credits = credits - 2
        WHERE id_utilisateur = :idUser
    ");

    $updateCredits->execute([ ':idUser' => $idUser]);

    // LOG: Déduction crédits
    addLog("credit_update", "Déduction de 2 crédits suite à la création d'un trajet", [
        "chauffeur_id" => $idUser,
        "trajet_id"    => $idTrip
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Trajet ajouté avec succès. 2 crédits ont été retirés."
    ]);

} catch (PDOException $e) {

    // LOG: Erreur SQL
    addLog("trip_creation_error", "Erreur SQL lors de la création du trajet", [
        "chauffeur_id" => $idUser,
        "error"        => $e->getMessage()
    ]);
    
    echo json_encode(["error" => "Erreur lors de l'ajout :" .$e->getMessage()]);
}
