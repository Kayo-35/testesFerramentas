<?php

namespace App\Services;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class MonkeyPdfService
{
    private HttpClientInterface $client;
    private string $apiKey = "JGkYxX9dQzE4bxswNJhq";
    private string $endpoint = "https://api.pdfmonkey.io/api/v1/documents";
    private string $templateId = "03D36F53-99ED-4A72-82C8-274E7C50EEDC";

    public function __construct(HttpClientInterface $client)
    {
        $this->client  = $client;
    }
    public function gerarPdf(string $html): array
    {

        $payload = [
            'document' => [
                'document_template_id' => $this->templateId,
                'status' => 'pending', // Good practice to declare intent
                'payload' => [
                    'raw_html_content' => $html,
                ],
            ],
        ];

        $response = $this->client->request('POST', 'https://api.pdfmonkey.io/api/v1/documents', [
            'headers' => [
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
            'body' => json_encode($payload, JSON_UNESCAPED_UNICODE),
        ]);

        $statusCode = $response->getStatusCode();

        if ($statusCode === 201 || $statusCode === 200) {
            $data = $response->toArray();

            if (!isset($data['document']['download_url'])) {
                return ['success' => false, 'error' => 'Download URL not found in response'];
            }

            $downloadUrl = $data['document']['download_url'];

            //Realiza o download do arquivo
            $pdfResponse = $this->client->request('GET', $downloadUrl);

            if ($pdfResponse->getStatusCode() === 200) {
                $binaryContent = $pdfResponse->getContent();

                return [
                    'success' => true,
                    'pdf'     => $binaryContent,
                ];
            }
        }

        return [
            'success'  => false,
            'error'    => 'API error, HTTP ' . $statusCode,
            'response' => $response->getContent(false),
        ];
    }
}
