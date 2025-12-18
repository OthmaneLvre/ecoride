<?php
declare(strict_types=1);

require_once __DIR__ . '/../Core/Database.php';

class UserService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Authentifie un utilisateur actif
     */
    public function authenticate(string $email, string $password): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM utilisateur WHERE email = :email AND statut = 'actif'"
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['mot_de_passe'])) {
            return $user;
        }

        return null;
    }

    /**
     * Récupère les rôles d’un utilisateur
     */
    public function getRoles(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT r.libelle
             FROM role r
             INNER JOIN utilisateur_role ur ON r.id_role = ur.id_role
             WHERE ur.id_utilisateur = :id"
        );
        $stmt->execute(['id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
