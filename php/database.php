<?php

require_once __DIR__ . '/Services/UserService.php';
require_once __DIR__ . '/Services/TripService.php';

/**
 * Compatibilité avec l'ancien code procédural
 * La logique métier est désormais centralisée dans les services
 */

function getAllUsers(): array
{
    return (new UserService())->getAllUsers();
}

function getAllTrips(): array
{
    return (new TripService())->getAllTrips();
}
