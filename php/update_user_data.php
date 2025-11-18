<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // Lecture des données JSON envoyées par le front
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || empty($data['id_utilisateur'])) {

        addLog("profile_update_failed", "ID utilisateur manquant ou données invalides", [
            "data_recue" => $data
        ]);

        echo json_encode(["error" => "ID utilisateur manquant ou données invalides."]);
        exit;
    }

    $id = intval($data['id_utilisateur']);
    $nom = trim($data['nom'] ?? '');
    $prenom = trim($data['prenom'] ?? '');
    $pseudo = trim($data['pseudo'] ?? '');
    $telephone = trim($data['telephone'] ?? '');
    $adresse = trim($data['adresse'] ?? '');
    $date_naissance = trim($data['date_naissance'] ?? '');
    $photo = trim($data['photo'] ?? null);

    // --- Mise à jour des infos utilisateur ---
    $sql = "UPDATE utilisateur
            SET
                nom = :nom,
                prenom = :prenom,
                pseudo = :pseudo,
                telephone = :telephone,
                adresse = :adresse,
                date_naissance = :date_naissance,
                photo = :photo,
                updated_at = NOW()
            WHERE id_utilisateur = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom'              => $nom,
        ':prenom'           => $prenom,
        ':pseudo'           => $pseudo,
        ':telephone'        => $telephone,
        ':adresse'          => $adresse,
        ':date_naissance'   => $date_naissance,
        ':photo'            => $photo,
        ':id'               => $id
    ]);

    // LOG : informations utilisateur modifiées
    addLog("profile_updated", "Informations du profil mises à jour", [
        "id_utilisateur" => $id,
        "nom" => $nom,
        "prenom" => $prenom,
        "pseudo" => $pseudo,
        "telephone" => $telephone,
        "adresse" => $adresse
    ]);

    // --- Mise à jour des préférences ---
    if (!empty($data['preference'])) {
        $prefs = $data['preference'];
        $fumeur = intval($prefs['fumeur'] ?? 0);
        $animal = intval($prefs['animal'] ?? 0);
        $personnalisees = json_encode($prefs['preferences_personnalisees'] ?? []);
        
        // Vérifie si l'utilisateur a déjà des préférences
        $check = $pdo->prepare("SELECT id_preference FROM preference WHERE id_utilisateur = ?");
        $check->execute([$id]);
    
        if ($check->rowCount() > 0) {
            $sqlPref = "UPDATE preference
                        SET fumeur = ?, animal = ?, preferences_personnalisees = ?
                        WHERE id_utilisateur = ?";
            $pdo->prepare($sqlPref)->execute([$fumeur, $animal, $personnalisees, $id]);
        
            addLog("preferences_updated", "Préférences mises à jour", [
                "id_utilisateur" => $id,
                "fumeur" => $fumeur,
                "animal" => $animal,
                "preferencse_perso" => json_decode($personnalisees, true)
            ]);

        } else {
            $sqlPref = "INSERT INTO preference (id_utilisateur, fumeur, animal, preferences_personnalisees)
                        VALUES (?, ?, ?, ?)";
            $pdo->prepare($sqlPref)->execute([$id, $fumeur, $animal, $personnalisees]);
        

            addLog("preferences_created", "Préférences créées", [
                "id_utilisateur" => $id,
                "fumeur" => $fumeur,
                "animal" => $animal,
                "pref_perso" => json_decode($personnalisees, true)
            ]);
        }
    }

    echo json_encode(["success" => true, "message" => "Profil mis à jour avec succès."]);

} catch (PDOException $e) {

    addLog("profile_update_error", "Erreur SQL lors de la mise à jour du profil", [
        "id_utilisateur" => $data['id_utilisateur'] ?? null,
        "error" => $e->getMessage()
    ]);
    
    echo json_encode(["error" => "Erreur SQL : " . $e->getMessage()]);
}
