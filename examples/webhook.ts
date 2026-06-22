/**
 * Exemplo: Processar webhooks
 */

import express from 'express';
import AlpaClient from '../src/index';

const app = express();
const alpa = new AlpaClient({
  apiKey: process.env.ALPA_API_KEY || 'sua_api_key_aqui',
});

// Middleware para capturar o body raw (necessário para verificar assinatura)
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
  try {
    // 1. Extrair assinatura do header (canônico: x-webhook-signature)
    const signature = alpa.extractWebhookSignature(req.headers);

    if (!signature) {
      console.warn('⚠️ Assinatura não encontrada no header');
      return res.status(401).json({ error: 'Assinatura não encontrada' });
    }

    // 2. Verificar assinatura
    const secret = process.env.ALPA_WEBHOOK_SECRET || 'seu_webhook_secret';
    const isValid = alpa.verifyWebhookSignature(req.body, signature, secret);

    if (!isValid) {
      console.warn('⚠️ Assinatura inválida');
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    // 3. Parse do evento. Envelope: { id, type, data, timestamp, subscription }
    const event = JSON.parse(req.body.toString());

    console.log('✅ Webhook recebido:', event.type);
    console.log('Dados:', JSON.stringify(event.data, null, 2));

    // 4. Processar evento
    switch (event.type) {
      case 'transaction.created':
        console.log('📝 Nova transação criada:', event.data.id);
        break;

      case 'transaction.completed':
        console.log('💰 Pagamento confirmado:', event.data.id);
        // Liberar produto/serviço, enviar email de confirmação
        break;

      case 'transaction.failed':
        console.log('❌ Transação falhou:', event.data.id);
        break;

      case 'transaction.refunded':
        console.log('↩️ Transação estornada:', event.data.id);
        break;

      case 'payment_link.created':
        console.log('🔗 Link de pagamento criado:', event.data.id);
        break;

      case 'payment_link.updated':
        console.log('✏️ Link de pagamento atualizado:', event.data.id);
        break;

      case 'balance.updated':
        console.log('💼 Saldo atualizado');
        break;

      default:
        console.log('ℹ️ Evento não tratado:', event.type);
    }

    // 5. Responder com sucesso
    res.json({ received: true });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Função para iniciar o servidor (não inicia automaticamente no import)
export function startServer(port?: number) {
  const PORT = port || process.env.PORT || 3000;
  return app.listen(PORT, () => {
    console.log(`🚀 Servidor de webhooks rodando na porta ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/webhook`);
  });
}

// Iniciar servidor apenas quando executado diretamente
const isMainModule =
  (typeof require !== 'undefined' && require.main === module) ||
  (typeof import.meta !== 'undefined' && import.meta.url &&
   process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]);

if (isMainModule) {
  startServer();
}

export default app;
