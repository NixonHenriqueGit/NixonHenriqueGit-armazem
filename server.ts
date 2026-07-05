import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Main server API proxy endpoint for Gemini AI auditing
app.post('/api/gemini/analise', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Por favor, configure sua chave GEMINI_API_KEY nas Configurações > Secrets do projeto para liberar este recurso.' 
    });
  }

  const {
    empresa,
    componeteRepack,
    caixasDespejadas,
    quebrasAvarias,
    lotesValidadeCriticos,
    faturamentoJanelaPct,
    mediasRefugoBlitz,
    estabilidadeGeralScore
  } = req.body;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `Você é um auditor virtual sênior de excelência logística da Ambev, mestre em diretrizes DPO (Distribution Process Optimisation).
Analise de forma extremamente profissional, objetiva, assertiva e realista as seguintes métricas coletadas da empresa "${empresa}":

- Total de Repack de garrafas: ${componeteRepack} unidades recuperadas.
- Total de Despejo de líquidos baixados: ${caixasDespejadas} caixas.
- Quebras e avarias internas atestadas: ${quebrasAvarias} unidades descartadas.
- Quantidade de lotes com validade crítica (FEFO ≤30 dias): ${lotesValidadeCriticos} SKUs sob perigo.
- Pontualidade de carregamento na janela ideal (07:00 - 21:00): ${faturamentoJanelaPct}%.
- Média de peças danificadas por Blitz de refugo de retornáveis: ${mediasRefugoBlitz} defeitos/veículo.
- Nosso Score Ponderado Geral de Estabilidade e Perdas: ${estabilidadeGeralScore}% de suficiência.

Escreva um relatório analítico contendo:
1. **IMPACTOS E CRÍTICA GERAL**: Avaliação realista das perdas e desvios de processo (DPO) conforme as métricas.
2. **PLANO DE AÇÃO CORRETIVA EXECUTIVO (4 Bullets)**: 4 recomendações técnicas e operacionais claras para implantar imediatamente no pátio para mitigar perdas, aprimorar a separação, reforçar conferência ou segurar faturamentos tardios.
3. Use tom de liderança Ambev, motivador e focado em eficiência. Formate tudo em Markdown direto, elegante, sem cabeçalhos html gigantes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    const reportText = response.text || 'O auditor não conseguiu formular a resposta.';
    res.json({ report: reportText });

  } catch (error: any) {
    console.error('Error contacting Gemini API:', error);
    res.status(500).json({ error: error.message || 'Erro inesperado na chamada ao robô.' });
  }
});

// Configure Vite middleware as SPA router or serve static contents in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Armazém Fácil Workspace] Server listening on port ${PORT}`);
  });
}

startServer();
