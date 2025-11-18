<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Vérification
if (!isset($_POST['id_voiture']) || !isset($_POST['id_utilisateur'])) {

    addLog("vehicle_delete_failed", "Paramètres manquants lors de la suppression d'un véhicule", [
        "id_voiture" => $_POST['id_voiture'] ?? null,
        "id_utilisateur" => $_POST['id_utilisateur'] ?? null
    ]);

    echo json_encode(["error" => "Paramètres manquants"]);
    exit;
}

$id_voiture = intval($_POST['id_voiture']);
$id_utilisateur = intval($_POST['id_utilisateur']);

try {
    // On supprime seulement si la voiture appartient au bon utilisateur
    $sql = "DELETE FROM voiture WHERE id_voiture = :id_voiture AND id_utilisateur = :id_utilisateur";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id_voiture' => $id_voiture,
        ':id_utilisateur' => $id_utilisateur
    ]);

    if ($stmt->rowCount() > 0) {

        // LOG : suppression réussie
        addLog("vehicle_deleted", "Véhicule supprimé avec succès", [
            "id_voiture" => $id_voiture,
            "id_utilisateur" => $id_utilisateur
        ]);

        echo json_encode(["success" => true, "message" => "Véhicule supprimé avec succès"]);
    } else {

        // LOG : tentative de suppression non autorisée ou inexistant
        addLog("vehicle_delete_failed", "Tentative de suppression non autorisée ou véhicule inexistant", [
            "id_voiture" => $id_voiture,
            "id_utilisateur" => $id_utilisateur
        ]);

        echo json_encode(["error" => "Aucun véhicule trouvé ou autorisation refusée"]);
    }
} catch (PDOException $e) {
    
    // LOG erreur SQL
    addLog("vehicle_delete_error", "Erreur SQL lors de la suppression du véhicule", [
        "id_voiture" => $id_voiture,
        "id_utilisateur" => $id_utilisateur,
        "error" => $e->getMessage()
    ]);

    echo json_encode(["error" => "Erreur lors de la suppression : " . $e->getMessage()]);
}
