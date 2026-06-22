/**
 * Recurso de Saques
 */

import { HttpClient } from '../utils/http';
import type {
  CreateWithdrawalRequest,
  Withdrawal,
  WithdrawalBalance,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class WithdrawalsResource {
  constructor(private http: HttpClient) {}

  /** Lista saques */
  async list(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Withdrawal>> {
    const response = await this.http.get<any>('/withdraws', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
      status: params?.status,
    });
    return {
      data: response.withdraws || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }

  /** Obtém um saque por ID */
  async get(id: string): Promise<Withdrawal> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.get<Withdrawal>(`/withdraws/${id}`);
  }

  /** Retorna o saldo disponível para saque */
  async getBalance(): Promise<WithdrawalBalance> {
    return this.http.get<WithdrawalBalance>('/withdraws/balance');
  }

  /** Cria uma solicitação de saque */
  async create(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    if (!data.amountCents || data.amountCents < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }
    if (!data.pixKey && !data.bankAccount) {
      throw new Error('pixKey ou bankAccount é obrigatório');
    }
    return this.http.post<Withdrawal>('/withdraws', data);
  }

  /** Cancela um saque pendente */
  async cancel(id: string): Promise<Withdrawal> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.post<Withdrawal>(`/withdraws/${id}/cancel`);
  }
}
