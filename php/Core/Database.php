<?php
declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    /**
     * Retourne une instance unique de connexion PDO
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {

            // Détection de l'environnement
            if (getenv('DOCKER_ENV') === 'true') {
                $host = 'db';
                $dbname = 'ecoride';
                $user = 'ecoride_user';
                $pass = 'ecoride_pass';
            } else {
                $host = 'localhost';
                $dbname = 'ecoride';
                $user = 'root';
                $pass = '';
            }

            self::$instance = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        }

        return self::$instance;
    }
}
