import { PaymentLinksResource } from '../../src/resources/PaymentLinks';
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

describe('PaymentLinksResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: PaymentLinksResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new PaymentLinksResource(http as unknown as HttpClient);
  });

  describe('create', () => {
    it('envia amountCents e retorna objeto com url', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'lnk_1', amountCents: 9900, url: 'https://checkout.usealpa.com/pay/abc' });

      const result = await resource.create({ title: 'Produto Premium', amountCents: 9900 });

      expect(http.post).toHaveBeenCalledWith('/payment-links', expect.objectContaining({ amountCents: 9900 }));
      expect(result.url).toBe('https://checkout.usealpa.com/pay/abc');
    });

    it('aceita alias deprecado `amount` mapeando para amountCents', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'lnk_2' });
      await resource.create({ title: 'Legado', amount: 5000 } as never);
      expect(http.post).toHaveBeenCalledWith('/payment-links', expect.objectContaining({ amountCents: 5000 }));
    });

    it('lança quando título < 3 chars', async () => {
      await expect(resource.create({ title: 'ab', amountCents: 9900 })).rejects.toThrow('Título');
    });

    it('lança quando sem amountCents e sem products', async () => {
      await expect(resource.create({ title: 'Sem valor' } as never)).rejects.toThrow('amountCents ou products');
    });

    it('lança quando amountCents abaixo do mínimo', async () => {
      await expect(resource.create({ title: 'Barato', amountCents: 50 })).rejects.toThrow('Valor mínimo');
    });
  });

  describe('get', () => {
    it('chama GET /payment-links/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'lnk_1' });
      const result = await resource.get('lnk_1');
      expect(http.get).toHaveBeenCalledWith('/payment-links/lnk_1');
      expect(result).toMatchObject({ id: 'lnk_1' });
    });

    it('lança quando id vazio', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('update', () => {
    it('mapeia amountCents no PATCH', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 'lnk_1' });
      await resource.update('lnk_1', { amountCents: 12000 });
      expect(http.patch).toHaveBeenCalledWith('/payment-links/lnk_1', { amountCents: 12000 });
    });
  });

  describe('delete', () => {
    it('chama DELETE /payment-links/:id', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.delete('lnk_1');
      expect(http.delete).toHaveBeenCalledWith('/payment-links/lnk_1');
    });
  });

  describe('getCheckoutUrl', () => {
    it('monta url no domínio pay.usealpa.com', () => {
      expect(resource.getCheckoutUrl('meu-slug')).toBe('https://checkout.usealpa.com/pay/meu-slug');
    });
  });
});
