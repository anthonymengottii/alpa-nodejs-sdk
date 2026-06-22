import { CouponsResource } from '../../src/resources/Coupons';
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

describe('CouponsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: CouponsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new CouponsResource(http as unknown as HttpClient);
  });

  describe('list', () => {
    it('calls GET /coupons and normalizes response', async () => {
      const mockCoupon = { id: 'cp1', code: 'SAVE10' };
      (http.get as jest.Mock).mockResolvedValue({ coupons: [mockCoupon], pagination: { total: 1, page: 1, limit: 10 } });

      const result = await resource.list();

      expect(http.get).toHaveBeenCalledWith('/coupons', expect.any(Object));
      expect(result.data).toEqual([mockCoupon]);
    });

    it('passes pagination params', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });
      await resource.list({ page: 2, limit: 20 });
      expect(http.get).toHaveBeenCalledWith('/coupons', expect.objectContaining({ page: 2, limit: 20 }));
    });
  });

  describe('create', () => {
    it('calls POST /coupons', async () => {
      const payload = { code: 'SAVE20', discountType: 'PERCENTAGE' as const, discountValue: 20 };
      (http.post as jest.Mock).mockResolvedValue({ id: 'cp1', ...payload });

      const result = await resource.create(payload);

      expect(http.post).toHaveBeenCalledWith('/coupons', payload);
      expect(result).toMatchObject({ id: 'cp1' });
    });

    it('throws when code empty', async () => {
      await expect(resource.create({ code: '' } as any)).rejects.toThrow('Código do cupom é obrigatório');
    });
  });

  describe('get', () => {
    it('calls GET /coupons/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'cp1', code: 'SAVE10' });
      const result = await resource.get('cp1');
      expect(http.get).toHaveBeenCalledWith('/coupons/cp1');
      expect(result).toMatchObject({ id: 'cp1' });
    });

    it('throws when id empty', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('update', () => {
    it('calls PATCH /coupons/:id', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 'cp1', code: 'NEW20' });
      await resource.update('cp1', { code: 'NEW20' });
      expect(http.patch).toHaveBeenCalledWith('/coupons/cp1', { code: 'NEW20' });
    });

    it('throws when id empty', async () => {
      await expect(resource.update('', {})).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('delete', () => {
    it('calls DELETE /coupons/:id', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.delete('cp1');
      expect(http.delete).toHaveBeenCalledWith('/coupons/cp1');
    });

    it('throws when id empty', async () => {
      await expect(resource.delete('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('validate', () => {
    it('throws when code empty', async () => {
      await expect(resource.validate({ code: '', amountCents: 1000, productIds: [] })).rejects.toThrow('Código do cupom é obrigatório');
    });

    it('throws when amount below minimum', async () => {
      await expect(resource.validate({ code: 'X', amountCents: 50, productIds: [] })).rejects.toThrow('Valor mínimo');
    });

    it('uses baseUrl for public endpoint (not /api/v1)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ valid: true, discountAmount: 200, finalAmount: 800 }),
      }) as any;

      const result = await resource.validate({ code: 'SAVE20', amountCents: 1000, productIds: [] });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('https://test.example.com/api/coupons/validate');
      expect(result.valid).toBe(true);
      expect(result.discountCents).toBe(200);
    });
  });
});
