import { ProductsResource } from '../../src/resources/Products';
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

describe('ProductsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: ProductsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new ProductsResource(http as unknown as HttpClient);
  });

  describe('create', () => {
    it('chama POST /products', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'prod_1', name: 'Produto', price: 9900 });
      const result = await resource.create({ name: 'Produto', price: 9900, stockQuantity: 100 });
      expect(http.post).toHaveBeenCalledWith('/products', expect.objectContaining({ name: 'Produto', price: 9900 }));
      expect(result).toMatchObject({ id: 'prod_1' });
    });

    it('lança quando nome vazio', async () => {
      await expect(resource.create({ name: '', price: 9900 } as never)).rejects.toThrow('Nome do produto');
    });

    it('lança quando preço abaixo do mínimo', async () => {
      await expect(resource.create({ name: 'X', price: 50 })).rejects.toThrow('Preço mínimo');
    });
  });

  describe('list', () => {
    it('normaliza resposta', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [{ id: 'prod_1' }], pagination: { total: 1 } });
      const result = await resource.list();
      expect(http.get).toHaveBeenCalledWith('/products', expect.any(Object));
      expect(result.data).toEqual([{ id: 'prod_1' }]);
    });
  });

  describe('update', () => {
    it('lança quando preço inválido', async () => {
      await expect(resource.update('prod_1', { price: 50 })).rejects.toThrow('Preço mínimo');
    });

    it('chama PATCH /products/:id', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 'prod_1' });
      await resource.update('prod_1', { price: 12000 });
      expect(http.patch).toHaveBeenCalledWith('/products/prod_1', { price: 12000 });
    });
  });

  describe('delete', () => {
    it('chama DELETE /products/:id', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.delete('prod_1');
      expect(http.delete).toHaveBeenCalledWith('/products/prod_1');
    });
  });
});
