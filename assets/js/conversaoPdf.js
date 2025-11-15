document.addEventListener('DOMContentLoaded', () => {
    //Capturando o acinador para impressão
    let acionador = document.querySelector("#gerarCliente");
    acionador.addEventListener('click', gerarPdf);
});

//A geração durou cerca de 5s em média no meu pc, por isso faz-se necessário utilizar-se
//de funçõess assync e premisses para que não haja interrupção generalizada de qualquer
//uso de JS na plataforma.
async function gerarPdf() {
    // Setup das bibliotecas, (nesse caso que estou usando CDN)
    const { jsPDF } = window.jspdf;
    window.html2canvas = window.html2canvas;

    //Feedback para o usuário
    let alert = document.createElement('div');
    let pagina = document.querySelector('#impressao');
    alert.innerHTML = gerarAlert(0, 'Aguarde a Geração do PDF!');
    pagina.prepend(alert);


    // Elementos que serão transformados em páginas inteiras.
    // Básico: Englobe cada página a ser impressa em um container qualquer
    const paginas = [
        document.querySelector("#pagina1"),
        document.querySelector("#pagina2")
    ];

    // Configurando o PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
    });

    // Configurações unificadas para o html2canvas
    const h2cOptions = {
        scale: 2,
        useCORS: true, //Para imagens extenas
        logging: false,
    };

    // Oculta o separador de página da renderização final no PDF
    const pageBreaker = document.querySelector(".page-break");
    if (pageBreaker) {
        pageBreaker.style.display = 'none';
    }

    // Processar todas as páginas sequencialmente
    let promise = Promise.resolve();
    let firstPage = true;

    // Itera sobre cada seção para criar uma página separada
    paginas.forEach((secao) => {
        promise = promise.then(() => {
            return html2canvas(secao, h2cOptions).then(canvas => {
                if (!firstPage) {
                    pdf.addPage(); // Adiciona nova página antes de renderizar a segunda seção
                }

                // Dimensões do documento
                const larguraCanvas = canvas.width;
                const alturaCanvas = canvas.height;

                // Margens e dimensões para o PDF
                const margin = 20;
                const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;

                /*
                 * Calcula a altura da imagem proporcionalmente, confesso que nesse trecho tive de utilizar IA generativa
                 * para finalmente obter uma proporção harmônica :)
                 * */
                const pdfHeight = (pdfWidth / larguraCanvas) * alturaCanvas;

                // Adiciona o canvas (imagem da seção) ao PDF
                pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', margin, margin, pdfWidth, pdfHeight);

                firstPage = false;
            });
        });
    });

    //Restatura estado original da página
    promise.then(() => {
        alert.remove();

        pdf.save('teste.pdf'); //Quando a geração for concluída salvar

        //Indicando sucesso
        alertSucesso = document.createElement('div');
        alertSucesso.innerHTML = gerarAlert(1, 'PDF Gerado com sucesso!');
        pagina.prepend(alertSucesso);

        setTimeout(() => {
            alertSucesso.remove();
        }, 5000);

        if (pageBreaker) {
            pageBreaker.style.display = 'block';
        }
    });
}

function gerarAlert(modo, mensagem) {
    let cor = (modo == 0) ? 'danger' : 'success';
    let template =
        `<div class="alert alert-${cor} m-2" role="alert">
            <p class="text-center fw-bold h2">
                ${mensagem}
            </p>
        </div>`
    return template;
}
