<?php
require_once 'mongo.php';

function addLog($type, $message, $details = []) {
    global $mongoDB;

    $collection = $mongoDB->selectCollection('logs');

    $log = [
        "type"      => $type,
        "message"   => $message,
        "details"   => $details,
        "date"      => new MongoDB\BSON\UTCDateTime()
    ];

    $collection->insertOne($log);
}
