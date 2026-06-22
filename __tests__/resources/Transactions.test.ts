import { TransactionsResource } from '../../src/resources/Transactions';
import { HttpClient } from '../../src/utils/http';

function makeHttp() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    baseUrl: 'https://test.example.com',
  } as unknown as HttpClient;
}

describe('TransactionsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: TransactionsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new TransactionsResource(http as unknown as HttpClient);
  });

  describe('create', () => {
    it('envia campos planos do cliente e retorna pixCopiaECola', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'tx_1', status: 'PENDING', pixCopiaECola: '00020101...' });

      const result = await resource.create({
        product: 'Curso Node.js',
        amountCents: 19900,
        paymentMethod: 'PIX',
        clientName: 'João Silva',
        clientEmail: 'joao@example.com',
        clientDocument: '12345678900',
      });

      expect(http.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        clientEmail: 'joao@example.com',
        amountCents: 19900,
      }));
      expect(result.pixCopiaECola).toBe('00020101...');
    });

    it('lança quando product vazio', async () => {
      await expect(resource.create({ product: '', amountCents: 19900, clientEmail: 'a@b.com' } as never)).rejects.toThrow('Produto');
    });

    it('lança quando abaixo do mínimo', async () => {
      await expect(resource.create({ product: 'X', amountCents: 50, clientEmail: 'a@b.com' } as never)).rejects.toThrow('Valor mínimo');
    });

    it('lança quando clientEmail ausente', async () => {
      await expect(resource.create({ product: 'X', amountCents: 19900 } as never)).rejects.toThrow('clientEmail');
    });
  });

  describe('get', () => {
    it('chama GET /transactions/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'tx_1' });
      await resource.get('tx_1');
      expect(http.get).toHaveBeenCalledWith('/transactions/tx_1');
    });

    it('lança quando id vazio', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('refund', () => {
    it('chama POST /transactions/:id/refund com amountCents', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'tx_1', status: 'REFUNDED' });
      await resource.refund('tx_1', 5000);
      expect(http.post).toHaveBeenCalledWith('/transactions/tx_1/refund', { amountCents: 5000 });
    });

    it('lança quando amountCents inválido', async () => {
      await expect(resource.refund('tx_1', -10)).rejects.toThrow('positive integer');
    });
  });
});
