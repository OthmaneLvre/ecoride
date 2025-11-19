-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 18 nov. 2025 à 23:18
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecoride`
--

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id_avis` int(10) UNSIGNED NOT NULL,
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `id_covoiturage` int(10) UNSIGNED NOT NULL,
  `commentaire` varchar(300) DEFAULT NULL,
  `note` tinyint(3) UNSIGNED DEFAULT NULL CHECK (`note` between 1 and 5),
  `statut_avis` enum('en_attente','validé','refusé','resolu') DEFAULT NULL,
  `date_avis` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `configuration`
--

CREATE TABLE `configuration` (
  `id_configuration` int(10) UNSIGNED NOT NULL,
  `nom_configuration` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `configuration`
--

INSERT INTO `configuration` (`id_configuration`, `nom_configuration`, `description`, `date_creation`) VALUES
(1, 'Configuration générale', 'Paramètres globaux de l’application EcoRide', '2025-10-31 15:48:47');

-- --------------------------------------------------------

--
-- Structure de la table `covoiturage`
--

CREATE TABLE `covoiturage` (
  `id_covoiturage` int(10) UNSIGNED NOT NULL,
  `id_chauffeur` int(10) UNSIGNED NOT NULL,
  `id_voiture` int(10) UNSIGNED NOT NULL,
  `date_depart` date NOT NULL,
  `heure_depart` time NOT NULL,
  `lieu_depart` varchar(90) NOT NULL,
  `date_arrivee` date NOT NULL,
  `heure_arrivee` time NOT NULL,
  `lieu_arrivee` varchar(90) NOT NULL,
  `nb_places` int(10) UNSIGNED NOT NULL,
  `prix_personne` float NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `statut_covoiturage` varchar(20) DEFAULT NULL,
  `credits` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `marque`
--

CREATE TABLE `marque` (
  `id_marque` int(10) UNSIGNED NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `marque`
--

INSERT INTO `marque` (`id_marque`, `libelle`) VALUES
(1, 'Peugeot'),
(2, 'Renault'),
(3, 'Tesla'),
(4, 'Toyota'),
(5, 'Volkswagen');

-- --------------------------------------------------------

--
-- Structure de la table `parametre`
--

CREATE TABLE `parametre` (
  `id_parametre` int(10) UNSIGNED NOT NULL,
  `id_configuration` int(10) UNSIGNED NOT NULL,
  `cle` varchar(100) NOT NULL,
  `valeur` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parametre`
--

INSERT INTO `parametre` (`id_parametre`, `id_configuration`, `cle`, `valeur`) VALUES
(1, 1, 'version_app', '1.0.0'),
(2, 1, 'frais_service', '5'),
(3, 1, 'distance_max_km', '500'),
(4, 1, 'dev_mode', 'false');

-- --------------------------------------------------------

--
-- Structure de la table `participe`
--

CREATE TABLE `participe` (
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `id_covoiturage` int(10) UNSIGNED NOT NULL,
  `date_reservation` datetime NOT NULL DEFAULT current_timestamp(),
  `statut_participation` enum('en_attente','confirmé','annulé') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `preference`
--

CREATE TABLE `preference` (
  `id_preference` int(10) UNSIGNED NOT NULL,
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `fumeur` tinyint(1) DEFAULT 0,
  `animal` tinyint(1) DEFAULT 0,
  `preferences_personnalisees` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `preference`
--

INSERT INTO `preference` (`id_preference`, `id_utilisateur`, `fumeur`, `animal`, `preferences_personnalisees`) VALUES
(7, 19, 0, 1, '[\"Musique calme\"]'),
(8, 20, 1, 0, '[]'),
(9, 21, 0, 0, '[]'),
(10, 22, 0, 0, '[]'),
(11, 23, 0, 0, '[]');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `id_role` int(10) UNSIGNED NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`id_role`, `libelle`) VALUES
(4, 'admin'),
(1, 'chauffeur'),
(6, 'employe'),
(5, 'les-deux'),
(2, 'passager');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `telephone` varchar(50) DEFAULT NULL,
  `adresse` varchar(50) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `photo` longblob DEFAULT NULL,
  `pseudo` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `credits` int(11) DEFAULT 20,
  `statut` enum('actif','suspendu') NOT NULL DEFAULT 'actif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id_utilisateur`, `nom`, `prenom`, `email`, `mot_de_passe`, `telephone`, `adresse`, `date_naissance`, `photo`, `pseudo`, `created_at`, `updated_at`, `credits`, `statut`) VALUES
(19, 'Roles', 'Deux', 'user@test.com', '$2y$10$NUZl7VHw0gtF6RbkxvcVSexCA/X3n0AAv0XSgZ3i8Ce0O/VG6Td..', '', '', '0000-00-00', '', 'Deux_roles', '2025-11-18 23:04:43', '2025-11-18 23:05:43', 20, 'actif'),
(20, 'Driver', 'Chauffeur', 'driver@test.com', '$2y$10$B5fuz/Zjjd3rnuGvpvebDukcaXf9w9X8tdurc7b8DvjnastazI6Iu', '', '', '1985-12-01', '', 'Transporter', '2025-11-18 23:06:38', '2025-11-18 23:07:41', 20, 'actif'),
(21, 'Pass', 'Enger', 'passenger@test.com', '$2y$10$mUps9aj7aPvU0TXLhn1VnOwBSjCbGD1xzmA61dWAYD2lHI38ja2fW', '', '', '1994-05-09', '', 'Passenger', '2025-11-18 23:08:39', '2025-11-18 23:09:06', 20, 'actif'),
(22, 'Emp', 'Loyee', 'employee@test.com', '$2y$10$z8RZQQRGJDoqywaHWtnZCeARhA.nbWIr0HzQGzQW/HfQksMIDfHdW', '', '', '0000-00-00', '', 'Employee', '2025-11-18 23:10:06', '2025-11-18 23:11:50', 20, 'actif'),
(23, 'Ad', 'Min', 'admin@test.com', '$2y$10$zur9139MIMR0CQBc1HtCyuOoli6/7W9fThNoIkni30sMNLZvLHsXW', '', '', '0000-00-00', '', 'Admin', '2025-11-18 23:10:50', '2025-11-18 23:13:15', 20, 'actif');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur_role`
--

CREATE TABLE `utilisateur_role` (
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `id_role` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur_role`
--

INSERT INTO `utilisateur_role` (`id_utilisateur`, `id_role`) VALUES
(19, 1),
(19, 2),
(20, 1),
(21, 2),
(22, 6),
(23, 4);

-- --------------------------------------------------------

--
-- Structure de la table `voiture`
--

CREATE TABLE `voiture` (
  `id_voiture` int(10) UNSIGNED NOT NULL,
  `modele` varchar(50) NOT NULL,
  `immatriculation` varchar(50) NOT NULL,
  `energie` varchar(50) DEFAULT NULL,
  `couleur` varchar(50) DEFAULT NULL,
  `date_premiere_immatriculation` date DEFAULT NULL,
  `id_utilisateur` int(10) UNSIGNED NOT NULL,
  `id_marque` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `voiture`
--

INSERT INTO `voiture` (`id_voiture`, `modele`, `immatriculation`, `energie`, `couleur`, `date_premiere_immatriculation`, `id_utilisateur`, `id_marque`) VALUES
(15, 'Clio', 'AB-789-VB', 'Essence', 'Verte', '1990-05-01', 20, 2);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id_avis`),
  ADD KEY `fk_avis_user` (`id_utilisateur`),
  ADD KEY `fk_avis_covoiturage` (`id_covoiturage`);

--
-- Index pour la table `configuration`
--
ALTER TABLE `configuration`
  ADD PRIMARY KEY (`id_configuration`);

--
-- Index pour la table `covoiturage`
--
ALTER TABLE `covoiturage`
  ADD PRIMARY KEY (`id_covoiturage`),
  ADD KEY `fk_covoiturage_chauffeur` (`id_chauffeur`),
  ADD KEY `fk_covoiturage_voiture` (`id_voiture`);

--
-- Index pour la table `marque`
--
ALTER TABLE `marque`
  ADD PRIMARY KEY (`id_marque`),
  ADD UNIQUE KEY `libelle` (`libelle`);

--
-- Index pour la table `parametre`
--
ALTER TABLE `parametre`
  ADD PRIMARY KEY (`id_parametre`),
  ADD KEY `fk_parametre_config` (`id_configuration`);

--
-- Index pour la table `participe`
--
ALTER TABLE `participe`
  ADD PRIMARY KEY (`id_utilisateur`,`id_covoiturage`),
  ADD KEY `fk_participe_covoiturage` (`id_covoiturage`);

--
-- Index pour la table `preference`
--
ALTER TABLE `preference`
  ADD PRIMARY KEY (`id_preference`),
  ADD KEY `id_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id_role`),
  ADD UNIQUE KEY `libelle` (`libelle`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `pseudo` (`pseudo`);

--
-- Index pour la table `utilisateur_role`
--
ALTER TABLE `utilisateur_role`
  ADD PRIMARY KEY (`id_utilisateur`,`id_role`),
  ADD KEY `fk_user_role_role` (`id_role`);

--
-- Index pour la table `voiture`
--
ALTER TABLE `voiture`
  ADD PRIMARY KEY (`id_voiture`),
  ADD UNIQUE KEY `immatriculation` (`immatriculation`),
  ADD KEY `fk_voiture_user` (`id_utilisateur`),
  ADD KEY `fk_voiture_marque` (`id_marque`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id_avis` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `configuration`
--
ALTER TABLE `configuration`
  MODIFY `id_configuration` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `covoiturage`
--
ALTER TABLE `covoiturage`
  MODIFY `id_covoiturage` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `marque`
--
ALTER TABLE `marque`
  MODIFY `id_marque` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `parametre`
--
ALTER TABLE `parametre`
  MODIFY `id_parametre` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `preference`
--
ALTER TABLE `preference`
  MODIFY `id_preference` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `id_role` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id_utilisateur` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `voiture`
--
ALTER TABLE `voiture`
  MODIFY `id_voiture` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `fk_avis_covoiturage` FOREIGN KEY (`id_covoiturage`) REFERENCES `covoiturage` (`id_covoiturage`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_avis_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `covoiturage`
--
ALTER TABLE `covoiturage`
  ADD CONSTRAINT `fk_covoiturage_chauffeur` FOREIGN KEY (`id_chauffeur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_covoiturage_voiture` FOREIGN KEY (`id_voiture`) REFERENCES `voiture` (`id_voiture`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `parametre`
--
ALTER TABLE `parametre`
  ADD CONSTRAINT `fk_parametre_config` FOREIGN KEY (`id_configuration`) REFERENCES `configuration` (`id_configuration`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `participe`
--
ALTER TABLE `participe`
  ADD CONSTRAINT `fk_participe_covoiturage` FOREIGN KEY (`id_covoiturage`) REFERENCES `covoiturage` (`id_covoiturage`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_participe_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `preference`
--
ALTER TABLE `preference`
  ADD CONSTRAINT `preference_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `utilisateur_role`
--
ALTER TABLE `utilisateur_role`
  ADD CONSTRAINT `fk_user_role_role` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `voiture`
--
ALTER TABLE `voiture`
  ADD CONSTRAINT `fk_voiture_marque` FOREIGN KEY (`id_marque`) REFERENCES `marque` (`id_marque`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_voiture_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
