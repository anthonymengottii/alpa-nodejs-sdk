/**
 * Recurso de Checkouts
 */

import { HttpClient } from '../utils/http';
import type {
  CreateCheckoutRequest,
  Checkout,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class CheckoutsResource {
  constructor(private http: HttpClient) {}

  /** Lista checkouts */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Checkout>> {
    const response = await this.http.get<any>('/checkouts', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
    });
    return {
      data: response.checkouts || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }

  /** Cria um checkout */
  async create(data: CreateCheckoutRequest): Promise<Checkout> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome do checkout é obrigatório');
    }
    return this.http.post<Checkout>('/checkouts', data);
  }

  /** Obtém um checkout por ID */
  async get(id: string): Promise<Checkout> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.get<Checkout>(`/checkouts/${id}`);
  }

  /** Atualiza um checkout */
  async update(id: string, data: Partial<CreateCheckoutRequest>): Promise<Checkout> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.put<Checkout>(`/checkouts/${id}`, data);
  }

  /** Deleta um checkout */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('ID é obrigatório');
    await this.http.delete(`/checkouts/${id}`);
  }
}
