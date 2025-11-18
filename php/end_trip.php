<?php
require_once 'database.php';
require_once 'log.php';
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data["id"])) {
    
    addLog("trip_end_failed", "Requête invalide ou ID manquant", [
        "raw" => $raw
    ]);

    echo json_encode(["error" => "Requête invalide ou ID manquant", "raw" => $raw]);
    exit;
}

// Récupération des données envoyées par JS
$data = json_decode(file_get_contents("php://input"), true);
$id_covoiturage = $data["id"] ?? null;

if (!$id_covoiturage) {
    echo json_encode(["error" => "ID trajet manquant"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Mise à jour du statut covoiturage
    $sql = "UPDATE covoiturage
            SET statut_covoiturage = 'termine'
            WHERE id_covoiturage = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["id" => $id_covoiturage]);

    // LOG trajet terminé
    addLog("trip_ended", "Trajet terminé par le chauffeur", [
        "trajet_id" => $id_covoiturage
    ]);

    // 2. Récupération des passagers à prévenir
    $sqlP = "
        SELECT utilisateur.email, utilisateur.prenom, utilisateur.nom
        FROM participe
        JOIN utilisateur ON utilisateur.id_utilisateur = participe.id_utilisateur
        WHERE participe.id_covoiturage = :id
        AND participe.statut_participation = 'en_attente'
    ";
    $stmtP = $pdo->prepare($sqlP);
    $stmtP->execute(["id" =>$id_covoiturage]);
    $passengers = $stmtP->fetchAll(PDO::FETCH_ASSOC);

    // 3. Envoi des mails à chaque passager
    $results = [];

    foreach ($passengers as $p) {
        $to = $p["email"];
        $subject = "EcoRide - Merci pour votre trajet";
        $message = "Bonjour {$p['prenom']} {$p['nom']},\n\n";
        $message .= "Le covoiturage auquel vous avez participé est maintenant terminé.\n";
        $message .= "Merci de vous rendre sur votre espace EcoRide pour le valider.\n\n";
        $message .= "À bientôt sur EcoRide.\n";

        $headers = "From: contact@ecoride.com\r\n";
        $headers .= "Content-Type: text/plain; charset=utf-8\r\n";

        $sent = mail($to, $subject, $message, $headers);

        // LOG par mail
        addLog("trip_end_mail", "Mail envoyé à un passager", [
            "trajet_id" => $id_covoiturage,
            "email"     => $to,
            "sent"      => $sent
        ]);

        $results[] = [
            "email" => $to,
            "sent"  => $sent ? true : false
        ];
    }

    $pdo->commit();

    // LOG global fin du traitement
    addLog("trip_end_complete", "Trajet terminé + mails envoyés", [
        "trajet_id" => $id_covoiturage,
        "emails"    => count($results)
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Trajet terminé, mails envoyés.",
        "emails"  => $results
    ]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) $pdo->rollBack();

    // LOG erreur SQL
    addLog("trip_end_error", "Erreur lors du passage du trajet à 'terminé'", [
        "trajet_id" => $id_covoiturage,
        "error"     => $e->getMessage()
    ]);
    
    echo json_encode(["error" => $e->getMessage()]);
}
