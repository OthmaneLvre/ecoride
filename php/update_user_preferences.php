<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Lecture du JSON envoyé
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_utilisateur'])) {

    addLog("preferences_update_failed", "ID utilisateur manquant lors de la mise à jour des préférences");

    echo json_encode([
        "success"   => false,
        "error"     => "ID utilisateur manquant"
    ]);
    exit;
}

$id_utilisateur = (int)$data['id_utilisateur'];
$fumeur = isset($data['fumeur']) ? intval($data['fumeur']) : 0;
$animal = isset($data['animal']) ? intval($data['animal']) : 0;
$preferences_personnalisees = isset($data['preferences_personnalisees'])
    ? json_encode($data['preferences_personnalisees'], JSON_UNESCAPED_UNICODE)
    : "[]";

try {
    // Vérifie si l'utilisateur a déjà une ligne de préférence
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM preference WHERE id_utilisateur = :id");
    $stmt->execute([':id' => $id_utilisateur]);
    $exists = $stmt->fetchColumn();

    if ($exists) {
        // Mise à jour
        $sql = "UPDATE preference
                SET fumeur = :fumeur, animal = :animal, preferences_personnalisees = :prefs
                WHERE id_utilisateur = :id_utilisateur";
    } else {
        // Insertion
        $sql = "INSERT INTO preference (id_utilisateur, fumeur, animal, preferences_personnalisees)
                VALUES (:id_utilisateur, :fumeur, :animal, :prefs)";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id_utilisateur'       => $id_utilisateur,
        ':fumeur'               => $fumeur,
        ':animal'               => $animal,
        ':prefs'                => $preferences_personnalisees
    ]);

    // LOG Mongo : succès
    addLog($actionType, $actionMsg, [
        "id_utilisateur" => $id_utilisateur,
        "fumeur"         => $fumeur,
        "animal"         => $animal,
        "prefs"          => json_decode($preferences_personnalisees, true)
    ]);

    echo json_encode(["success" => true, "message" => "Préférences mises à jour avec succès."]);

} catch (PDOException $e) {

    // LOG Mongo : erreur SQL
    addLog("preferences_update_error", "Erreur SQL lors de la mise à jour des préférences", [
        "id_utilisateur" => $id_utilisateur,
        "error"          => $e->getMessage()
    ]);

    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
