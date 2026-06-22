/**
 * Recurso de Assinaturas
 */

import { HttpClient } from '../utils/http';
import type {
  CreateSubscriptionRequest,
  Subscription,
  SubscriptionMetrics,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class SubscriptionsResource {
  constructor(private http: HttpClient) {}

  /** Lista assinaturas */
  async list(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<Subscription>> {
    const response = await this.http.get<any>('/subscriptions', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
      status: params?.status,
    });
    return {
      data: response.subscriptions || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }

  /** Cria uma assinatura */
  async create(data: CreateSubscriptionRequest): Promise<Subscription> {
    if (!data.planId) throw new Error('planId é obrigatório');
    if (data.client && !data.client.email) throw new Error('Email do cliente é obrigatório');
    return this.http.post<Subscription>('/subscriptions', data);
  }

  /** Cancela uma assinatura */
  async cancel(id: string): Promise<Subscription> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.patch<Subscription>(`/subscriptions/${id}/cancel`);
  }

  /** Pausa uma assinatura */
  async pause(id: string): Promise<Subscription> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.patch<Subscription>(`/subscriptions/${id}/pause`);
  }

  /** Retoma uma assinatura pausada */
  async resume(id: string): Promise<Subscription> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.patch<Subscription>(`/subscriptions/${id}/resume`);
  }

  /** Tenta reprocessar o pagamento de uma assinatura em atraso */
  async retry(id: string): Promise<Subscription> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.post<Subscription>(`/subscriptions/${id}/retry`);
  }

  /** Retorna métricas de assinaturas (MRR, churn, totais) */
  async getMetrics(): Promise<SubscriptionMetrics> {
    return this.http.get<SubscriptionMetrics>('/subscriptions/metrics');
  }
}
