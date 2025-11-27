document.addEventListener('DOMContentLoaded', () => {
    //Capturando o acionador para impressão
    let acionador = document.querySelector("#acionador");
    acionador.addEventListener('click', gerarPdf);
});

/**
 * Gera PDF usando a API Anvil através do backend
 * A geração é feita no servidor, proporcionando melhor qualidade e texto selecionável
 */
async function gerarPdf() {
    //Feedback para o usuário
    let alert = document.createElement('div');
    let pagina = document.querySelector('#impressao');
    alert.innerHTML = gerarAlert(0, 'Aguarde a Geração do PDF!');
    pagina.prepend(alert);

    try {
        // Elementos que serão convertidos em PDF
        const pagina1 = document.querySelector("#pagina1");
        const pagina2 = document.querySelector("#pagina2");

        // Oculta o separador de página da renderização final no PDF
        const pageBreaker = document.querySelector(".page-break");
        if (pageBreaker) {
            pageBreaker.style.display = 'none';
        }

        // Converte gráficos canvas para imagens de alta qualidade
        const canvasElements = document.querySelectorAll('canvas');
        const canvasImages = new Map();

        canvasElements.forEach(canvas => {
            try {
                // Usar scale 2x para balancear qualidade e tamanho de arquivo
                const scale = 2;
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');

                // Define dimensões com escala
                tempCanvas.width = canvas.width * scale;
                tempCanvas.height = canvas.height * scale;

                // Configura renderização de alta qualidade
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Escala o contexto
                ctx.scale(scale, scale);

                // Desenha o canvas original com antialiasing
                ctx.drawImage(canvas, 0, 0);

                // Converte para PNG de alta qualidade com compressão balanceada
                const imgData = tempCanvas.toDataURL('image/png', 0.95);
                canvasImages.set(canvas, imgData);
            } catch (e) {
                console.warn('Não foi possível converter canvas:', e);
            }
        });

        // Função para extrair estilos completos dos elementos
        function getElementStyles(element) {
            const styles = window.getComputedStyle(element);
            let styleString = '';

            // Propriedades CSS importantes para preservar layout e aparência
            const importantProps = [
                'display', 'position', 'width', 'height', 'margin', 'padding',
                'font-family', 'font-size', 'font-weight', 'color', 'background-color',
                'background-image', 'border', 'border-radius', 'text-align',
                'line-height', 'flex', 'flex-direction', 'justify-content', 'align-items'
            ];

            for (let prop of importantProps) {
                const value = styles.getPropertyValue(prop);
                if (value) {
                    styleString += `${prop}: ${value}; `;
                }
            }

            return styleString;
        }

        // Função para clonar elemento com estilos inline
        function cloneWithStyles(element) {
            const clone = element.cloneNode(true);
            const allElements = clone.querySelectorAll('*');
            const originalElements = element.querySelectorAll('*');

            // Aplica estilos inline no elemento raiz
            clone.setAttribute('style', getElementStyles(element));

            // Aplica estilos inline em todos os elementos filhos
            allElements.forEach((el, index) => {
                if (originalElements[index]) {
                    el.setAttribute('style', getElementStyles(originalElements[index]));
                }
            });

            // Substitui canvas por imagens mantendo dimensões e centralizando
            const clonedCanvases = clone.querySelectorAll('canvas');
            clonedCanvases.forEach((clonedCanvas, idx) => {
                const originalCanvas = Array.from(canvasElements)[idx];
                if (originalCanvas && canvasImages.has(originalCanvas)) {
                    const img = document.createElement('img');
                    img.src = canvasImages.get(originalCanvas);

                    // Container para centralizar e proteger contra quebras
                    const container = document.createElement('div');
                    container.style.cssText = `
                        page-break-inside: avoid;
                        break-inside: avoid;
                        margin: 20px 0;
                        text-align: center;
                        width: 100%;
                    `;

                    // Preserva dimensões proporcionais
                    const computedStyle = window.getComputedStyle(originalCanvas);
                    img.style.cssText = `
                        max-width: 100%;
                        height: auto;
                        display: inline-block;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    `;

                    // Define largura máxima para evitar cortes
                    const parentWidth = originalCanvas.parentElement?.offsetWidth || 600;
                    if (parentWidth < originalCanvas.width) {
                        img.style.width = '100%';
                    } else {
                        img.style.width = computedStyle.width;
                    }

                    container.appendChild(img);
                    clonedCanvas.parentNode.replaceChild(container, clonedCanvas);
                }
            });

            return clone;
        }

        // Clona as páginas com estilos
        const pagina1Clone = cloneWithStyles(pagina1);
        const pagina2Clone = cloneWithStyles(pagina2);

        // CSS otimizado para PDF - previne quebras de página e corte de imagens
        const cssContent = `
            @page {
                margin: 20mm;
                size: A4 portrait;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 100%;
                padding: 15px;
            }
            .card {
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 20px;
                padding: 15px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                page-break-inside: avoid;
            }
            .table th, .table td {
                padding: 10px;
                border: 1px solid #ddd;
                text-align: left;
                font-size: 11pt;
            }
            .table th {
                background-color: #f5f5f5;
                font-weight: 600;
            }
            .page-break {
                page-break-after: always;
                break-after: page;
                height: 0;
                margin: 0;
                padding: 0;
            }
            img, canvas {
                max-width: 100%;
                height: auto;
                display: block;
                page-break-inside: avoid;
                break-inside: avoid;
                margin: 10px auto;
            }
            .chart-container, [class*="chart"] {
                page-break-inside: avoid;
                break-inside: avoid;
                margin: 15px 0;
            }
            h1, h2, h3, h4, h5, h6 {
                margin: 15px 0 10px 0;
                page-break-after: avoid;
                break-after: avoid;
            }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            p {
                margin: 8px 0;
                orphans: 3;
                widows: 3;
            }
            .row {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        `;

        // Combina o HTML das páginas com estilos completos e meta tags para PDF
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${cssContent}</style>
            </head>
            <body>
                ${pagina1Clone.innerHTML}
                <div class="page-break"></div>
                ${pagina2Clone.innerHTML}
            </body>
            </html>
        `;

        // Envia requisição para o backend
        const response = await fetch('/api/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: htmlContent,
                title: 'documento.pdf',
                pageSize: 'A4',
                orientation: 'portrait',
                margin: '20px'
            })
        });

        if (!response.ok) {
            // Tenta obter detalhes do erro
            let errorMessage = 'Erro ao gerar PDF';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
                if (errorData.help) {
                    errorMessage += '\n\n' + errorData.help;
                }
            } catch (e) {
                errorMessage += ` (Status: ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        // Recebe o PDF como blob
        const blob = await response.blob();

        // Cria um link para download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Remove alerta de aguarde
        alert.remove();

        // Indicando sucesso
        const alertSucesso = document.createElement('div');
        alertSucesso.innerHTML = gerarAlert(1, 'PDF Gerado com sucesso!');
        pagina.prepend(alertSucesso);

        setTimeout(() => {
            alertSucesso.remove();
        }, 5000);

        // Restaura o separador de página
        if (pageBreaker) {
            pageBreaker.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);

        // Remove alerta de aguarde
        alert.remove();

        // Tenta obter mais detalhes do erro se disponível
        let errorMessage = 'Erro ao gerar PDF. ';

        if (error.message) {
            errorMessage += error.message;
        }

        // Se for um erro de resposta, tenta buscar detalhes
        if (error instanceof Response) {
            error.json().then(data => {
                if (data.error) {
                    errorMessage = data.error;
                }
                if (data.help) {
                    errorMessage += ' - ' + data.help;
                }
            }).catch(() => { });
        }

        // Mostra erro
        const alertErro = document.createElement('div');
        alertErro.innerHTML = gerarAlert(0, errorMessage);
        pagina.prepend(alertErro);

        setTimeout(() => {
            alertErro.remove();
        }, 10000); // 10 segundos para ler a mensagem

        // Restaura o separador de página
        const pageBreaker = document.querySelector(".page-break");
        if (pageBreaker) {
            pageBreaker.style.display = 'block';
        }
    }
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
