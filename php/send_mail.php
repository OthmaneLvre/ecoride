<?php
function envoyerMail($destinataire, $sujet, $messageHtml) {

    $logFile = __DIR__ . "/mail_log.txt";

    $logEntry = "-----\n";
    $logEntry .= "Dest : $destinataire\n";
    $logEntry .= "Sujet : $sujet\n";
    $logEntry .= "Message : \n$messageHtml\n";
    $logEntry .= "Date : " . date('Y-m-d H:i:s') . "\n";
    $logEntry .= "-----\n\n";

    file_put_contents($logFile, $logEntry, FILE_APPEND);

    return true; // simulation
}
