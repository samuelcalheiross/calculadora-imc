document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('imcForm');
    const tabela = document.querySelector('#historico tbody');
    const resultadoDiv = document.getElementById('resultado');
    const ctx = document.getElementById('graficoIMC').getContext('2d');
    const limparBtn = document.getElementById('limparBtn');
    

    let dados = JSON.parse(localStorage.getItem('historicoIMC')) || [];

    limparBtn.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
            dados = [];
            localStorage.removeItem('historicoIMC');
            atualizarTabela();
            gerarGrafico();
            resultadoDiv.innerHTML = '';
        }
        });
    

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const altura = parseFloat(document.getElementById('altura').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const data = document.getElementById('data').value;

        


        if (altura <= 0 || peso <= 0) {
            alert("Insira valores válidos.");
            return;
        }
        
        const imc = (peso / (altura * altura)).toFixed(2);
        const classificacao = classificarIMC(imc);


        const registro = { data, peso, altura, imc, classificacao };
        dados.push(registro);
        localStorage.setItem('historicoIMC', JSON.stringify(dados));
        atualizarTabela();
        gerarGrafico();
    });

    function classificarIMC(imc) {
        imc = parseFloat(imc);
        let faixa = "";
        let mensagem = "";
    
        if (imc < 18.5) {
            faixa = "Abaixo do peso";
            mensagem = "Procure um nutricionista. Você pode estar desnutrido.";
        } else if (imc < 25) {
            faixa = "Peso normal";
            mensagem = "Continue mantendo hábitos saudáveis!";
        } else if (imc < 30) {
            faixa = "Sobrepeso";
            mensagem = "Cuidado com a alimentação. Faça atividades físicas.";
        } else if (imc < 35) {
            faixa = "Obesidade grau 1";
            mensagem = "Recomenda-se acompanhamento médico e nutricional.";
        } else if (imc < 40) {
            faixa = "Obesidade grau 2";
            mensagem = "Procure ajuda profissional para controlar seu peso.";
        } else {
            faixa = "Obesidade grau 3";
            mensagem = "Risco alto à saúde. É fundamental acompanhamento médico.";
        }
    
        resultadoDiv.innerHTML = `IMC: ${imc} (${faixa})<br>Recomendação: ${mensagem}`;
    
        return faixa;
    }
    
    

    function atualizarTabela() {
        tabela.innerHTML = '';
        dados.forEach(dado => {
            const row = tabela.insertRow();
            row.innerHTML = `
                <td>${dado.data}</td>
                <td>${dado.peso}</td>
                <td>${dado.altura}</td>
                <td>${dado.imc}</td>
                <td>${dado.classificacao}</td>
            `;
        });
    }

    function gerarGrafico() {
        const labels = dados.map(d => d.data);
        const valores = dados.map(d => d.imc);

        if (window.grafico) window.grafico.destroy(); 

        window.grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'IMC',
                    data: valores,
                    borderColor: 'blue',
                    backgroundColor: 'lightblue',
                    tension: 0.3
                }]
            }
        });
    }

    document.getElementById('gerarPDF').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const resultado = document.getElementById('resultado');
    const tabela = document.getElementById('historico');
    const grafico = document.getElementById('graficoIMC');

    doc.setFontSize(16);
    doc.text("Relatório de IMC", 20, 20);

    doc.setFontSize(12);
    doc.text(resultado.innerText || "Nenhum resultado atual.", 20, 30);

    let y = 40;
    const headers = ["Data", "Peso", "Altura", "IMC", "Classificação"];
    doc.autoTable({
        startY: y,
        head: [headers],
        body: Array.from(tabela.rows).map(row =>
            Array.from(row.cells).map(cell => cell.innerText)
        ),
        theme: 'striped'
    });

    await html2canvas(grafico).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Gráfico de Evolução do IMC", 20, 20);
        doc.addImage(imgData, 'PNG', 15, 30, 180, 100);
    });

    doc.save("relatorio_imc.pdf");
});


    atualizarTabela();
    gerarGrafico();
});
