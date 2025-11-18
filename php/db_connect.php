<?php

// ---------- Connexion à la base de données EcoRide ----------

// Information de connexion
$host = 'localhost'; // Serveur local (XAMPP)
$dbname = 'ecoride'; // Nom de la base de donnée
$username = 'root'; // Par défaut avec XAMPP
$password = ''; // Pas de mot de passe par défaut

try {
    // Connexion avec PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

    // Configuration des attributs PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Message facultatif - A commenter ensuite
    // echo "Connexion réussie à la base de données EcoRide";

} catch (PDOException $e) {
    // Gestion des erreurs de connexion
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}
