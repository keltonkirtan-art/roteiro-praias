// Seletores do DOM
const beachSelect = document.getElementById('beach-select');
const generateBtn = document.getElementById('generate-btn');
const outputArea = document.getElementById('output-area');
const pdfContent = document.getElementById('pdf-content');
const downloadBtn = document.getElementById('download-btn');
const openWindowBtn = document.getElementById('open-window-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');

// Variável global para armazenar o HTML do roteiro gerado
let roteiroHtmlAtual = "";

// Mapeamento dos nomes reais das praias para o prompt da IA
const nomesPraias = {
    sancho: "Baía do Sancho, Fernando de Noronha - PE",
    carneiros: "Praia dos Carneiros, Tamandaré - PE",
    espelho: "Praia do Espelho, Trancoso - BA",
    jeri: "Jericoacoara, CE",
    patacho: "Praia do Patacho, AL",
    taipu: "Taipu de Fora, BA",
    rosa: "Praia do Rosa, SC",
    campeche: "Ilha do Campeche, SC",
    muroalto: "Muro Alto, PE",
    pitinga: "Praia da Pitinga, BA",
    // Novas praias adicionadas
    praiadoforte: "Praia do Forte, Mata de São João - BA",
    maragogi: "Maragogi - AL",
    pipa: "Praia da Pipa, Tibau do Sul - RN",
    arraialdocabo: "Arraial do Cabo - RJ",
    caraiva: "Caraíva, Porto Seguro - BA"
};

// Ação: Gerar Roteiro via API do Vercel (Serverless Function)
generateBtn.addEventListener('click', async () => {
    const praiaId = beachSelect.value;
    
    if (!praiaId) {
        alert("Por favor, selecione uma praia antes de gerar o roteiro.");
        return;
    }

    const nomeDaPraia = nomesPraias[praiaId];
    nomeDaPraiaGlobal = nomeDaPraia;
    
    // Feedback visual de carregamento
    generateBtn.innerText = "Gerando Roteiro (Aguarde)...";
    generateBtn.disabled = true;
    outputArea.classList.add('hidden');

    try {
        // Aponta para a nossa Serverless Function no backend do Vercel
        const response = await fetch('/api/gerar-roteiro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nomeDaPraia: nomeDaPraia })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro na resposta do servidor.');
        }

        // Montar o layout do Roteiro (que vai pro PDF e pra Nova Janela)
        roteiroHtmlAtual = `
            <div class="roteiro-title">
                <h1>${nomeDaPraia}</h1>
            </div>
            <div class="roteiro-content">
                ${data.roteiro}
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 0.8rem; color: #666;">
                <p>Gerado por Roteiro Praias App via Inteligência Artificial</p>
            </div>
        `;

        // Salva o HTML no container invisível para o PDF
        pdfContent.innerHTML = roteiroHtmlAtual;

        // Restaura o botão e exibe a área de sucesso com os botões
        generateBtn.innerText = "Gerar Roteiro";
        generateBtn.disabled = false;
        outputArea.classList.remove('hidden');

    } catch (error) {
        console.error("Erro no Frontend:", error);
        alert("Houve um erro ao gerar o roteiro. Tente novamente mais tarde.");
        generateBtn.innerText = "Gerar Roteiro";
        generateBtn.disabled = false;
    }
});

// Ação: Baixar em PDF
downloadBtn.addEventListener('click', () => {
    pdfContent.classList.remove('hidden');

    const config = {
        margin: 15,
        filename: 'Meu_Roteiro_Praias.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(config).from(pdfContent).save().then(() => {
        pdfContent.classList.add('hidden');
    });
});

// Ação: Abrir Janela (Sem document.write!)
openWindowBtn.addEventListener('click', () => {
    const novaJanela = window.open('', '_blank');
    
    const conteudoHTML = `
        <head>
            <title>Roteiro: Praias</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; background-color: #fafafa;}
                .roteiro-title { color: #0077b6; text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #ffb703; padding-bottom: 1rem;}
                .roteiro-content { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);}
                h3 { color: #00b4d8; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                p { margin-bottom: 1rem; }
                ul { margin-bottom: 1rem; padding-left: 1.5rem; }
                li { margin-bottom: 0.5rem; }
                .print-btn { display: block; width: 100%; padding: 1rem; background: #0077b6; color: white; text-align: center; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 2rem; border: none; cursor: pointer;}
                @media print { .print-btn { display: none; } body { background-color: white;} .roteiro-content { box-shadow: none; padding: 0;} }
            </style>
        </head>
        <body>
            ${roteiroHtmlAtual}
            <button class="print-btn" onclick="window.print()">Imprimir Roteiro</button>
        </body>
    `;

    // Injeta o HTML na nova aba
    novaJanela.document.documentElement.innerHTML = conteudoHTML;
});

// Ação: Compartilhar no WhatsApp
whatsappBtn.addEventListener('click', () => {
    // Pegamos a URL atual onde o app está rodando
    const linkDoApp = "https://roteiro-praias.vercel.app/";
    const mensagem = ` Olha que sensacional o roteiro que eu gerei para a ${nomeDaPraiaGlobal}! Venha gerar o seu roteiro de viagem também: ${linkDoApp}`;
    
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
});