# EcoRide – Application de covoiturage écologique

EcoRide est une application web de covoiturage visant à favoriser les déplacements partagés
et responsables.  
Ce projet a été réalisé dans le cadre de l’Évaluation en Cours de Formation (ECF)
du titre **Développeur Web Full Stack – Studi**.

---

## 1. Base de données EcoRide

Les scripts SQL ont été **rédigés manuellement** afin de démontrer la conception
d’une base de données relationnelle cohérente et normalisée.

- `01_create_tables.sql` : création des tables, clés primaires et clés étrangères
- `02_insert_test_data.sql` : jeu de données de test

Un export phpMyAdmin a été utilisé comme **référence**, mais les scripts ont été
**réécrits volontairement** pour répondre aux exigences pédagogiques du jury.

---

## 2. Déploiement local de l’application EcoRide

Ce guide explique pas à pas comment installer et exécuter l’application EcoRide
en local, dans un environnement **Windows + XAMPP**.

L’objectif est de permettre au jury (ou à tout développeur) de lancer l’application
sans difficulté.

---

## 3. Prérequis

Avant d’installer EcoRide, assurez-vous d’avoir :

- XAMPP (Apache + MySQL)
- Git
- Un navigateur moderne (Chrome, Firefox, Edge…)

**Optionnel :**
- MongoDB Compass (pour la consultation des logs)

---

## 4. Récupération du projet

Ouvrez un terminal puis clonez le dépôt :

```bash
git clone https://github.com/OthmaneLvre/ecoride.git

Déplacez ensuite le projet dans le dossier htdocs de XAMPP :
C:\xampp\htdocs\ecoride\

⚠️ Important :
Le projet doit impérativement être placé dans htdocs pour fonctionner correctement.

5. Configuration de la base de données MySQL
5.1 Lancer Apache et MySQL

Ouvrez XAMPP Control Panel

Cliquez sur Start pour Apache

Cliquez sur Start pour MySQL

5.2 Ouvrir phpMyAdmin

Rendez-vous sur :
http://localhost/phpmyadmin

5.3 Créer la base de données

Cliquez sur Nouvelle base de données

Nom : ecoride

Cliquez sur Créer

5.4 Importer le script SQL

Sélectionnez la base ecoride

Onglet Importer

Importez le fichier :

/docs/ecoride.sql

Cela crée automatiquement toutes les tables nécessaires :

utilisateur

voiture

covoiturage

participe

avis

role

utilisateur_role

etc.


6. Configuration de la connexion PHP

Dans le fichier :

/php/database.php

$host = "localhost";
$dbname = "ecoride";
$username = "root";
$password = ""; // Mot de passe vide par défaut sous XAMPP

Si votre installation MySQL utilise un mot de passe, renseignez-le ici.



7. Lancement de l’application

Une fois Apache et MySQL démarrés, l’application est accessible à l’adresse :

http://localhost/ecoride/index.html


Vous arrivez sur la page d’accueil de l’application EcoRide.


8. Comptes de test

Pour faciliter l’évaluation, plusieurs comptes sont fournis :

Utilisateur – deux rôles

Email : user@test.com

Mot de passe : Test@123

Chauffeur

Email : driver@test.com

Mot de passe : Test@123

Passager

Email : passenger@test.com

Mot de passe : Test@123

Employé

Email : employee@test.com

Mot de passe : Test@123

Administrateur

Email : admin@test.com

Mot de passe : Test@123


9. Fonctionnalités complémentaires
Envoi de mails

L’application simule l’envoi de mails côté PHP.
Aucune configuration SMTP n’est requise pour les tests.

Logs (MongoDB – optionnel)

Un système de logs peut être activé via MongoDB (optionnel).

Installer MongoDB Compass

Lancer le serveur MongoDB

Adapter la chaîne de connexion si nécessaire


## Déploiement avec Docker

L’application EcoRide utilise **Docker** dans le cadre de son déploiement en production.

Un conteneur Docker permet de :
- garantir un environnement d’exécution identique
- faciliter le déploiement sur Fly.io
- isoler les dépendances serveur (Apache, PHP)

Le Dockerfile est utilisé exclusivement pour le déploiement et **n’est pas requis pour l’exécution locale** de l’application lors de l’évaluation.

### Architecture Docker

- Image basée sur PHP + Apache
- Copie du code source dans le conteneur
- Exposition du port HTTP
- Lancement du serveur Apache en mode production

La configuration Docker est volontairement simple et adaptée à un projet pédagogique.


10. Arborescence technique (résumé)
ecoride/
│── index.html
│── signup.html
│── login.html
│── listings.html
│── details.html
│── user-space.html
│── history.html
│── employee-space.html
│── admin.html
│
├── docker/
├── sql/
├── partials/
├── data/
├── vendor/
├── css/
├── js/
├── assets/
├── php/
│   ├── Core/
│   ├── Services/
│   ├── endpoints PHP
│
└── docs/
    ├── ecoride.sql
    └── Charte_graphique.pdf




11. Déploiement sur Fly.io

L’application EcoRide est accessible en ligne à l’adresse :

https://ecoride-project-morning-rain-797.fly.dev

Hébergement

Plateforme : Fly.io

Déploiement basé sur Docker

Secrets gérés via Fly.io Secrets

Le backend est également exploitable en local, conformément aux consignes ECF.

Commandes principales (à titre informatif)
flyctl auth login
flyctl launch
flyctl deploy

12. Application prête à l’usage

Si les étapes précédentes ont été suivies :

✔ Apache actif

✔ MySQL actif et base importée

✔ Connexion PHP configurée

✔ Projet placé dans htdocs

👉 L’application EcoRide est pleinement fonctionnelle en local.


Auteur
Othmane LECOEUVRE 
Développeur Web Full Stack | Promotion Studi 2025/2026
 Basé à Céret (66)