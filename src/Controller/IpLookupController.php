<?php

namespace App\Controller;

use App\Services\IpLookupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class IpLookupController extends AbstractController
{
    #[Route('/ip', name: 'index_ip_lookup')]
    public function index(Request $request): Response
    {
        return $this->render('ip_lookup/index.html.twig', [
            //Endereços relevantes ao ambiente de testes
            "ip" => $request->server->get('SERVER_ADDR') ?? $_ENV['IP_PESSOAL']
        ]);
    }
    #[Route('/ip/lookup/', name: 'find_ip_location', methods: ['GET'])]
    public function find(Request $request, IpLookupService $ipLookup): JsonResponse|Response
    {
        $ip = $request->query->get('ip');
        $formato_resposta = $request->query->get('formato_resposta');
        $dados_localizacao = $ipLookup->findLocation($ip);

        return ($formato_resposta == 'json') ?
            $this->json($dados_localizacao) :
            $this->render('ip_lookup/show.html.twig', [
                "locale" => $dados_localizacao
            ]);
    }
}
