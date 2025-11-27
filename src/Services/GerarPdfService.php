<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GerarPdfService
{
    private string $apiKey = 'dQGgBiIk67hUeeGPqmoiqdJqcJS6sDIf';
    private string $url = 'https://app.useanvil.com/api/v1/generate-pdf';
    private HttpClientInterface $client;

    public function __construct(HttpClientInterface $client)
    {
        $this->client = $client;
    }
    public function gerarPdf(string $template)
    {
        //debug
        file_put_contents(__DIR__ . "/../files/template.html", $template);

        $response = $this->client->request(
            'POST',
            $this->url,
            [
                 'auth_basic' => [$this->apiKey, ''],
                 'json' => [
                     'type' => 'html',
                     'data' => [
                         'html' => $template
                     ],
                 ],
             ]
        );

        $status_code = $response->getStatusCode();
        $binario_pdf = $response->getContent();

        if ($status_code != 200) {
            return new JsonResponse([
                'error' => "A API UseAnvil retornou: {$status_code}"
            ], 500);
        }

        return $binario_pdf;
    }
}
