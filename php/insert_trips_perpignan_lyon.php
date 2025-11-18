<?php
require_once 'database.php';

try {
    // Insertion de plusieurs trajets Perpignan → Lyon pour tests
    $sql = "
        INSERT INTO covoiturage
        (id_chauffeur, id_voiture, date_depart, heure_depart, lieu_depart,
         date_arrivee, heure_arrivee, lieu_arrivee, nb_places, prix_personne, created_at, updated_at)
        VALUES
        (1, 1, '2025-11-05', '06:00:00', 'Perpignan', '2025-11-05', '12:00:00', 'Lyon', 3, 25.00, NOW(), NOW()),
        (2, 1, '2025-11-05', '08:00:00', 'Perpignan', '2025-11-05', '14:00:00', 'Lyon', 2, 20.00, NOW(), NOW()),
        (3, 1, '2025-11-05', '10:00:00', 'Perpignan', '2025-11-05', '16:00:00', 'Lyon', 4, 30.00, NOW(), NOW()),
        (1, 1, '2025-11-05', '13:00:00', 'Perpignan', '2025-11-05', '19:00:00', 'Lyon', 3, 22.00, NOW(), NOW()),
        (2, 1, '2025-11-05', '15:30:00', 'Perpignan', '2025-11-05', '21:00:00', 'Lyon', 2, 28.00, NOW(), NOW())
    ";

    $pdo->exec($sql);

    echo "✅ 5 trajets Perpignan → Lyon ont été insérés avec succès !";

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage();
}
