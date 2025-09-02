<?php
include("get-location.php");

$pixelId = '1255598326253136';
$accessToken = 'EAAPUZCOKLFpUBPHrsARvkwkB6pXuIZB1jnZB5JFUjZAffzWJBvMBAdACV6ZArwdJvZAtjgijYsj7m2Yq8htELrfYvPCsAZBTKTbBEmCwvdclUbD4IFnJXOm8L7TMJOpAX7jSkCIZBqoMOowkNvC1ZAdLzcukRPIOD4ZB9vZCLcfdUxJ65txaHubb0FkZAGFqgFZAeAQZDZD';
$url = "https://graph.facebook.com/v17.0/$pixelId/events";

$userIP = $_SERVER['REMOTE_ADDR'];
$geoData = getGeoLocation($userIP);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $telefone = $_POST["telefone"] ?? '';

    if (empty($nome) || empty($telefone)) {
        echo "Todos os campos são obrigatórios.";
        exit;
    }

    $telefoneHash = hash('sha256', $telefone);
    $nomeHash = hash("sha256", $nome);
    $estadoHash = hash('sha256', $geoData['region']);
    $cidadeHash = hash('sha256', $geoData['city']);
    $paisHash = hash('sha256', $geoData['country']);
    $zipHash = hash("sha256", $geoData['zip']);

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $currentUrl = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? '');

    $data = [
        'data' => [
            [
                'event_name' => 'Cadastro',
                'event_time' => time(),
                'action_source' => 'website',
                'event_source_url' => $currentUrl,
                'user_data' => [
                    'ph' => $telefoneHash,
                    'fn' => $nomeHash,
                    'external_id' => $_SERVER['REMOTE_ADDR'],
                    'client_ip_address' => $_SERVER['REMOTE_ADDR'],
                    'client_user_agent' => $_SERVER['HTTP_USER_AGENT'],
                    'fbc' => filter_input(INPUT_COOKIE, '_fbc') ? filter_input(INPUT_COOKIE, '_fbc') : null,
                    'fbp' => filter_input(INPUT_COOKIE, '_fbp'),
                    'st' => $estadoHash,
                    'country' => $paisHash,
                    'ct' => $cidadeHash, 
                    'zp' => $zipHash,
                ],
            ],
        ],
        'access_token' => $accessToken,
    ];

    $jsonData = json_encode($data);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if ($response === false) {
        echo "Erro ao enviar o evento: " . curl_error($ch);
    } else {
        echo "Evento enviado com sucesso: " . $response;
    }

    curl_close($ch);
}
?>
