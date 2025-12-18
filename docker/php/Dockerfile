FROM php:8.2-apache

# Installation des extensions nécessaires
RUN docker-php-ext-install pdo pdo_mysql

# Activation du module Apache rewrite
RUN a2enmod rewrite

# Définition du dossier de travail
WORKDIR /var/www/html

# Copie du projet dans le conteneur
COPY . /var/www/html

# Droits (important pour Linux)
RUN chown -R www-data:www-data /var/www/html
