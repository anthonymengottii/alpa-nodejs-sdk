import { WithdrawalsResource } from '../../src/resources/Withdrawals';
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

describe('WithdrawalsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: WithdrawalsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new WithdrawalsResource(http as unknown as HttpClient);
  });

  describe('list', () => {
    it('calls GET /withdraws and normalizes response', async () => {
      const mockW = { id: 'w1', status: 'PENDING' };
      (http.get as jest.Mock).mockResolvedValue({ withdraws: [mockW], pagination: { total: 1, page: 1, limit: 10 } });

      const result = await resource.list();

      expect(http.get).toHaveBeenCalledWith('/withdraws', expect.any(Object));
      expect(result.data).toEqual([mockW]);
    });

    it('passes status filter', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });
      await resource.list({ status: 'COMPLETED' });
      expect(http.get).toHaveBeenCalledWith('/withdraws', expect.objectContaining({ status: 'COMPLETED' }));
    });
  });

  describe('get', () => {
    it('calls GET /withdraws/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'w1' });
      const result = await resource.get('w1');
      expect(http.get).toHaveBeenCalledWith('/withdraws/w1');
      expect(result).toMatchObject({ id: 'w1' });
    });

    it('throws when id empty', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('getBalance', () => {
    it('calls GET /withdraws/balance', async () => {
      const balance = { available: 50000, pending: 5000 };
      (http.get as jest.Mock).mockResolvedValue(balance);

      const result = await resource.getBalance();

      expect(http.get).toHaveBeenCalledWith('/withdraws/balance');
      expect(result).toEqual(balance);
    });
  });

  describe('create', () => {
    it('calls POST /withdraws with pixKey payload', async () => {
      const payload = { amountCents: 10000, pixKey: 'user@email.com' };
      (http.post as jest.Mock).mockResolvedValue({ id: 'w1' });

      const result = await resource.create(payload);

      expect(http.post).toHaveBeenCalledWith('/withdraws', payload);
      expect(result).toMatchObject({ id: 'w1' });
    });

    it('throws when amount below minimum', async () => {
      await expect(resource.create({ amountCents: 50, pixKey: 'k' })).rejects.toThrow('Valor mínimo');
    });

    it('throws when neither pixKey nor bankAccount provided', async () => {
      await expect(resource.create({ amountCents: 10000 } as any)).rejects.toThrow('pixKey ou bankAccount é obrigatório');
    });
  });

  describe('cancel', () => {
    it('calls POST /withdraws/:id/cancel', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'w1', status: 'CANCELLED' });
      await resource.cancel('w1');
      expect(http.post).toHaveBeenCalledWith('/withdraws/w1/cancel');
    });

    it('throws when id empty', async () => {
      await expect(resource.cancel('')).rejects.toThrow('ID é obrigatório');
    });
  });
});
