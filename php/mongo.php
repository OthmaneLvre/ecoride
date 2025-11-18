<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {
    // Connexion à MongoDB Atlas
    $client = new Client(
        "mongodb+srv://othmanelvre_user:Qs352GU74JMWXyw0@cluster0.izdlonp.mongodb.net/?appName=Cluster0"
    );

    // Base dédiée aux logs du projet EcoRide
    $mongoDB = $client->ecoride_logs;

} catch (Exception $e) {
    die("Erreur de connexion MonDB : " . $e->getMessage());
}
