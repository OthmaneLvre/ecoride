INSERT INTO role (libelle) VALUES
('admin'),
('chauffeur'),
('passager'),
('employe');

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, pseudo)
VALUES
('Test', 'Admin', 'admin@test.com', 'hash_fictif', 'admin'),
('Test', 'Driver', 'driver@test.com', 'hash_fictif', 'driver'),
('Test', 'Passenger', 'passenger@test.com', 'hash_fictif', 'passenger');
