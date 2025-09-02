<?php
function getGeoLocation($ip) {
  $url = "http://ip-api.com/json/{$ip}";
  $response = file_get_contents($url);
  return json_decode($response, true);
}
?>