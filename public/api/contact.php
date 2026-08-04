<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $message)
{
    http_response_code($status);
    echo json_encode(
        ['ok' => $ok, 'message' => $message],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Método não permitido.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://eduardoevaristo.com.br',
    'https://www.eduardoevaristo.com.br',
    'http://localhost:4173',
    'http://localhost:4187',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:4187',
];

if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    respond(403, false, 'Origem não autorizada.');
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos(strtolower($contentType), 'application/json') !== false) {
    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody ?: '', true);
    if (!is_array($data)) {
        respond(400, false, 'Dados inválidos.');
    }
} else {
    $data = $_POST;
}

if (trim((string) ($data['website'] ?? '')) !== '') {
    respond(200, true, 'Mensagem enviada com sucesso.');
}

$name = trim((string) ($data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$projectType = trim((string) ($data['projectType'] ?? $data['project-type'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

$allowedProjectTypes = [
    'Produto digital',
    'Landing page / lançamento',
    'E-commerce',
    'Sistema / plataforma',
    'Outro',
];

if (strlen($name) < 2 || strlen($name) > 100) {
    respond(422, false, 'Informe um nome válido.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    respond(422, false, 'Informe um e-mail válido.');
}

if (!in_array($projectType, $allowedProjectTypes, true)) {
    respond(422, false, 'Selecione um tipo de projeto válido.');
}

if (strlen($message) < 10 || strlen($message) > 4000) {
    respond(422, false, 'A mensagem deve ter entre 10 e 4000 caracteres.');
}

$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
    . DIRECTORY_SEPARATOR
    . 'ee-contact-'
    . hash('sha256', $clientIp)
    . '.txt';

if (is_file($rateFile)) {
    $lastAttempt = (int) file_get_contents($rateFile);
    if ($lastAttempt > 0 && time() - $lastAttempt < 30) {
        respond(429, false, 'Aguarde alguns segundos antes de enviar outra mensagem.');
    }
}

@file_put_contents($rateFile, (string) time(), LOCK_EX);

$safeName = str_replace(["\r", "\n"], ' ', $name);
$safeEmail = str_replace(["\r", "\n"], '', $email);
$safeProjectType = str_replace(["\r", "\n"], ' ', $projectType);
$recipient = 'contato@eduardoevaristo.com.br';
$subject = 'Novo projeto: ' . $safeProjectType;
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$mailBody = implode("\r\n", [
    'Nova mensagem enviada pelo portfólio',
    '',
    'Nome: ' . $safeName,
    'E-mail: ' . $safeEmail,
    'Tipo de projeto: ' . $safeProjectType,
    '',
    'Contexto:',
    $message,
    '',
    'Enviado em: ' . date('d/m/Y H:i:s T'),
]);

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Portfolio Eduardo Evaristo <contato@eduardoevaristo.com.br>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

if (!mail($recipient, $encodedSubject, $mailBody, $headers)) {
    respond(502, false, 'Não foi possível enviar agora. Tente novamente ou use o e-mail direto.');
}

respond(200, true, 'Mensagem enviada. Responderei em até 1 dia útil.');
