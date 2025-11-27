<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Dompdf\Dompdf;
use App\Services\GerarPdfService;

final class BaseController extends AbstractController
{
    private string $caminhoTemplate = '/home/kayo/Documentos/estudos/dev/trabalho/testesFerramentas/src/files/template.html';
    private string $caminhoSalvar = '/home/kayo/Documentos/estudos/dev/trabalho/testesFerramentas/src/files/'; //placeholder incluso para nomenclatura dos arquivos

    #[Route('/base', name: 'index_base', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('base/index.html.twig');
    }
    #[Route('/api/pdf', name: 'api_pdf', methods: ['POST'])]
    public function gerarPdf(GerarPdfService $gerador): Response
    {
        $template = json_decode(file_get_contents('php://input'));

        //UseAnvil
        $binario_pdf = $gerador->gerarPdf($template->html);

        //Weasyprint: Apenas para testes em pc pessoal
        $this->weasyprint(
            $this->caminhoTemplate,
            $this->caminhoSalvar . 'conversao_weasy.pdf'
        );

        //DomPDF
        $this->domPdf(
            $this->caminhoTemplate,
            $this->caminhoSalvar . 'conversao_dom.pdf'
        );

        return new Response($binario_pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="document.pdf"'
        ]);
    }
    private function weasyprint(string $caminhoTemplate, string $caminhoSalvar): string|false|null
    {
        shell_exec("weasyprint {$caminhoTemplate} {$caminhoSalvar}");
        return file_get_contents($caminhoSalvar);
    }
    private function domPdf(string $caminhoTemplate, string $caminhoSalvar)
    {
        //Tão ou mais eficaz que mPdf
        $domPdf = new Dompdf();
        $domPdf->loadHtml(file_get_contents($caminhoTemplate));
        $domPdf->setPaper('A4', 'portrait');
        $domPdf->render();
        $pdf = $domPdf->output();

        file_put_contents($caminhoSalvar, $pdf);
        return file_get_contents($caminhoSalvar);
    }
}
