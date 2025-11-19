Déploiement local de l'application EcoRide

Ce document explique pas à pas comment installer et exécuter l’application EcoRide en local, dans un environnement Windows + XAMPP.
L’objectif est de permettre au jury (ou à tout développeur) de lancer l'application sans difficulté.

// ==== 1. Prérequis ==== 

Avant d'installer EcoRide, assurez-vous d'avoir : 

    - XAMPP (Apache + SQL) 
    - Git 
    - Un navigateur moderne : Chrome, Firefox, Edge, etc... 

    - Optionnel pour les logs => MongoDB Compass


// ==== 2. Récupération du projet ==== 

Ouvrez un terminal puis clonez le dépôt : 

git clone https://github.com/OthmaneLvre/ecoride.git

Déplacez le dossier dans votre répertoire XAMPP: 

C:\xampp\htdocs\ecoride\

ATTENTION le projet doit impérativement être placé dans htdocs pour foncitonner 

// ==== 3. Configuration de la base de données MySQL ==== 

    3.1 Lancer Apache + MySQL
        1. Ouvrez XAMPP Control Panel 
        2. Cliquer sur Start pour Apache 
        3. Cliquez sur Start pour MySQL 

    3.2 Ouvrir PHPMyAdmin 
        Allez sur 
            http://localhost/phpmyadmin 

    3.3 Créer la base de données 
        1. Cliquez sur Nouvelle Base 
        2. Nommez la : 
            ecoride
        3. Cliquez sur créer 

    3.4 Imposter le fichier SQL fourni
        1. Cliquez sur la base ecoride
        2. Onglet Importer
        3. Importer le fichier 
            /docs/ecoride.sql 

Cela va créer automatiquement toutes les tables nécessaires : 
    - utilisateur 
    - voiture
    - covoiturage
    - participe
    - avis
    - role
    - utilisateur_role
    - etc...

// ==== 4. Configuration du fichier de connexion PHP ====     

Dans le fichier 
/php/database.php

Vérifiez que les identifiants correspondent à votre installation local : 
    $$host = "localhost";
    $dbname = "ecoride";
    $username = "root";
    $password = ""; // Mot de passe vide par défaut sous XAMPP

Si vous utilisez un mot de passe MySQL personnalisé, mettez-le ici. 

// ==== 5. Lancement de l'application ====     

Une fois Apache et MySQL lancés, l'applicaiton est accessible via : 
    http://localhost/ecoride/index.html

Vous arrivez sur la plage d'accueil de l'application 

// ==== 6. Comptes de test ====     

Pour facilier l'évaluation, plusieurs comptes sont fournis :

    - UTILISATEUR - deux rôles
        Email : user@test.com
        MDP : Test@123

    - UTILISATEUR - Chauffeur 
        Email : driver@test.com
        MDP : Test@123

    - UTILISATEUR - Passager 
        Email : passenger@test.com
        MDP : Test@123

    - Employé 
        Email : employee@test.com
        MDP : Test@123

    - Administrateur  
        Email : admin@test.com
        MDP : Test@123


// ==== 7. Tests Complémentaires ====  

    - Envoi de mails

L’application simule l’envoi des mails côté PHP.
Aucune configuration SMTP n’est requise pour les tests.

    - Logs (MongoDB – optionnel)

Pour activer MongoDB dans database_logs.php (à venir) :

    - Installer MongoDB Compass

    - Lancer le serveur

    - Modifier la chaîne de connexion MongoDB si besoin.

// ==== 8. Arborescence technique (résumé) ==== 

            ecoride/
            │── index.html
            │── signup.html
            │── login.html
            │── home.html
            │── details.html
            │── user-space.html
            │── history.html
            │── employee.html
            │── admin.html
            │
            ├── css/
            ├── js/
            ├── assets/
            ├── php/
            │   ├── database.php
            │   ├── endpoints...
            │
            └── docs/
                └── Charte_graphique.pdf
                └── ecoride.sql


// ==== 9. Déploiment sur Fly.io ====

L’application EcoRide est en ligne à l’adresse suivante :

        https://ecoride-project-morning-rain-797.fly.dev/index.html

Déploiement utilisé : Fly.io

L’application est déployée via Fly.io, une plateforme d’hébergement basée sur des conteneurs.
Le backend fonctionne en local pour des raisons de sécurité et de simplicité, conformément aux consignes ECF

    Commandes principales (pour information) :

    Installer Flyctl
        iwr https://fly.io/install.ps1 -useb | iex

    Connexion 
        flyctl auth login

    Initialisation du projet
        flyctl launch

    Déploiement
        flyctl deploy

// ==== 10. Application prêtes à l'usage ==== 

Si vous avez suivi les étapes :

    ✔ Serveur Apache → OK
    ✔ MySQL + base importée → OK
    ✔ Fichier /php/database.php configuré → OK
    ✔ Projet dans /htdocs → OK

Vous pouvez utiliser EcoRide localement sans aucun problème 



Auteur
Othmane LECOEUVRE 
Développeur Web Full Stack | Promotion Studi 2025/2026
 Basé à Céret (66)