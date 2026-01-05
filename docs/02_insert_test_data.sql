-- ==================================================
-- 02_insert_test_data.sql
-- Données de test EcoRide
-- ==================================================

INSERT INTO role (libelle) VALUES
('passager'),
('chauffeur'),
('employe'),
('admin');

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe)
VALUES
('Test', 'User', 'user@test.com', '$2y$10$HASH'),
('Test', 'Driver', 'driver@test.com', '$2y$10$HASH'),
('Test', 'Admin', 'admin@test.com', '$2y$10$HASH');

INSERT INTO utilisateur_role VALUES
(1, 1),
(2, 2),
(3, 4);
