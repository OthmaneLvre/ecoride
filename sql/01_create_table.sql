-- Base de données EcoRide
CREATE DATABASE IF NOT EXISTS ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ecoride;

-- Table utilisateur
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
    statut ENUM('actif','suspendu') NOT NULL DEFAULT 'actif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table role
CREATE TABLE role (
    id_role INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Table utilisateur_role (relation N-N)
CREATE TABLE utilisateur_role (
    id_utilisateur INT UNSIGNED NOT NULL,
    id_role INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_utilisateur, id_role),
    CONSTRAINT fk_user_role_user FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (id_role)
        REFERENCES role(id_role) ON UPDATE CASCADE
) ENGINE=InnoDB;
