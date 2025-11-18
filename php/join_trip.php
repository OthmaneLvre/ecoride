<?php
require_once 'database.php';
require_once 'log.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

try {
    // --- Vérification de la connexion (SESSION) ---
    if (!isset($_SESSION["user_id"])) {

        addLog("reservation_failed", "Tentative de participation sans connexion");

        echo json_encode(["error" => "not_logged_in"]);
        exit;
    }

    $id_user = $_SESSION["user_id"];
    $id_trip = $_POST['trip_id'] ?? null;

    if (!$id_trip) {

        addLog("reservation_failed", "ID de traejet manquant", [
            "user_id" => $id_user
        ]);

        echo json_encode(["error" => "missing_trip"]);
        exit;
    }

    // --- Vérifie si l'utilisateur participe déjà ---
    $check = $pdo->prepare("
        SELECT COUNT(*)
        FROM participe
        WHERE id_utilisateur = :id_user AND id_covoiturage = :id_trip
    ");
    $check->execute([
        ":id_user" => $id_user,
        ":id_trip" => $id_trip
    ]);

    if ($check->fetchColumn() > 0) {

        addLog("reservation_failed", "Utilisateur déjà inscrit au trajet", [
            "user_id" => $id_user,
            "trajet_id" => $id_trip
        ]);

        echo json_encode(["error" => "already_joined"]);
        exit;
    }

    // --- Vérifie les places restantes ---
    $verify = $pdo->prepare("
        SELECT nb_places
        FROM covoiturage
        WHERE id_covoiturage = :id_trip
    ");
    $verify->execute([":id_trip" => $id_trip]);
    $places = $verify->fetchColumn();

    if ($places <= 0) {

        addLog("reservation_failed", "Aucune place disponible", [
            "user_id" => $id_user,
            "trajet_id" => $id_trip
        ]);

        echo json_encode(["error" => "no_seats"]);
        exit;
    }

    // --- Insertion de la participation ---
    $insert = $pdo->prepare("
        INSERT INTO participe (id_utilisateur, id_covoiturage, statut_participation)
        VALUES (:id_user, :id_trip, 'en_attente')
    ");
    $insert->execute([
        ":id_user" => $id_user,
        ":id_trip" => $id_trip
    ]);

    // --- Mise à jour du nombre de places ---
    $update = $pdo->prepare("
        UPDATE covoiturage
        SET nb_places = nb_places - 1
        WHERE id_covoiturage = :id_trip
    ");
    $update->execute([":id_trip" => $id_trip]);

    // --- Log Participation réussie ---
    addLog("reservation", "Participation enregistrée", [
        "user_id" => $id_user,
        "trajet_id" => $id_trip
    ]);

    echo json_encode([
        "status" => "ok",
        "message" => "Participation enregistrée avec succès !"
    ]);

} catch (Exception $e) {

    // --- LOG Erreur serveur --- 
    addLog("reservation_error", "Erreur lors de l'inscription au trajet", [
        "user_id" => $id_user ?? null,
        "trajet_id" => $id_trip ?? null,
        "error" => $e->getMessage()
    ]);

    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
