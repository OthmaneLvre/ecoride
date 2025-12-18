<?php
// ---------- Connexion à la base de données EcoRide ----------

// Détection de l'environnement (Docker ou local)
if (getenv('DOCKER_ENV') === 'true') {
    // Environnement Docker
    $host = 'db';              // Nom du service MySQL dans docker-compose
    $dbname = 'ecoride';
    $username = 'ecoride_user';
    $password = 'ecoride_pass';
} else {
    // Environnement local (XAMPP)
    $host = 'localhost';
    $dbname = 'ecoride';
    $username = 'root';
    $password = '';
}

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données");
}