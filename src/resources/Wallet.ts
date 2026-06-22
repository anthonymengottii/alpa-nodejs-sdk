/**
 * Recurso de Carteira
 */

import { HttpClient } from '../utils/http';
import type {
  WalletSummary,
  WalletEntry,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class WalletResource {
  constructor(private http: HttpClient) {}

  /** Retorna o resumo da carteira (saldo, recebido, sacado) */
  async getSummary(): Promise<WalletSummary> {
    return this.http.get<WalletSummary>('/wallet/summary');
  }

  /** Retorna o extrato da carteira com paginação */
  async getStatement(
    params?: PaginationParams & { startDate?: string; endDate?: string }
  ): Promise<PaginatedResponse<WalletEntry>> {
    const response = await this.http.get<any>('/wallet/statement', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      startDate: params?.startDate,
      endDate: params?.endDate,
    });
    return {
      data: response.entries || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }
}
