/**
 * Utilitários para verificação de webhooks
 */

/**
 * Verifica a assinatura de um webhook usando HMAC SHA256 (hex).
 *
 * A Alpa assina o corpo bruto da requisição com HMAC-SHA256 e envia o
 * resultado em hexadecimal no header `X-Webhook-Signature` (prefixado por `sha256=`).
 *
 * @param payload - Corpo bruto da requisição (string ou Buffer)
 * @param signature - Assinatura recebida no header (com ou sem prefixo `sha256=`)
 * @param secret - Secret da assinatura de webhook
 * @returns true se a assinatura for válida
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  // Verifica null/undefined explicitamente para permitir payloads vazios mas válidos
  if (payload == null || signature == null || secret == null) {
    return false;
  }

  // Remove prefixo "sha256=" se presente
  const normalizedSignature = signature.replace(/^sha256=/, '');

  // Verifica se signature e secret não estão vazios (payload vazio é permitido)
  if (normalizedSignature.length === 0) {
    return false;
  }
  if (secret.length === 0) {
    return false;
  }

  // Detecta ambiente Node.js de forma robusta
  const isNode =
    typeof process !== 'undefined' &&
    !!(process as { versions?: { node?: string } }).versions &&
    !!(process as { versions?: { node?: string } }).versions?.node;

  // Se estiver em Node.js, usa crypto
  if (isNode) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Comparação segura para prevenir timing attacks
      const hashBuffer = Buffer.from(hash);
      const signatureBuffer = Buffer.from(normalizedSignature);

      // timingSafeEqual lança erro se os buffers tiverem tamanhos diferentes
      if (hashBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
    } catch (error) {
      console.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }

  // Para browser, usa Web Crypto API
  // Nota: Web Crypto API não suporta HMAC diretamente de forma simples
  // Recomenda-se verificar webhooks no backend.
  console.warn('Verificação de webhook no browser não é recomendada. Use no backend.');
  return false;
}

/**
 * Extrai a assinatura do header da requisição.
 *
 * O header canônico da Alpa é `x-webhook-signature`. Nomes legados são
 * aceitos como fallback para compatibilidade.
 *
 * @param headers - Headers da requisição
 * @returns A assinatura (sem prefixo `sha256=`) ou null se não encontrada
 */
export function extractWebhookSignature(headers: Record<string, string | string[] | undefined>): string | null {
  const signatureHeader =
    headers['x-webhook-signature'] ||
    headers['X-Webhook-Signature'] ||
    // Fallbacks legados
    headers['x-alpa-signature'] ||
    headers['x-upay-signature'] ||
    headers['signature'];

  if (!signatureHeader) {
    return null;
  }

  // Se for array, pega o primeiro
  const value = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!value) {
    return null;
  }

  // Remove prefixo "sha256=" se existir
  return value.replace(/^sha256=/, '');
}

/**
 * Tipos de eventos de webhook assináveis na Alpa.
 *
 * Conjunto alinhado ao backend (createWebhookSubscriptionSchema). O envelope
 * entregue tem o formato `{ id, type, data, timestamp, subscription }`, onde
 * `type` é um dos valores abaixo.
 */
export enum WebhookEventType {
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_UPDATED = 'transaction.updated',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
  TRANSACTION_REFUNDED = 'transaction.refunded',
  PAYMENT_LINK_CREATED = 'payment_link.created',
  PAYMENT_LINK_UPDATED = 'payment_link.updated',
  BALANCE_UPDATED = 'balance.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  KYC_SUBMITTED = 'kyc.submitted',
  KYC_APPROVED = 'kyc.approved',
  KYC_REJECTED = 'kyc.rejected',
  ADVANCE_CREATED = 'advance.created',
  ADVANCE_APPROVED = 'advance.approved',
  ADVANCE_REJECTED = 'advance.rejected',
  WITHDRAWAL_REQUESTED = 'withdrawal.requested',
  WITHDRAWAL_COMPLETED = 'withdrawal.completed',
  WITHDRAWAL_FAILED = 'withdrawal.failed',
}
