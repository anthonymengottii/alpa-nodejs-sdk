import { SubscriptionsResource } from '../../src/resources/Subscriptions';
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

describe('SubscriptionsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: SubscriptionsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new SubscriptionsResource(http as unknown as HttpClient);
  });

  describe('list', () => {
    it('calls GET /subscriptions and normalizes response', async () => {
      const mockSub = { id: '1', status: 'ACTIVE' };
      (http.get as jest.Mock).mockResolvedValue({ subscriptions: [mockSub], pagination: { total: 1, page: 1, limit: 10 } });

      const result = await resource.list({ page: 1, status: 'ACTIVE' });

      expect(http.get).toHaveBeenCalledWith('/subscriptions', expect.objectContaining({ page: 1, status: 'ACTIVE' }));
      expect(result.data).toEqual([mockSub]);
      expect(result.pagination.total).toBe(1);
    });

    it('falls back to data[] when subscriptions key absent', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });

      const result = await resource.list();

      expect(result.data).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls POST /subscriptions with body', async () => {
      const payload = { planId: 'plan_1', client: { name: 'Test User', email: 'a@b.com' } };
      (http.post as jest.Mock).mockResolvedValue({ id: 's1', planId: 'plan_1' });

      const result = await resource.create(payload);

      expect(http.post).toHaveBeenCalledWith('/subscriptions', payload);
      expect(result).toMatchObject({ id: 's1' });
    });

    it('throws when planId absent', async () => {
      await expect(resource.create({} as any)).rejects.toThrow('planId é obrigatório');
    });

    it('throws when client.email absent', async () => {
      await expect(resource.create({ planId: 'p1', client: { name: 'X' } } as any)).rejects.toThrow('Email do cliente é obrigatório');
    });
  });

  describe('cancel', () => {
    it('calls PATCH /subscriptions/:id/cancel', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 's1', status: 'CANCELLED' });
      await resource.cancel('s1');
      expect(http.patch).toHaveBeenCalledWith('/subscriptions/s1/cancel');
    });

    it('throws when id empty', async () => {
      await expect(resource.cancel('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('pause', () => {
    it('calls PATCH /subscriptions/:id/pause', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 's1' });
      await resource.pause('s1');
      expect(http.patch).toHaveBeenCalledWith('/subscriptions/s1/pause');
    });

    it('throws when id empty', async () => {
      await expect(resource.pause('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('resume', () => {
    it('calls PATCH /subscriptions/:id/resume', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 's1' });
      await resource.resume('s1');
      expect(http.patch).toHaveBeenCalledWith('/subscriptions/s1/resume');
    });
  });

  describe('retry', () => {
    it('calls POST /subscriptions/:id/retry', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 's1' });
      await resource.retry('s1');
      expect(http.post).toHaveBeenCalledWith('/subscriptions/s1/retry');
    });

    it('throws when id empty', async () => {
      await expect(resource.retry('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('getMetrics', () => {
    it('calls GET /subscriptions/metrics', async () => {
      const metrics = { mrr: 1000, churn: 0.02, total: 50, active: 48 };
      (http.get as jest.Mock).mockResolvedValue(metrics);

      const result = await resource.getMetrics();

      expect(http.get).toHaveBeenCalledWith('/subscriptions/metrics');
      expect(result).toEqual(metrics);
    });
  });
});
