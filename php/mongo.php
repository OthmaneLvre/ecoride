<?php
declare(strict_types=1);

$mongoUri = getenv('MONGO_URI');

if (!$mongoUri) {
    throw new RuntimeException('MongoDB URI not defined');
}

$client = new MongoDB\Client($mongoUri);
