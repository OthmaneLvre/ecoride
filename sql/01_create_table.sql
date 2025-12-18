-- =========================================================
-- Base de données EcoRide
-- Script de création des tables (conception manuelle)
-- =========================================================

CREATE DATABASE IF NOT EXISTS ecoride
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE ecoride;

-- =========================================================
-- TABLE : utilisateur
-- =========================================================
CREATE TABLE utilisateur (
    id_utilisateur INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    adresse VARCHAR(50),
    date_naissance DATE,
    photo LONGBLOB,
    pseudo VARCHAR(50) UNIQUE,
    credits INT DEFAULT 20,
    statut ENUM('actif', 'suspendu') NOT NULL DEFAULT 'actif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : role
-- =========================================================
CREATE TABLE role (
    id_role INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : utilisateur_role (relation N-N)
-- =========================================================
CREATE TABLE utilisateur_role (
    id_utilisateur INT UNSIGNED NOT NULL,
    id_role INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_utilisateur, id_role),
    CONSTRAINT fk_user_role_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role
        FOREIGN KEY (id_role)
        REFERENCES role(id_role)
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : marque
-- =========================================================
CREATE TABLE marque (
    id_marque INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : voiture
-- =========================================================
CREATE TABLE voiture (
    id_voiture INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    modele VARCHAR(50) NOT NULL,
    immatriculation VARCHAR(50) NOT NULL UNIQUE,
    energie VARCHAR(50),
    couleur VARCHAR(50),
    date_premiere_immatriculation DATE,
    id_utilisateur INT UNSIGNED NOT NULL,
    id_marque INT UNSIGNED NOT NULL,
    CONSTRAINT fk_voiture_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_voiture_marque
        FOREIGN KEY (id_marque)
        REFERENCES marque(id_marque)
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : covoiturage
-- =========================================================
CREATE TABLE covoiturage (
    id_covoiturage INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_chauffeur INT UNSIGNED NOT NULL,
    id_voiture INT UNSIGNED NOT NULL,
    date_depart DATE NOT NULL,
    heure_depart TIME NOT NULL,
    lieu_depart VARCHAR(90) NOT NULL,
    date_arrivee DATE NOT NULL,
    heure_arrivee TIME NOT NULL,
    lieu_arrivee VARCHAR(90) NOT NULL,
    nb_places INT UNSIGNED NOT NULL,
    prix_personne FLOAT NOT NULL,
    credits INT NOT NULL DEFAULT 0,
    statut_covoiturage VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_covoiturage_chauffeur
        FOREIGN KEY (id_chauffeur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_covoiturage_voiture
        FOREIGN KEY (id_voiture)
        REFERENCES voiture(id_voiture)
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : participe
-- =========================================================
CREATE TABLE participe (
    id_utilisateur INT UNSIGNED NOT NULL,
    id_covoiturage INT UNSIGNED NOT NULL,
    date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_participation ENUM('en_attente', 'confirmé', 'annulé'),
    PRIMARY KEY (id_utilisateur, id_covoiturage),
    CONSTRAINT fk_participe_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_participe_covoiturage
        FOREIGN KEY (id_covoiturage)
        REFERENCES covoiturage(id_covoiturage)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : avis
-- =========================================================
CREATE TABLE avis (
    id_avis INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT UNSIGNED NOT NULL,
    id_covoiturage INT UNSIGNED NOT NULL,
    commentaire VARCHAR(300),
    note TINYINT UNSIGNED CHECK (note BETWEEN 1 AND 5),
    statut_avis ENUM('en_attente', 'validé', 'refusé', 'resolu'),
    date_avis DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avis_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE,
    CONSTRAINT fk_avis_covoiturage
        FOREIGN KEY (id_covoiturage)
        REFERENCES covoiturage(id_covoiturage)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : preference
-- =========================================================
CREATE TABLE preference (
    id_preference INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT UNSIGNED NOT NULL,
    fumeur TINYINT(1) DEFAULT 0,
    animal TINYINT(1) DEFAULT 0,
    preferences_personnalisees TEXT,
    CONSTRAINT fk_preference_user
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : configuration
-- =========================================================
CREATE TABLE configuration (
    id_configuration INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom_configuration VARCHAR(100) NOT NULL,
    description TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- TABLE : parametre
-- =========================================================
CREATE TABLE parametre (
    id_parametre INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_configuration INT UNSIGNED NOT NULL,
    cle VARCHAR(100) NOT NULL,
    valeur VARCHAR(255),
    CONSTRAINT fk_parametre_configuration
        FOREIGN KEY (id_configuration)
        REFERENCES configuration(id_configuration)
        ON DELETE CASCADE
) ENGINE=InnoDB;
