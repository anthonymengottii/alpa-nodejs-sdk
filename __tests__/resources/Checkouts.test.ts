import { CheckoutsResource } from '../../src/resources/Checkouts';
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

describe('CheckoutsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: CheckoutsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new CheckoutsResource(http as unknown as HttpClient);
  });

  describe('list', () => {
    it('calls GET /checkouts and normalizes response', async () => {
      const mockCheckout = { id: 'c1', name: 'Test' };
      (http.get as jest.Mock).mockResolvedValue({ checkouts: [mockCheckout], pagination: { total: 1, page: 1, limit: 10 } });

      const result = await resource.list({ page: 2 });

      expect(http.get).toHaveBeenCalledWith('/checkouts', expect.objectContaining({ page: 2 }));
      expect(result.data).toEqual([mockCheckout]);
    });

    it('falls back to data[] when checkouts key absent', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });

      const result = await resource.list();

      expect(result.data).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls POST /checkouts', async () => {
      const payload = { name: 'Checkout Teste', productId: 'p1' };
      (http.post as jest.Mock).mockResolvedValue({ id: 'c1', ...payload });

      const result = await resource.create(payload);

      expect(http.post).toHaveBeenCalledWith('/checkouts', payload);
      expect(result).toMatchObject({ id: 'c1' });
    });

    it('throws when name absent', async () => {
      await expect(resource.create({ name: '' } as any)).rejects.toThrow('Nome do checkout é obrigatório');
    });
  });

  describe('get', () => {
    it('calls GET /checkouts/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'c1' });
      const result = await resource.get('c1');
      expect(http.get).toHaveBeenCalledWith('/checkouts/c1');
      expect(result).toMatchObject({ id: 'c1' });
    });

    it('throws when id empty', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('update', () => {
    it('calls PUT /checkouts/:id', async () => {
      (http.put as jest.Mock).mockResolvedValue({ id: 'c1', name: 'Updated' });
      await resource.update('c1', { name: 'Updated' });
      expect(http.put).toHaveBeenCalledWith('/checkouts/c1', { name: 'Updated' });
    });

    it('throws when id empty', async () => {
      await expect(resource.update('', {})).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('delete', () => {
    it('calls DELETE /checkouts/:id', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.delete('c1');
      expect(http.delete).toHaveBeenCalledWith('/checkouts/c1');
    });

    it('throws when id empty', async () => {
      await expect(resource.delete('')).rejects.toThrow('ID é obrigatório');
    });
  });
});
