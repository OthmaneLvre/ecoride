<?php
require_once 'db_connect.php';
header('Content-Type: text/html; charset=utf-8');

try {
    $sql = "SELECT id_covoiturage, lieu_depart, lieu_arrivee, date_depart, heure_depart, nb_places, prix_personne 
            FROM covoiturage
            ORDER BY id_covoiturage DESC";
    $stmt = $pdo->query($sql);
    $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($trips) > 0) {
        echo "<h2>Liste des covoiturages en base :</h2>";
        echo "<table border='1' cellpadding='8' cellspacing='0'>";
        echo "<tr><th>ID</th><th>Départ</th><th>Arrivée</th><th>Date</th><th>Heure</th><th>Places</th><th>Prix</th></tr>";

        foreach ($trips as $row) {
            echo "<tr>";
            echo "<td>{$row['id_covoiturage']}</td>";
            echo "<td>{$row['lieu_depart']}</td>";
            echo "<td>{$row['lieu_arrivee']}</td>";
            echo "<td>{$row['date_depart']}</td>";
            echo "<td>{$row['heure_depart']}</td>";
            echo "<td>{$row['nb_places']}</td>";
            echo "<td>{$row['prix_personne']}</td>";
            echo "</tr>";
        }

        echo "</table>";
    } else {
        echo "<p>Aucun trajet trouvé dans la base.</p>";
    }
} catch (PDOException $e) {
    echo "<p>Erreur lors de la récupération des trajets : " . $e->getMessage() . "</p>";
}

