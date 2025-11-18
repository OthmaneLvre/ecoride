<?php
require_once 'mongo.php';

use MongoDB\BSON\UTCDateTime;

function addLog($type, $message, $details = []) {
    global $mongoDB;

    try {
        // Sélection de la collection "logs"
        $collection = $mongoDB->logs;

        // Documents à insérer
        $collection->insertOne([
            "type"      => $type,
            "message"   => $message,
            "details"   => $details,
            "date"      => new UTCDateTime()
        ]);

    } catch (Exception $e) {
        error_log("Erreur MongoDB lors de addLog(): " . $e->getMessage());
        echo "Erreur Mongo DB : " . $e->getMessage();
    }

}
