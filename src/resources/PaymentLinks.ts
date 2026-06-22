/**
 * Recurso de Payment Links
 */

import { HttpClient } from '../utils/http';
import type {
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  PaymentLink,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class PaymentLinksResource {
  constructor(private http: HttpClient) {}

  /**
   * Cria um novo link de pagamento
   */
  async create(data: CreatePaymentLinkRequest): Promise<PaymentLink> {
    // Validação básica
    const title = (data.title || '').trim();
    if (title.length < 3) {
      throw new Error('Título deve ter pelo menos 3 caracteres');
    }

    // amountCents é o canônico; `amount` é alias deprecado.
    const amountCents = data.amountCents ?? data.amount;
    const hasProducts = data.products && data.products.length > 0;

    if (!amountCents && !hasProducts) {
      throw new Error('É necessário fornecer amountCents ou products');
    }

    if (amountCents && amountCents < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }

    return this.http.post<PaymentLink>('/payment-links', {
      title,
      description: data.description,
      amountCents,
      products: data.products,
      currency: data.currency || 'BRL',
      expiresAt: data.expiresAt,
      redirectUrl: data.redirectUrl,
      settings: data.settings,
      status: data.status || 'ACTIVE',
      metaPixelCode: data.metaPixelCode,
      stockQuantity: data.stockQuantity,
      stockEnabled: data.stockEnabled,
    });
  }

  /**
   * Lista links de pagamento
   */
  async list(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<PaymentLink>> {
    const response = await this.http.get<any>('/payment-links', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
      status: params?.status,
    });
    return {
      data: response.paymentLinks || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 },
    };
  }

  /**
   * Obtém um link de pagamento por ID
   */
  async get(id: string): Promise<PaymentLink> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    const response = await this.http.get<any>(`/payment-links/${id}`);
    return response.paymentLink || response.data || response;
  }

  /**
   * Obtém um link de pagamento por slug
   */
  async getBySlug(slug: string): Promise<PaymentLink> {
    if (!slug) {
      throw new Error('Slug é obrigatório');
    }
    const response = await this.http.get<any>(`/payment-links/slug/${slug}`);
    return response.paymentLink || response.data || response;
  }

  /**
   * Atualiza um link de pagamento
   */
  async update(id: string, data: UpdatePaymentLinkRequest): Promise<PaymentLink> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    const amountCents = data.amountCents ?? data.amount;
    if (amountCents !== undefined) updateData.amountCents = amountCents;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.redirectUrl !== undefined) updateData.redirectUrl = data.redirectUrl;
    if (data.settings !== undefined) updateData.settings = data.settings;

    return this.http.patch<PaymentLink>(`/payment-links/${id}`, updateData);
  }

  /**
   * Deleta um link de pagamento
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    await this.http.delete(`/payment-links/${id}`);
  }

  /**
   * Obtém a URL pública do checkout.
   *
   * Observação: o objeto retornado por `create()`/`get()` já inclui o campo `url`.
   * Use este helper apenas se precisar montar a URL a partir do slug.
   */
  getCheckoutUrl(slug: string, baseUrl?: string): string {
    const checkoutBase = baseUrl || 'https://checkout.usealpa.com/pay';
    return `${checkoutBase}/${slug}`;
  }
}
