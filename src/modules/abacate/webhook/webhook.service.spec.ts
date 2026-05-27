import crypto from 'node:crypto';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  const previousSecret = process.env.ABACATE_WEBHOOK_SECRET;
  const previousPublicKey = process.env.ABACATEPAY_PUBLIC_KEY;

  afterEach(() => {
    process.env.ABACATE_WEBHOOK_SECRET = previousSecret;
    process.env.ABACATEPAY_PUBLIC_KEY = previousPublicKey;
  });

  it('validates webhook secret from query string', () => {
    process.env.ABACATE_WEBHOOK_SECRET = 'query-secret';
    process.env.ABACATEPAY_PUBLIC_KEY = 'public-key';
    const service = new WebhookService({} as any);

    expect(service.verifyWebhookSecret('query-secret')).toBe(true);
    expect(service.verifyWebhookSecret('wrong-secret')).toBe(false);
  });

  it('validates base64 HMAC signatures with AbacatePay public key', () => {
    process.env.ABACATE_WEBHOOK_SECRET = 'query-secret';
    process.env.ABACATEPAY_PUBLIC_KEY = 'public-key';
    const service = new WebhookService({} as any);
    const rawBody = JSON.stringify({ event: 'transparent.completed' });
    const signature = crypto
      .createHmac('sha256', 'public-key')
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');

    expect(service.verifyAbacateSignature(rawBody, signature)).toBe(true);
    expect(service.verifyAbacateSignature(rawBody, 'invalid')).toBe(false);
  });
});
