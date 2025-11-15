document.addEventListener('DOMContentLoaded', () => {
    let acionador = document.getElementById("gerarServer"); let secaoImprimir = document.getElementById("impressao");
    chartPizzaImg = gerarGraficoPizza();
    chartBarraImg = gerarGraficoBarra();

    acionador.addEventListener('click', () => {
        //Captura o formulário e adiciona o elemento de input para adição dos arquivos
        setupTransferencia(secaoImprimir, [chartPizzaImg, chartBarraImg])
    });
});

//A ser feito(Transfências de arquivos bem mais complexa no symfony, camadas de segurança, etc)
async function setupTransferencia(markup, imagens) {
}

function gerarGraficoPizza() {
    const data = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [{
            label: 'Sample',
            data: [12, 19, 7, 10, 5],
            backgroundColor: [
                '#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };

    const config = {
        type: 'pie',
        data,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const value = ctx.parsed;
                            const dataset = ctx.dataset.data;
                            const total = dataset.reduce((a, b) => a + b, 0);
                            const pct = total ? (value / total * 100).toFixed(1) : 0;
                            return `${ctx.label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('chartPie');
    let pieChart = new Chart(ctx, config);
    return pieChart.toBase64Image();
}

function gerarGraficoBarra() {
    const barData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Vendas',
            data: [12, 19, 9, 14, 7, 11],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }]
    };

    const barConfig = {
        type: 'bar',
        data: barData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true }
            }
        }
    };

    const barCtx = document.getElementById('chartBar');
    let barChart = new Chart(barCtx, barConfig);
    return barChart.toBase64Image();
}
