/**
 * Recurso de Cupons
 */

import { HttpClient } from '../utils/http';
import type {
  ValidateCouponRequest,
  CouponValidation,
  Coupon,
  CreateCouponRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class CouponsResource {
  constructor(private http: HttpClient) {}

  /**
   * Valida um cupom de desconto
   *
   * Nota: Este endpoint é público e não requer autenticação
   * Endpoint: POST /api/coupons/validate (não /api/v1)
   */
  async validate(data: ValidateCouponRequest): Promise<CouponValidation> {
    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Código do cupom é obrigatório');
    }

    if (!data.amountCents || data.amountCents < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }

    if (!this.http.baseUrl) {
      throw new Error('baseUrl must be configured. Set baseUrl when creating AlpaClient instance.');
    }
    const url = `${this.http.baseUrl}/api/coupons/validate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: data.code.trim(),
        amount: data.amountCents,
        productIds: data.productIds || [],
      }),
    });

    const result: any = await response.json().catch(() => null);
    if (!result) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.ok && result.valid === undefined) {
      throw new Error(result.message || result.error || `HTTP ${response.status}`);
    }

    return {
      valid: result.valid || false,
      discountCents: result.discountAmount || 0,
      discountPercentage: result.coupon?.discountPercentage,
      finalAmountCents: result.finalAmount || data.amountCents,
      message: result.error || result.message,
    };
  }

  /** Lista cupons */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Coupon>> {
    const response = await this.http.get<any>('/coupons', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
    });
    return {
      data: response.coupons || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }

  /** Cria um cupom */
  async create(data: CreateCouponRequest): Promise<Coupon> {
    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Código do cupom é obrigatório');
    }
    return this.http.post<Coupon>('/coupons', data);
  }

  /** Obtém um cupom por ID */
  async get(id: string): Promise<Coupon> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.get<Coupon>(`/coupons/${id}`);
  }

  /** Atualiza um cupom */
  async update(id: string, data: Partial<CreateCouponRequest>): Promise<Coupon> {
    if (!id) throw new Error('ID é obrigatório');
    return this.http.patch<Coupon>(`/coupons/${id}`, data);
  }

  /** Deleta um cupom */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('ID é obrigatório');
    await this.http.delete(`/coupons/${id}`);
  }
}
