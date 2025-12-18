-- =========================================================
-- Jeu de données de test – EcoRide
-- =========================================================

-- ROLES
INSERT INTO role (libelle) VALUES
('admin'),
('chauffeur'),
('passager'),
('employe');

-- UTILISATEURS
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, pseudo)
VALUES
('Admin', 'EcoRide', 'admin@ecoride.test', 'hash_admin', 'admin'),
('Driver', 'EcoRide', 'driver@ecoride.test', 'hash_driver', 'driver'),
('Passenger', 'EcoRide', 'passenger@ecoride.test', 'hash_passenger', 'passenger');

-- ASSOCIATION UTILISATEUR / ROLE
INSERT INTO utilisateur_role (id_utilisateur, id_role) VALUES
(1, 1), -- admin
(2, 2), -- chauffeur
(3, 3); -- passager

-- MARQUES
INSERT INTO marque (libelle) VALUES
('Renault'),
('Peugeot');

-- VOITURE
INSERT INTO voiture (
    modele,
    immatriculation,
    energie,
    couleur,
    id_utilisateur,
    id_marque
) VALUES (
    'Clio',
    'AA-123-BB',
    'Essence',
    'Bleue',
    2,
    1
);

-- COVOITURAGE
INSERT INTO covoiturage (
    id_chauffeur,
    id_voiture,
    date_depart,
    heure_depart,
    lieu_depart,
    date_arrivee,
    heure_arrivee,
    lieu_arrivee,
    nb_places,
    prix_personne
) VALUES (
    2,
    1,
    '2025-12-01',
    '08:00',
    'Perpignan',
    '2025-12-01',
    '09:30',
    'Narbonne',
    3,
    5.00
);

-- PARTICIPATION
INSERT INTO participe (
    id_utilisateur,
    id_covoiturage,
    statut_participation
) VALUES (
    3,
    1,
    'confirmé'
);

-- AVIS
INSERT INTO avis (
    id_utilisateur,
    id_covoiturage,
    commentaire,
    note,
    statut_avis
) VALUES (
    3,
    1,
    'Trajet agréable et ponctuel',
    5,
    'validé'
);
