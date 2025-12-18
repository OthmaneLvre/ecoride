<?php
declare(strict_types=1);

require_once __DIR__ . '/../Core/Database.php';

class TripService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Création d’un covoiturage
     */
    public function createTrip(array $data): bool
    {
        $sql = "
            INSERT INTO covoiturage (
                id_chauffeur, id_voiture,
                date_depart, heure_depart, lieu_depart,
                date_arrivee, heure_arrivee, lieu_arrivee,
                nb_places, prix_personne
            ) VALUES (
                :chauffeur, :voiture,
                :date_dep, :heure_dep, :lieu_dep,
                :date_arr, :heure_arr, :lieu_arr,
                :places, :prix
            )
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'chauffeur' => $data['id_chauffeur'],
            'voiture'   => $data['id_voiture'],
            'date_dep'  => $data['date_depart'],
            'heure_dep' => $data['heure_depart'],
            'lieu_dep'  => $data['lieu_depart'],
            'date_arr'  => $data['date_arrivee'],
            'heure_arr' => $data['heure_arrivee'],
            'lieu_arr'  => $data['lieu_arrivee'],
            'places'    => $data['nb_places'],
            'prix'      => $data['prix_personne']
        ]);
    }

    /**
     * Participation à un covoiturage
     */
    public function participate(int $userId, int $tripId): bool
    {
        $stmt = $this->db->prepare(
            "INSERT INTO participe (id_utilisateur, id_covoiturage, statut_participation)
             VALUES (:user, :trip, 'confirmé')"
        );

        return $stmt->execute([
            'user' => $userId,
            'trip' => $tripId
        ]);
    }
}
