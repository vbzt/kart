import { Injectable } from '@nestjs/common';
import { addMonths, isAfter } from 'date-fns';
import crypto from 'node:crypto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly abacateWebhookSecret: string;

  constructor(private readonly prismaService: PrismaService) {
    const abacateWebhookSecret = process.env.ABACATE_WEBHOOK_SECRET;

    if (!abacateWebhookSecret) {
      throw new Error('Chave de webhook da AbacatePay não definida.');
    }
    this.abacateWebhookSecret = abacateWebhookSecret;
  }

  async updatePayment(payload: any) {
    const transparent = payload?.data?.transparent;
    const providerPaymentId = transparent?.id;
    if (!providerPaymentId) return { received: true, ignored: true };

    return this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { provider: 'abacatepay', providerPaymentId },
      });

      if (!payment) return { received: true, ignored: true };

      const paidAt = transparent?.updatedAt
        ? new Date(transparent.updatedAt)
        : new Date();

      const updatedPayment = await tx.payment.updateMany({
        where: {
          id: payment.id,
          OR: [{ status: { not: 'PAID' } }, { paidAt: null }],
        },
        data: {
          status: 'PAID',
          paidAt,
          receiptUrl: transparent?.receiptUrl,
          providerMetadata: payload.data,
        },
      });

      if (updatedPayment.count !== 1) {
        return { received: true, duplicate: true };
      }

      if (payment.bookingId) {
        await tx.booking.updateMany({
          where: { id: payment.bookingId, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        });
      }

      if (payment.subscriptionId) {
        const subscription = await tx.subscription.findUnique({
          where: { id: payment.subscriptionId },
          include: { plan: true },
        });

        if (subscription && subscription.status !== 'CANCELLED') {
          const isFirstActivation =
            subscription.status !== 'ACTIVE' ||
            !subscription.startDate ||
            !subscription.endDate;
          const nextStart = isFirstActivation
            ? paidAt
            : this.getRenewalStart(subscription.endDate, paidAt);
          const nextEnd = addMonths(nextStart, 1);

          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
              startDate: subscription.startDate ?? paidAt,
              endDate: nextEnd,
              creditsTotal: isFirstActivation
                ? subscription.creditsTotal
                : { increment: subscription.plan.creditsPerMonth },
            },
          });

          await tx.creditTransaction.create({
            data: {
              subscriptionId: subscription.id,
              type: 'PURCHASE',
              description: isFirstActivation
                ? 'Assinatura ativada por pagamento Pix.'
                : 'Créditos renovados por pagamento Pix.',
            },
          });
        }
      }

      return { received: true };
    });
  }

  verifyAbacateSignature(rawBody: string, signatureFromHeader?: string) {
    if (!signatureFromHeader) return false;

    const signature = signatureFromHeader.replace(/^sha256=/i, '');
    const expectedBase64Signature = crypto
      .createHmac('sha256', this.abacateWebhookSecret)
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');
    const expectedHexSignature = crypto
      .createHmac('sha256', this.abacateWebhookSecret)
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('hex');

    return (
      this.safeCompare(expectedBase64Signature, signature) ||
      this.safeCompare(expectedHexSignature, signature)
    );
  }

  private safeCompare(expectedSignature: string, receivedSignature: string) {
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(receivedSignature);
    return (
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)
    );
  }

  private getRenewalStart(currentEndDate: Date | null, paidAt: Date) {
    if (currentEndDate && isAfter(currentEndDate, paidAt)) {
      return currentEndDate;
    }
    return paidAt;
  }
}
