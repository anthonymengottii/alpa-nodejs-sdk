/**
 * Exemplo: Criar e gerenciar links de pagamento
 */

import AlpaClient from '../src/index';

async function exemploPaymentLink() {
  // Inicializar cliente
  const alpa = new AlpaClient({
    apiKey: process.env.ALPA_API_KEY || 'sua_api_key_aqui',
  });

  try {
    // 1. Criar um link de pagamento simples
    console.log('📝 Criando link de pagamento...');
    const paymentLink = await alpa.paymentLinks.create({
      title: 'Produto Premium',
      description: 'Acesso completo à plataforma',
      amountCents: 9900, // R$ 99,00
      currency: 'BRL',
      settings: {
        pixEnabled: true,
        creditCardEnabled: true,
        boletoEnabled: true,
        maxInstallments: 12,
        interestFreeInstallments: 3,
        requirePhone: true,
        requireAddress: false,
      },
    });

    console.log('✅ Link criado com sucesso!');
    console.log('ID:', paymentLink.id);
    // A própria API retorna a URL pública do checkout
    console.log('URL do checkout:', paymentLink.url);

    // 2. Criar link com produtos
    console.log('\n📦 Criando link com produtos...');
    const productLink = await alpa.paymentLinks.create({
      title: 'Pacote Completo',
      description: 'Pacote com múltiplos produtos',
      products: [
        { productId: 'produto-id-1', quantity: 2 },
        { productId: 'produto-id-2', quantity: 1 },
      ],
      currency: 'BRL',
      settings: {
        pixEnabled: true,
        creditCardEnabled: true,
      },
    });

    console.log('✅ Link com produtos criado!');
    console.log('URL:', productLink.url);

    // 3. Listar links
    console.log('\n📋 Listando links de pagamento...');
    const { data: links, pagination } = await alpa.paymentLinks.list({
      page: 1,
      limit: 10,
      status: 'ACTIVE',
    });

    console.log(`Total: ${pagination.total} links`);
    links.forEach(link => {
      console.log(`- ${link.title}: ${link.url}`);
    });

    // 4. Atualizar link
    console.log('\n✏️ Atualizando link...');
    const updatedLink = await alpa.paymentLinks.update(paymentLink.id, {
      description: 'Descrição atualizada',
      amountCents: 12000, // R$ 120,00
    });

    console.log('✅ Link atualizado!');
    console.log('Nova descrição:', updatedLink.description);
    console.log('Novo valor:', updatedLink.amountCents);

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error);
  }
}

// Executar exemplo
if (require.main === module) {
  exemploPaymentLink();
}

export default exemploPaymentLink;
