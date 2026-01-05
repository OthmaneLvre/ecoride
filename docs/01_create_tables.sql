-- ==================================================
-- 01_create_tables.sql
-- Création de la base de données EcoRide
-- ==================================================

CREATE TABLE utilisateur (
  id_utilisateur INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  prenom VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  credits INT DEFAULT 20,
  statut ENUM('actif','suspendu') DEFAULT 'actif',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role (
  id_role INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE utilisateur_role (
  id_utilisateur INT UNSIGNED NOT NULL,
  id_role INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_utilisateur, id_role),
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur),
  FOREIGN KEY (id_role) REFERENCES role(id_role)
);

CREATE TABLE covoiturage (
  id_covoiturage INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_chauffeur INT UNSIGNED NOT NULL,
  date_depart DATE NOT NULL,
  heure_depart TIME NOT NULL,
  lieu_depart VARCHAR(90) NOT NULL,
  lieu_arrivee VARCHAR(90) NOT NULL,
  nb_places INT NOT NULL,
  prix_personne FLOAT NOT NULL,
  FOREIGN KEY (id_chauffeur) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE participe (
  id_utilisateur INT UNSIGNED NOT NULL,
  id_covoiturage INT UNSIGNED NOT NULL,
  date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_utilisateur, id_covoiturage),
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur),
  FOREIGN KEY (id_covoiturage) REFERENCES covoiturage(id_covoiturage)
);
