/**
 * SDK Alpa - Cliente principal
 *
 * @example
 * ```typescript
 * import AlpaClient from '@alpa/alpa-js';
 *
 * const alpa = new AlpaClient({
 *   apiKey: process.env.ALPA_API_KEY
 * });
 *
 * const paymentLink = await alpa.paymentLinks.create({
 *   title: 'Produto Premium',
 *   amountCents: 9900, // R$ 99,00
 * });
 * ```
 */

import { HttpClient } from './utils/http';
import { PaymentLinksResource } from './resources/PaymentLinks';
import { TransactionsResource } from './resources/Transactions';
import { ProductsResource } from './resources/Products';
import { CouponsResource } from './resources/Coupons';
import { ClientsResource } from './resources/Clients';
import { SubscriptionsResource } from './resources/Subscriptions';
import { CheckoutsResource } from './resources/Checkouts';
import { OffersResource } from './resources/Offers';
import { WithdrawalsResource } from './resources/Withdrawals';
import { WalletResource } from './resources/Wallet';
import { verifyWebhookSignature, extractWebhookSignature } from './utils/webhooks';
import type { AlpaConfig } from './types';

export class AlpaClient {
  private http: HttpClient;

  public readonly paymentLinks: PaymentLinksResource;
  public readonly transactions: TransactionsResource;
  public readonly products: ProductsResource;
  public readonly coupons: CouponsResource;
  public readonly clients: ClientsResource;
  public readonly subscriptions: SubscriptionsResource;
  public readonly checkouts: CheckoutsResource;
  public readonly offers: OffersResource;
  public readonly withdrawals: WithdrawalsResource;
  public readonly wallet: WalletResource;

  constructor(config: AlpaConfig) {
    if (!config.apiKey) {
      throw new Error('API Key é obrigatória');
    }

    this.http = new HttpClient(config);

    // Inicializa recursos
    this.paymentLinks = new PaymentLinksResource(this.http);
    this.transactions = new TransactionsResource(this.http);
    this.products = new ProductsResource(this.http);
    this.coupons = new CouponsResource(this.http);
    this.clients = new ClientsResource(this.http);
    this.subscriptions = new SubscriptionsResource(this.http);
    this.checkouts = new CheckoutsResource(this.http);
    this.offers = new OffersResource(this.http);
    this.withdrawals = new WithdrawalsResource(this.http);
    this.wallet = new WalletResource(this.http);
  }

  /**
   * Verifica a assinatura de um webhook
   * 
   * @param payload - Corpo da requisição (string ou Buffer)
   * @param signature - Assinatura recebida no header
   * @param secret - Secret da API key
   * @returns true se a assinatura for válida
   * 
   * @example
   * ```typescript
   * const isValid = alpa.verifyWebhookSignature(
   *   requestBody,
   *   request.headers['x-webhook-signature'],
   *   webhookSecret
   * );
   * ```
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    return verifyWebhookSignature(payload, signature, secret);
  }

  /**
   * Extrai a assinatura do header da requisição
   * 
   * @param headers - Headers da requisição
   * @returns A assinatura ou null se não encontrada
   */
  extractWebhookSignature(headers: Record<string, string | string[] | undefined>): string | null {
    return extractWebhookSignature(headers);
  }
}

// Exportar como default
export default AlpaClient;

// Exportar tipos e utilitários
export * from './types';
export * from './utils/errors';
export { verifyWebhookSignature, extractWebhookSignature, WebhookEventType } from './utils/webhooks';
export * from './utils/validation';
