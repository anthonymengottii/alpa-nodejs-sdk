import { WalletResource } from '../../src/resources/Wallet';
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

describe('WalletResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: WalletResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new WalletResource(http as unknown as HttpClient);
  });

  describe('getSummary', () => {
    it('calls GET /wallet/summary', async () => {
      const summary = { balanceCents: 100000, receivedCents: 200000, withdrawnCents: 100000 };
      (http.get as jest.Mock).mockResolvedValue(summary);

      const result = await resource.getSummary();

      expect(http.get).toHaveBeenCalledWith('/wallet/summary');
      expect(result).toEqual(summary);
    });
  });

  describe('getStatement', () => {
    it('calls GET /wallet/statement without params', async () => {
      (http.get as jest.Mock).mockResolvedValue({ entries: [], pagination: { total: 0, page: 1, limit: 10 } });

      const result = await resource.getStatement();

      expect(http.get).toHaveBeenCalledWith('/wallet/statement', expect.any(Object));
      expect(result.data).toEqual([]);
    });

    it('passes date range params', async () => {
      (http.get as jest.Mock).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10 } });

      await resource.getStatement({ startDate: '2026-01-01', endDate: '2026-01-31', page: 1 });

      expect(http.get).toHaveBeenCalledWith(
        '/wallet/statement',
        expect.objectContaining({ startDate: '2026-01-01', endDate: '2026-01-31', page: 1 })
      );
    });

    it('normalizes entries from data key', async () => {
      const entry = { id: 'e1', type: 'CREDIT', amountCents: 5000 };
      (http.get as jest.Mock).mockResolvedValue({ data: [entry], pagination: { total: 1, page: 1, limit: 10 } });

      const result = await resource.getStatement();

      expect(result.data).toEqual([entry]);
    });
  });
});
