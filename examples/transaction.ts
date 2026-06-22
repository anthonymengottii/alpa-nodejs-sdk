/**
 * Exemplo: Criar e gerenciar transações
 */

import AlpaClient from '../src/index';

async function exemploTransacao() {
  // Inicializar cliente
  const alpa = new AlpaClient({
    apiKey: process.env.ALPA_API_KEY || 'sua_api_key_aqui',
  });

  try {
    // 1. Criar uma transação PIX
    console.log('💳 Criando transação PIX...');
    const transaction = await alpa.transactions.create({
      product: 'Produto Teste',
      amountCents: 5000, // R$ 50,00
      paymentMethod: 'PIX',
      clientName: 'João Silva',
      clientEmail: 'joao@example.com',
      clientDocument: '12345678900',
      clientPhone: '11999999999',
      metadata: {
        orderId: '12345',
        source: 'website',
      },
    });

    console.log('✅ Transação criada!');
    console.log('ID:', transaction.id);
    console.log('Status:', transaction.status);

    if (transaction.pixCopiaECola) {
      console.log('Código PIX (copia e cola):', transaction.pixCopiaECola);
    }
    if (transaction.pixExpiresAt) {
      console.log('Expira em:', transaction.pixExpiresAt);
    }

    // 2. Consultar transação
    console.log('\n🔍 Consultando transação...');
    const tx = await alpa.transactions.get(transaction.id);
    console.log('Status atual:', tx.status);
    console.log('Valor:', `R$ ${(tx.amountCents / 100).toFixed(2)}`);

    // 3. Listar transações
    console.log('\n📋 Listando transações...');
    const { data: transactions, pagination } = await alpa.transactions.list({
      page: 1,
      limit: 10,
      status: 'PAID',
    });

    console.log(`Total: ${pagination.total} transações pagas`);
    transactions.forEach(t => {
      console.log(`- ${t.product}: R$ ${(t.amountCents / 100).toFixed(2)} - ${t.status}`);
    });

    // 4. Criar transação com cupom
    console.log('\n🎟️ Validando cupom...');
    const validation = await alpa.coupons.validate({
      code: 'DESCONTO10',
      amountCents: 10000, // R$ 100,00
    });

    if (validation.valid) {
      console.log('Cupom válido!');
      console.log('Desconto:', `R$ ${(validation.discountCents! / 100).toFixed(2)}`);
      console.log('Valor final:', `R$ ${(validation.finalAmountCents! / 100).toFixed(2)}`);

      const txWithCoupon = await alpa.transactions.create({
        product: 'Produto com Desconto',
        amountCents: validation.finalAmountCents!,
        paymentMethod: 'PIX',
        couponCode: 'DESCONTO10',
        clientName: 'Maria Santos',
        clientEmail: 'maria@example.com',
      });

      console.log('✅ Transação com cupom criada:', txWithCoupon.id);
    }

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error);
  }
}

// Executar exemplo quando rodado diretamente
const isMainModule =
  (typeof require !== 'undefined' && require.main === module) ||
  (typeof import.meta !== 'undefined' && import.meta.url &&
   process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]);

if (isMainModule) {
  exemploTransacao();
}

export default exemploTransacao;
