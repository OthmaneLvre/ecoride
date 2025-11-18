<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

// Lecture du JSON envoyé 
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_utilisateur']) || !isset($data['role'])) {

    addLog("role_update_failed", "Champs manquants (id_utilisateur ou role)", [
        "data_recue" => $data
    ]);

    echo json_encode(["error" => "Données manquantes (id_utilisateur ou role)."]);
    exit;
}

$id_utilisateur = intval($data['id_utilisateur']);
$role = trim($data['role']);

// Vérifie que les champs sont valide
if ($id_utilisateur <= 0 || $role === '') {

    addLog("role_update_failed", "Valeurs invalides reçues", [
        "id_utilisateur" => $id_utilisateur,
        "role"           => $role
    ]);

    echo json_encode(["error" => "Valeurs invalides reçues."]);
    exit;
}

try {

    // Supprimer l'ancien rôle
    $stmt = $pdo->prepare("DELETE FROM utilisateur_role WHERE id_utilisateur = :id_utilisateur");
    $stmt->execute(['id_utilisateur' => $id_utilisateur]);

    addLog("role_cleared", "Ancien(s) rôle(s) supprimé(s)", [
        "id_utilisateur" => $id_utilisateur
    ]);

    // Gestion des rôles
    if ($role === "les-deux") {

        // Chauffeur = id_role = 1
        // Passager = id_role = 2

        $insert = $pdo->prepare("INSERT INTO utilisateur_role (id_utilisateur, id_role) VALUES (:id, :role)");

        $insert->execute(['id' => $id_utilisateur, 'role' => 1]);
        $insert->execute(['id' => $id_utilisateur, 'role' => 2]);

        addLog("role_updated", "L'utilisateur a désormais les rôles chauffeur + passager", [
            "id_utilisateur" => $id_utilisateur,
            "roles" => ["chauffeur", "passager"]
        ]);

    } else {

        // Vérification de l'ID du rôle
        $stmt = $pdo->prepare("SELECT id_role FROM role WHERE LOWER(libelle) = LOWER(:libelle)");
        $stmt->execute(['libelle' => $role]);
        $roleData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$roleData) {

            addLog("role_update_failed", "Rôle introuvable en base", [
                "id_utilisateur" => $id_utilisateur,
                "role_envoye"    => $role
            ]);

            echo json_encode(["error" => "Rôle non trouvé dans la table role."]);
            exit;
        }

        $id_role = $roleData['id_role'];

        // Ajoute le rôle
        $stmt = $pdo->prepare("INSERT INTO utilisateur_role (id_utilisateur, id_role) 
                                        VALUES (:id_utilisateur, :id_role)");
        $stmt->execute([
            'id_utilisateur' => $id_utilisateur,
            'id_role' => $id_role
        ]);

        addLog("role_updated", "Rôle mis à jour", [
            "id_utilisateur" => $id_utilisateur,
            "nouveau_role"   => $role
        ]);
    }

    echo json_encode(["success" => true, "message" => "Rôle mis à jour avec succès."]);
    exit;

} catch (PDOException $e) {

    addLog("role_update_error", "Erreur SQL lors du changement de rôle", [
        "id_utilisateur" => $id_utilisateur,
        "role"           => $role,
        "error"          => $e->getMessage()
    ]);

    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
