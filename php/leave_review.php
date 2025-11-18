<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Récupération JSON
$input = json_decode(file_get_contents("php://input"), true);

$id_covoiturage     = $input["id_covoiturage"]
                    ?? $input["id_trajet"]
                    ?? null;
$id_passager        = $input["id_passager"]    ?? null;
$note               = $input["note"]           ?? null;
$commentaire        = $input["commentaire"]    ?? "";
$id_avis            = $input["avis"]           ?? null; 

if (!$id_covoiturage || !$id_passager || !$note) {

    addLog("review_failed", "Champs manquants lors de l'ajout d'un avis", [
        "id_covoiturage" => $id_covoiturage,
        "id_passager"    => $id_passager,
        "note"           => $note
    ]);

    echo json_encode(["error" => "Champs manquants."]);
    exit;
}

try {

    // Vérifier que le passager a bien participé au trajet
    $sql = "
        SELECT * FROM participe
        WHERE id_covoiturage = :covoiturage
        AND id_utilisateur = :user
        AND statut_participation = 'confirmé'
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":covoiturage" => $id_covoiturage,
        ":user"   => $id_passager
    ]);

    $participation = $stmt->fetch();


    if (!$participation) {

        addLog("review_failed", "Le passager n'a pas participé au trajet", [
            "id_covoiturage" => $id_covoiturage,
            "id_passager"    => $id_passager
        ]);

        echo json_encode(["error" => "Vous n'avez pas participé à ce trajet."]);
        exit;
    }


    //  Vérifier s'il existe déjà un avis
    $sql = "
        SELECT id_avis FROM avis
        WHERE id_covoiturage = :covoiturage
        AND id_utilisateur = :user
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":covoiturage" => $id_covoiturage,
        ":user"   => $id_passager
    ]);

    if ($stmt->fetch()) {

        addLog("review_failed", "Avis déjà existant pour ce trajet", [
            "id_covoiturage" => $id_covoiturage,
            "id_passager"    => $id_passager
        ]);

        echo json_encode(["error" => "Vous avez déjà laissé un avis pour ce trajet."]);
        exit;
    }


    // Insérer l'avis
    $sqlInsert = "
        INSERT INTO avis (id_avis, id_covoiturage, id_utilisateur, note, commentaire, date_avis)
        VALUES (:avis, :covoiturage, :user, :note, :commentaire, NOW())
    ";

    $stmt = $pdo->prepare($sqlInsert);
    $stmt->execute([
        ":covoiturage"      => $id_covoiturage,
        ":user"             => $id_passager,
        ":note"             => $note,
        ":commentaire"      => $commentaire,
        ":avis"             =>$id_avis
    ]);

    // LOG → succès
    addLog("review_added", "Avis ajouté avec succès", [
        "id_avis"        => $id_avis,
        "id_covoiturage" => $id_covoiturage,
        "id_passager"    => $id_passager,
        "note"           => $note
    ]);

    echo json_encode(["success" => true]);

} catch (PDOException $e) {

    addLog("review_error", "Erreur SQL lors de l'ajout d'un avis", [
        "id_covoiturage" => $id_covoiturage,
        "id_passager"    => $id_passager,
        "error"          => $e->getMessage()
    ]);
    
    echo json_encode(["error" => $e->getMessage()]);
}

