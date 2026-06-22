/**
 * Recurso de Ofertas (Order Bumps, Upsell, Downsell)
 */

import { HttpClient } from '../utils/http';
import type {
  CreateOrderBumpRequest,
  OrderBump,
  UpsellRequest,
  Upsell,
  DownsellRequest,
  Downsell,
} from '../types';

export class OffersResource {
  constructor(private http: HttpClient) {}

  // ─── Order Bumps ─────────────────────────────────────────────────────────

  /** Lista order bumps de um checkout */
  async listOrderBumps(checkoutId: string): Promise<OrderBump[]> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    const response = await this.http.get<any>(`/checkouts/${checkoutId}/order-bumps`);
    return response.orderBumps || response.data || response || [];
  }

  /** Cria um order bump em um checkout */
  async createOrderBump(checkoutId: string, data: CreateOrderBumpRequest): Promise<OrderBump> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    if (!data.productId) throw new Error('productId é obrigatório');
    return this.http.post<OrderBump>(`/checkouts/${checkoutId}/order-bumps`, data);
  }

  /** Atualiza um order bump */
  async updateOrderBump(
    checkoutId: string,
    bumpId: string,
    data: Partial<CreateOrderBumpRequest>
  ): Promise<OrderBump> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    if (!bumpId) throw new Error('bumpId é obrigatório');
    return this.http.put<OrderBump>(`/checkouts/${checkoutId}/order-bumps/${bumpId}`, data);
  }

  /** Remove um order bump */
  async deleteOrderBump(checkoutId: string, bumpId: string): Promise<void> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    if (!bumpId) throw new Error('bumpId é obrigatório');
    await this.http.delete(`/checkouts/${checkoutId}/order-bumps/${bumpId}`);
  }

  // ─── Upsell ──────────────────────────────────────────────────────────────

  /** Obtém o upsell de um checkout */
  async getUpsell(checkoutId: string): Promise<Upsell | null> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    const response = await this.http.get<any>(`/checkouts/${checkoutId}/upsell`);
    return response || null;
  }

  /** Cria ou atualiza o upsell de um checkout */
  async upsertUpsell(checkoutId: string, data: UpsellRequest): Promise<Upsell> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    if (!data.productId) throw new Error('productId é obrigatório');
    return this.http.post<Upsell>(`/checkouts/${checkoutId}/upsell`, data);
  }

  /** Remove o upsell de um checkout */
  async deleteUpsell(checkoutId: string): Promise<void> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    await this.http.delete(`/checkouts/${checkoutId}/upsell`);
  }

  // ─── Downsell ─────────────────────────────────────────────────────────────

  /** Cria ou atualiza o downsell de um checkout */
  async upsertDownsell(checkoutId: string, data: DownsellRequest): Promise<Downsell> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    if (!data.productId) throw new Error('productId é obrigatório');
    return this.http.post<Downsell>(`/checkouts/${checkoutId}/upsell/downsell`, data);
  }

  /** Remove o downsell de um checkout */
  async deleteDownsell(checkoutId: string): Promise<void> {
    if (!checkoutId) throw new Error('checkoutId é obrigatório');
    await this.http.delete(`/checkouts/${checkoutId}/upsell/downsell`);
  }
}
