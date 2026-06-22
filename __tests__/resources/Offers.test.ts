import { OffersResource } from '../../src/resources/Offers';
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

describe('OffersResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: OffersResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new OffersResource(http as unknown as HttpClient);
  });

  // ── Order Bumps ──────────────────────────────────────────────────────────

  describe('listOrderBumps', () => {
    it('calls GET /checkouts/:id/order-bumps', async () => {
      (http.get as jest.Mock).mockResolvedValue([{ id: 'b1' }]);
      const result = await resource.listOrderBumps('co1');
      expect(http.get).toHaveBeenCalledWith('/checkouts/co1/order-bumps');
      expect(Array.isArray(result)).toBe(true);
    });

    it('throws when checkoutId empty', async () => {
      await expect(resource.listOrderBumps('')).rejects.toThrow('checkoutId é obrigatório');
    });
  });

  describe('createOrderBump', () => {
    it('calls POST /checkouts/:id/order-bumps', async () => {
      const data = { productId: 'p1' };
      (http.post as jest.Mock).mockResolvedValue({ id: 'b1' });
      await resource.createOrderBump('co1', data);
      expect(http.post).toHaveBeenCalledWith('/checkouts/co1/order-bumps', data);
    });

    it('throws when checkoutId empty', async () => {
      await expect(resource.createOrderBump('', { productId: 'p1' })).rejects.toThrow('checkoutId é obrigatório');
    });

    it('throws when productId absent', async () => {
      await expect(resource.createOrderBump('co1', {} as any)).rejects.toThrow('productId é obrigatório');
    });
  });

  describe('updateOrderBump', () => {
    it('calls PUT /checkouts/:id/order-bumps/:bumpId', async () => {
      (http.put as jest.Mock).mockResolvedValue({ id: 'b1' });
      await resource.updateOrderBump('co1', 'b1', { title: 'New' });
      expect(http.put).toHaveBeenCalledWith('/checkouts/co1/order-bumps/b1', { title: 'New' });
    });

    it('throws when bumpId empty', async () => {
      await expect(resource.updateOrderBump('co1', '', {})).rejects.toThrow('bumpId é obrigatório');
    });
  });

  describe('deleteOrderBump', () => {
    it('calls DELETE /checkouts/:id/order-bumps/:bumpId', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.deleteOrderBump('co1', 'b1');
      expect(http.delete).toHaveBeenCalledWith('/checkouts/co1/order-bumps/b1');
    });
  });

  // ── Upsell ───────────────────────────────────────────────────────────────

  describe('getUpsell', () => {
    it('calls GET /checkouts/:id/upsell', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'u1' });
      const result = await resource.getUpsell('co1');
      expect(http.get).toHaveBeenCalledWith('/checkouts/co1/upsell');
      expect(result).toMatchObject({ id: 'u1' });
    });

    it('returns null when response is falsy', async () => {
      (http.get as jest.Mock).mockResolvedValue(null);
      const result = await resource.getUpsell('co1');
      expect(result).toBeNull();
    });

    it('throws when checkoutId empty', async () => {
      await expect(resource.getUpsell('')).rejects.toThrow('checkoutId é obrigatório');
    });
  });

  describe('upsertUpsell', () => {
    it('calls POST /checkouts/:id/upsell', async () => {
      const data = { productId: 'p1' };
      (http.post as jest.Mock).mockResolvedValue({ id: 'u1' });
      await resource.upsertUpsell('co1', data);
      expect(http.post).toHaveBeenCalledWith('/checkouts/co1/upsell', data);
    });

    it('throws when productId absent', async () => {
      await expect(resource.upsertUpsell('co1', {} as any)).rejects.toThrow('productId é obrigatório');
    });
  });

  describe('deleteUpsell', () => {
    it('calls DELETE /checkouts/:id/upsell', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.deleteUpsell('co1');
      expect(http.delete).toHaveBeenCalledWith('/checkouts/co1/upsell');
    });
  });

  // ── Downsell ─────────────────────────────────────────────────────────────

  describe('upsertDownsell', () => {
    it('calls POST /checkouts/:id/upsell/downsell', async () => {
      const data = { productId: 'p1' };
      (http.post as jest.Mock).mockResolvedValue({ id: 'd1' });
      await resource.upsertDownsell('co1', data);
      expect(http.post).toHaveBeenCalledWith('/checkouts/co1/upsell/downsell', data);
    });

    it('throws when productId absent', async () => {
      await expect(resource.upsertDownsell('co1', {} as any)).rejects.toThrow('productId é obrigatório');
    });

    it('throws when checkoutId empty', async () => {
      await expect(resource.upsertDownsell('', { productId: 'p1' })).rejects.toThrow('checkoutId é obrigatório');
    });
  });

  describe('deleteDownsell', () => {
    it('calls DELETE /checkouts/:id/upsell/downsell', async () => {
      (http.delete as jest.Mock).mockResolvedValue(undefined);
      await resource.deleteDownsell('co1');
      expect(http.delete).toHaveBeenCalledWith('/checkouts/co1/upsell/downsell');
    });

    it('throws when checkoutId empty', async () => {
      await expect(resource.deleteDownsell('')).rejects.toThrow('checkoutId é obrigatório');
    });
  });
});
