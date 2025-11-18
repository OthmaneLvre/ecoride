<?php
require_once 'mongo.php';

$collection = $mongoDB->selectCollection('logs');

$logs = $collection->find(
    [],
    [
        'sort' => ['date => -1'],
        'limit' => 200
    ]
)->toArray();

echo json_encode($logs);
