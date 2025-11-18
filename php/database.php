<?php

require_once 'db_connect.php';

// Fonction pour réucpérer tous les utilisateurs
function getAllUsers($pdo) {
    try {
        $sql = "SELECT * FROM utilisateur";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        die("Erreur lors de la récupération des utilisateurs : " . $e->getMessage());
    }
}

/* Fonction pour récupérer les covoiturages */

function getAllTrips($pdo) {
    try {
        $sql = "SELECT * FROM covoiturage";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        die("Erreur lors de la récupération des covoiturages : " . $e->getMessage());
    }
}
