import crypto from 'node:crypto';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  const previousSecret = process.env.ABACATE_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.ABACATE_WEBHOOK_SECRET = previousSecret;
  });

  it('validates base64 HMAC signatures', () => {
    process.env.ABACATE_WEBHOOK_SECRET = 'test-secret';
    const service = new WebhookService({} as any);
    const rawBody = JSON.stringify({ event: 'transparent.completed' });
    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');

    expect(service.verifyAbacateSignature(rawBody, signature)).toBe(true);
    expect(service.verifyAbacateSignature(rawBody, 'invalid')).toBe(false);
  });
});
