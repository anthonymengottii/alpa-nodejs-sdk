import crypto from 'crypto';
import { verifyWebhookSignature, extractWebhookSignature, WebhookEventType } from '../../src/utils/webhooks';

function makeSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

describe('verifyWebhookSignature', () => {
  const secret = 'test-secret';
  const payload = '{"event":"transaction.paid","id":"tx_1"}';

  it('returns true for valid signature', () => {
    const sig = makeSignature(payload, secret);
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
  });

  it('returns false for wrong signature', () => {
    expect(verifyWebhookSignature(payload, 'badhash', secret)).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const sig = makeSignature(payload, 'other-secret');
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(false);
  });

  it('returns false when payload is null', () => {
    expect(verifyWebhookSignature(null as any, 'sig', secret)).toBe(false);
  });

  it('returns false when signature is null', () => {
    expect(verifyWebhookSignature(payload, null as any, secret)).toBe(false);
  });

  it('returns false when secret is null', () => {
    expect(verifyWebhookSignature(payload, 'sig', null as any)).toBe(false);
  });

  it('returns false when signature is empty string', () => {
    expect(verifyWebhookSignature(payload, '', secret)).toBe(false);
  });

  it('returns false when secret is empty string', () => {
    expect(verifyWebhookSignature(payload, 'sig', '')).toBe(false);
  });

  it('accepts Buffer payload', () => {
    const buf = Buffer.from(payload);
    const sig = makeSignature(payload, secret);
    expect(verifyWebhookSignature(buf, sig, secret)).toBe(true);
  });
});

describe('extractWebhookSignature', () => {
  it('extracts x-webhook-signature header (canônico)', () => {
    const result = extractWebhookSignature({ 'x-webhook-signature': 'abc123' });
    expect(result).toBe('abc123');
  });

  it('strips sha256= prefix', () => {
    const result = extractWebhookSignature({ 'x-webhook-signature': 'sha256=myhash' });
    expect(result).toBe('myhash');
  });

  it('aceita header legado x-upay-signature como fallback', () => {
    const result = extractWebhookSignature({ 'x-upay-signature': 'legacy' });
    expect(result).toBe('legacy');
  });

  it('returns null when no signature header present', () => {
    expect(extractWebhookSignature({ 'content-type': 'application/json' })).toBeNull();
  });

  it('handles array header value', () => {
    const result = extractWebhookSignature({ 'x-webhook-signature': ['first', 'second'] });
    expect(result).toBe('first');
  });
});

describe('WebhookEventType', () => {
  it('has core transaction events (alinhado ao backend)', () => {
    expect(WebhookEventType.TRANSACTION_CREATED).toBe('transaction.created');
    expect(WebhookEventType.TRANSACTION_COMPLETED).toBe('transaction.completed');
    expect(WebhookEventType.TRANSACTION_FAILED).toBe('transaction.failed');
    expect(WebhookEventType.TRANSACTION_REFUNDED).toBe('transaction.refunded');
  });

  it('has payment_link e balance events', () => {
    expect(WebhookEventType.PAYMENT_LINK_CREATED).toBe('payment_link.created');
    expect(WebhookEventType.PAYMENT_LINK_UPDATED).toBe('payment_link.updated');
    expect(WebhookEventType.BALANCE_UPDATED).toBe('balance.updated');
  });

  it('has withdrawal events', () => {
    expect(WebhookEventType.WITHDRAWAL_REQUESTED).toBe('withdrawal.requested');
    expect(WebhookEventType.WITHDRAWAL_COMPLETED).toBe('withdrawal.completed');
    expect(WebhookEventType.WITHDRAWAL_FAILED).toBe('withdrawal.failed');
  });

  it('não inclui mais o evento inexistente transaction.paid', () => {
    expect(Object.values(WebhookEventType)).not.toContain('transaction.paid');
  });
});
