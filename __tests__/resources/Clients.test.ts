import { ClientsResource } from '../../src/resources/Clients';
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

describe('ClientsResource', () => {
  let http: ReturnType<typeof makeHttp>;
  let resource: ClientsResource;

  beforeEach(() => {
    http = makeHttp();
    resource = new ClientsResource(http as unknown as HttpClient);
  });

  describe('create', () => {
    it('chama POST /clients', async () => {
      (http.post as jest.Mock).mockResolvedValue({ id: 'cli_1', name: 'João', email: 'joao@example.com' });
      const result = await resource.create({ name: 'João', email: 'joao@example.com' });
      expect(http.post).toHaveBeenCalledWith('/clients', expect.objectContaining({ email: 'joao@example.com' }));
      expect(result).toMatchObject({ id: 'cli_1' });
    });

    it('lança quando nome vazio', async () => {
      await expect(resource.create({ name: '', email: 'a@b.com' } as never)).rejects.toThrow('Nome do cliente');
    });

    it('lança quando email inválido', async () => {
      await expect(resource.create({ name: 'X', email: 'invalido' })).rejects.toThrow('Email inválido');
    });
  });

  describe('get', () => {
    it('chama GET /clients/:id', async () => {
      (http.get as jest.Mock).mockResolvedValue({ id: 'cli_1' });
      await resource.get('cli_1');
      expect(http.get).toHaveBeenCalledWith('/clients/cli_1');
    });

    it('lança quando id vazio', async () => {
      await expect(resource.get('')).rejects.toThrow('ID é obrigatório');
    });
  });

  describe('update', () => {
    it('lança quando email inválido', async () => {
      await expect(resource.update('cli_1', { email: 'ruim' })).rejects.toThrow('Email inválido');
    });

    it('chama PATCH /clients/:id', async () => {
      (http.patch as jest.Mock).mockResolvedValue({ id: 'cli_1' });
      await resource.update('cli_1', { phone: '11999999999' });
      expect(http.patch).toHaveBeenCalledWith('/clients/cli_1', { phone: '11999999999' });
    });
  });
});
