<?php

namespace App\Services;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class IpLookupService
{
    private HttpClientInterface $client;
    private string $apiUrl = "https://api.ipgeolocation.io/v2/ipgeo";
    private string $apiKey;

    public function __construct(HttpClientInterface $client)
    {
        $this->apiKey = $_ENV['API_KEY_IP_GEO'];
        $this->client = $client;
    }
    public function findLocation(string $ip): array
    {
        $url = "{$this->apiUrl}?apiKey={$this->apiKey}&ip={$ip}";
        $resposta = $this->client->request(
            'GET',
            $url
        );

        $statusCode = $resposta->getStatusCode();
        return ($statusCode === 200) ? $resposta->toArray() : [];
    }
}
