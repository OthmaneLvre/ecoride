<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Vérifie que toutes les données sont présentes
if (
    empty($_POST['marque']) ||
    empty($_POST['modele']) ||
    empty($_POST['couleur']) ||
    empty($_POST['immatriculation']) ||
    empty($_POST['energie']) ||
    empty($_POST['date_premiere_immatriculation']) ||
    empty($_POST['id_utilisateur'])
) {

    addLog("vehicle_failed", "Champs manquants lors de l'ajout d'un véhicule", [
        "id_utilisateur" => $_POST['id_utilisateur'] ?? null
    ]);

    echo json_encode(["error" => "Tous les champs sont requis."]);
    exit;
}

$marque = intval($_POST['marque']); // ici on attend l'ID de la marque
$modele = trim($_POST['modele']);
$couleur = trim($_POST['couleur']);
$immatriculation = trim($_POST['immatriculation']);
$energie = trim($_POST['energie']);
$datePremiereImmat = trim($_POST['date_premiere_immatriculation']);
$id_utilisateur = intval($_POST['id_utilisateur']);

try {
    // Vérification de doublon avant insertion 
    $check =$pdo->prepare("SELECT COUNT(*) FROM voiture WHERE immatriculation = :immatriculation");
    $check->execute([':immatriculation' => $immatriculation]);
    $exists = $check->fetchColumn();

    if ($exists > 0) {

        addLog("vehicle_failed", "Immatriculation déjà existante", [
            "immatriculation" => $immatriculation,
            "id_utilisateur" => $id_utilisateur
        ]);

        echo json_encode(["error" => "Cette immatriculation existe déjà dans la base de donnée."]);
        exit;
    }

    //Insertion si pas de doublon 
    $sql = "INSERT INTO voiture (modele, immatriculation, energie, couleur, date_premiere_immatriculation, id_utilisateur, id_marque)
            VALUES (:modele, :immatriculation, :energie, :couleur, :date_premiere_immatriculation, :id_utilisateur, :id_marque)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':modele' => $modele,
        ':immatriculation' => $immatriculation,
        ':energie' => $energie,
        ':couleur' => $couleur,
        ':date_premiere_immatriculation' => $datePremiereImmat,
        ':id_utilisateur' => $id_utilisateur,
        ':id_marque' => $marque
    ]);

    // LOG AJOUT RÉUSSI
    addLog("vehicle_added", "Nouveau véhicule ajouté", [
        "id_utilisateur"   => $id_utilisateur,
        "immatriculation"  => $immatriculation,
        "modele"           => $modele,
        "marque_id"        => $marque
    ]);

    echo json_encode(["success" => true, "message" => "Véhicule ajouté avec succès"]);

} catch (PDOException $e) {

    // LOG ERREUR SQL
    addLog("vehicle_error", "Erreur SQL lors de l'ajout du véhicule", [
        "id_utilisateur" => $id_utilisateur,
        "error" => $e->getMessage()
    ]);
    
    echo json_encode(["error" => "Erreur lors de l'ajout : " . $e->getMessage()]);
}
