// api/gerar-roteiro.js

export default async function handler(req, res) {
    // Garantimos que a rota só aceite requisições POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const { nomeDaPraia } = req.body;
    
    // Puxa a chave de API das variáveis de ambiente do Vercel (ou do arquivo .env local)
    const API_KEY = process.env.GEMINI_API_KEY; 

    if (!API_KEY) {
        return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    const promptTexto = `Crie um roteiro turístico detalhado para a ${nomeDaPraia}. 
    O roteiro DEVE abordar obrigatoriamente: segurança, beleza natural, qualidade da água do mar, avaliação/pontuação dos turistas, gastronomia local e opções de hospedagem.
    Retorne a resposta diretamente em formato HTML limpo, utilizando APENAS as tags <h3>, <p>, <ul> e <li>. Não utilize a tag <h1> nem blocos de código markdown (\`\`\`html).`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptTexto }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Erro na comunicação com a API do Gemini.');
        }

        const respostaDaIA = data.candidates[0].content.parts[0].text;

        // Retorna o conteúdo gerado de volta para o frontend com sucesso (Status 200)
        return res.status(200).json({ roteiro: respostaDaIA });

    } catch (error) {
        console.error("Erro no servidor Vercel:", error);
        return res.status(500).json({ error: 'Falha ao processar o roteiro no servidor.' });
    }
}