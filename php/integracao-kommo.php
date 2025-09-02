<?php
include_once("get-location.php");

function sendJsonResponse($status, $message) {
    header('Content-Type: application/json');
    echo json_encode(['status' => $status, 'message' => $message]);
    exit();
}

function formatPhoneNumber($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    
    if (strlen($phone) < 3) {
        return null;
    }

    $ddi = "55";
    $ddd = substr($phone, 0, 2);
    $numeroSemDDD = substr($phone, 2);

    return "+{$ddi} {$ddd} {$numeroSemDDD}";
}

function sendLeadRequest($data, $headers) {
    $url = "https://terroirbrokers5.kommo.com/api/v4/leads/complex";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Aceitar tanto x-www-form-urlencoded (POST) quanto JSON
    $rawInput = file_get_contents('php://input');
    $jsonBody = json_decode($rawInput, true);

    $name = '';
    $email = '';
    $phone = '';
    $state = '';
    $city = '';

    // Prioriza POST; fallback para JSON e para chaves em inglês
    $name = trim($_POST['nome'] ?? ($jsonBody['nome'] ?? ($jsonBody['name'] ?? '')));
    $email = trim($_POST['email'] ?? ($jsonBody['email'] ?? ''));
    $phone = trim($_POST['telefone'] ?? ($jsonBody['phone'] ?? ''));
    $state = trim($_POST['estado'] ?? ($jsonBody['estado'] ?? ''));
    $city = trim($_POST['cidade'] ?? ($jsonBody['cidade'] ?? ''));
  

    // UTM Parameters
    $utm_source = htmlspecialchars($_POST['utm_source'] ?? ($jsonBody['utm_source'] ?? 'Desconhecido'));
    $utm_medium = htmlspecialchars($_POST['utm_medium'] ?? ($jsonBody['utm_medium'] ?? 'Desconhecido'));
    $utm_campaign = htmlspecialchars($_POST['utm_campaign'] ?? ($jsonBody['utm_campaign'] ?? 'Desconhecido'));
    $utm_content = htmlspecialchars($_POST['utm_content'] ?? ($jsonBody['utm_content'] ?? 'Desconhecido'));
    $utm_term = htmlspecialchars($_POST['utm_term'] ?? ($jsonBody['utm_term'] ?? ''));
    $utm_referrer = htmlspecialchars($_POST['utm_referrer'] ?? ($jsonBody['utm_referrer'] ?? ''));
    $referrer = htmlspecialchars($_POST['referrer'] ?? ($jsonBody['referrer'] ?? ''));
    $gclientid = htmlspecialchars($_POST['gclientid'] ?? ($jsonBody['gclientid'] ?? ''));
    $gclid = htmlspecialchars($_POST['gclid'] ?? ($jsonBody['gclid'] ?? ''));
    $fbclid = htmlspecialchars($_POST['fbclid'] ?? ($jsonBody['fbclid'] ?? ''));

    if (empty($name) || empty($phone)) {
        sendJsonResponse('error', 'Todos os campos são obrigatórios.');
    }

    $formattedPhone = formatPhoneNumber($phone);
    if (!$formattedPhone) {
        sendJsonResponse('error', 'Número de telefone inválido.');
    }

    // Localização por IP (cidade/estado) usando get-location.php
    $clientIp = '';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $clientIp = trim($ips[0]);
    } else {
        $clientIp = $_SERVER['REMOTE_ADDR'] ?? '';
    }
    $geoData = function_exists('getGeoLocation') ? getGeoLocation($clientIp) : [];
    $estadoLead = isset($geoData['region']) ? $geoData['region'] : '';
    $cidadeLead = isset($geoData['city']) ? $geoData['city'] : '';

    $headers = [
        "accept: application/json",
        "content-type: application/json",
        "authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImYyYmE4ZTFhZDdjMjJlMjc4NGE3Yzk5ZTkyN2Y3MmQ2MDBhMDZkODYzMGIxOTU3NTZlZjQzZTgyYjM0NDQ3NzBkMTMwY2E2Y2Y3Mjg1OGY3In0.eyJhdWQiOiI1MGIwMmM4Mi1iNjJkLTRkODUtOWQyOC01NzZkMmQyOTE1ODQiLCJqdGkiOiJmMmJhOGUxYWQ3YzIyZTI3ODRhN2M5OWU5MjdmNzJkNjAwYTA2ZDg2MzBiMTk1NzU2ZWY0M2U4MmIzNDQ0NzcwZDEzMGNhNmNmNzI4NThmNyIsImlhdCI6MTc1Njg0NTY0OSwibmJmIjoxNzU2ODQ1NjQ5LCJleHAiOjE4NTM4ODQ4MDAsInN1YiI6IjEzNjM2NTcyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0OTg5ODc2LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwidXNlcl9mbGFncyI6MCwiaGFzaF91dWlkIjoiYmEwMTcwZWUtYTc5ZS00NDMwLTg4NWItOGYzZjE2Mzc0N2JmIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.Suc8X1hB9HA6T9YkZuNOyOsml1_nm45B2rxYRydDOpqGn3X2EDtC2DPEmsH60MjzuptKaR7tzHkF1A9ZneQ6D30GPyK86rhClUlgdnf-iwSb4afAQ4ffdp4cHRi2JqGMPS4AgS4H-LW9Gh0POx1N7rMCUg1GkVnK1qhR1xDM5KkkzmS4m4tneuQldG_q-24Ft62LmVUyfVoVkKU4azKt6tlQj3s27Cb26FyrJxJEtaUOwJn_gt0xM0MxHW95MS22Mz5st06GEMMHRU4tJIoIloWm8ML8MnxLbxlN4_VwIMYx7xZXksTuZqSE-6sHqBCWBho2bslBniUqmLMzLecTUw"
    ];

    $nameParts = explode(' ', $name);
    $lastName = array_pop($nameParts);
    $firstName = implode(' ', $nameParts);

    $data = [
        [
            "custom_fields_values" => [
                ["field_id" => 948255, "values" => [["value" => $utm_content]]],
                ["field_id" => 948257, "values" => [["value" => $utm_medium]]],
                ["field_id" => 948259, "values" => [["value" => $utm_campaign]]],
                ["field_id" => 948261, "values" => [["value" => $utm_source]]],
                ["field_id" => 948263, "values" => [["value" => $utm_term]]],
                ["field_id" => 948265, "values" => [["value" => $utm_referrer]]],
                ["field_id" => 948267, "values" => [["value" => $referrer]]],
                ["field_id" => 948269, "values" => [["value" => $gclientid]]],
                ["field_id" => 948271, "values" => [["value" => $gclid]]],
                ["field_id" => 948273, "values" => [["value" => $fbclid]]]
            ],
            "_embedded" => [
                "contacts" => [
                    [
                        "name" => $name,
                        "first_name" => $firstName,
                        "last_name" => $lastName,
                        "custom_fields_values" => [
                            [
                                "field_id" => 948247,
                                "values" => [[
                                    "value" => $formattedPhone,
                                ]]
                            ],
                            [
                                "field_id" => 948249,
                                "values" => [[
                                    "value" => $email,  
                                ]]
                            ],
                        ]
                    ]
                ],
            ],
            "pipeline_id" => 11898603,
            "name" => $name
        ]
    ];

    $response = json_decode(sendLeadRequest($data, $headers));

    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Dados enviados com sucesso!',
        'response' => $response,
        'geo' => [ 'ip' => $clientIp, 'cidade' => $cidadeLead, 'estado' => $estadoLead ]
    ]);

} else {
    sendJsonResponse('error', 'Método inválido. Use o método POST.');
}