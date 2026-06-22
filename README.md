<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/light.png">
    <source media="(prefers-color-scheme: light)" srcset="logo/dark.png">
    <img src="logo/dark.png" alt="Alpa" height="60">
  </picture>
</p>

# Alpa Node.js SDK

SDK oficial da Alpa para JavaScript/TypeScript. Integre PIX, cartão de crédito e boleto em minutos. Compatível com Node.js 18+, Bun e edge runtimes.

## 📦 Instalação

O SDK ainda não está publicado no npm. Instale direto do GitHub:

```bash
npm install github:anthonymengottii/alpa-nodejs-sdk
```

## 🚀 Início rápido

```typescript
import AlpaClient from '@alpa/alpa-js';

const alpa = new AlpaClient({ apiKey: process.env.ALPA_API_KEY });
```

> O ambiente (desenvolvimento ou produção) é determinado pela **chave** usada. O mesmo `baseUrl` (`https://alpa-sistema-api.onrender.com`) atende ambos.

### Criar um Link de Pagamento

```typescript
const link = await alpa.paymentLinks.create({
  title: 'Produto Premium',
  amountCents: 9900, // R$ 99,00
  description: 'Acesso vitalício',
});

console.log('Checkout:', alpa.paymentLinks.getCheckoutUrl(link.slug)); // https://checkout.usealpa.com/pay/abc123
```

### Criar uma Transação PIX

```typescript
const tx = await alpa.transactions.create({
  product: 'Curso Node.js',
  amountCents: 19900, // R$ 199,00
  paymentMethod: 'PIX',
  clientName: 'João Silva',
  clientEmail: 'joao@example.com',
  clientDocument: '12345678900',
});

console.log('PIX copia e cola:', tx.pixCopiaECola);
console.log('Expira em:', tx.pixExpiresAt);
```

### Listar Transações

```typescript
const { data: transactions, pagination } = await alpa.transactions.list({
  page: 1,
  limit: 20,
  status: 'PAID',
});

console.log(`Total: ${pagination.total}`);
transactions.forEach(tx => {
  console.log(`${tx.product}: R$ ${(tx.amountCents / 100).toFixed(2)}`);
});
```

### Gerenciar Produtos

```typescript
const product = await alpa.products.create({
  name: 'Produto Exemplo',
  price: 9900, // centavos
  stockQuantity: 100,
  stockEnabled: true,
});

await alpa.products.update(product.id, { price: 8900 });
```

### Validar Cupom

```typescript
const result = await alpa.coupons.validate({
  code: 'DESCONTO10',
  amountCents: 19900,
});

if (result.valid) {
  console.log(`Desconto: R$ ${(result.discountCents! / 100).toFixed(2)}`);
  console.log(`Final: R$ ${(result.finalAmountCents! / 100).toFixed(2)}`);
}
```

## 🔔 Webhooks

A Alpa assina cada webhook com **HMAC-SHA256 (hex)** no header `X-Webhook-Signature`. O envelope entregue tem o formato `{ id, type, data, timestamp, subscription }`.

```typescript
import express from 'express';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = alpa.extractWebhookSignature(req.headers); // lê x-webhook-signature
  const secret = process.env.ALPA_WEBHOOK_SECRET!;

  if (!signature || !alpa.verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Assinatura inválida' });
  }

  const event = JSON.parse(req.body.toString());

  switch (event.type) {
    case 'transaction.completed':
      console.log('Pagamento confirmado:', event.data);
      break;
    case 'transaction.failed':
      console.log('Pagamento falhou:', event.data);
      break;
  }

  res.json({ received: true });
});
```

### Eventos disponíveis

`transaction.created`, `transaction.updated`, `transaction.completed`, `transaction.failed`, `transaction.refunded`, `payment_link.created`, `payment_link.updated`, `balance.updated`, `subscription.cancelled`, `kyc.submitted`, `kyc.approved`, `kyc.rejected`, `advance.created`, `advance.approved`, `advance.rejected`, `withdrawal.requested`, `withdrawal.completed`, `withdrawal.failed`.

Disponíveis via enum `WebhookEventType`.

## 🔧 Configuração

```typescript
const alpa = new AlpaClient({
  apiKey: 'sua_api_key',   // Obrigatório
  baseUrl: 'https://...',  // Opcional (padrão: https://alpa-sistema-api.onrender.com)
  version: 'v1',           // Opcional (padrão: 'v1')
  timeout: 30000,          // Opcional (padrão: 30000ms)
});
```

## 🛠️ Tratamento de Erros

```typescript
import {
  AlpaError,
  AlpaAuthenticationError,
  AlpaValidationError,
  AlpaNotFoundError,
  AlpaRateLimitError,
} from '@alpa/alpa-js';

try {
  await alpa.paymentLinks.create({ title: 'Test', amountCents: 9900 });
} catch (error) {
  if (error instanceof AlpaAuthenticationError) {
    console.error('Erro de autenticação:', error.message);
  } else if (error instanceof AlpaValidationError) {
    console.error('Erro de validação:', error.message, error.details);
  } else if (error instanceof AlpaRateLimitError) {
    console.error('Limite de requisições excedido');
  } else if (error instanceof AlpaError) {
    console.error(`Erro ${error.statusCode}:`, error.message);
  }
}
```

## 📚 Recursos disponíveis

`paymentLinks`, `transactions`, `products`, `coupons`, `clients`, `subscriptions`, `checkouts`, `offers`, `withdrawals`, `wallet`.

## 📖 Exemplos completos

Veja a pasta `examples/`:
- `payment-link.ts`
- `transaction.ts`
- `webhook.ts`

## 🔗 Links úteis

- [Documentação](https://docs.usealpa.com)
- [Dashboard](https://app.usealpa.com)
- [Suporte](mailto:suporte@usealpa.com)
- [Repositório](https://github.com/anthonymengottii/alpa-nodejs-sdk)

## 📝 Licença

MIT
