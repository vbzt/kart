import { BadRequestException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { CouponService } from './coupon.service';

describe('CouponService', () => {
  function createService(prisma: any) {
    return new CouponService(prisma);
  }

  it('rejects expired coupons', async () => {
    const prisma = {
      coupon: {
        findUnique: jest.fn().mockResolvedValue({
          code: 'OLD',
          discountType: DiscountType.FIXED,
          discountValue: 1000,
          isActive: true,
          currentUses: 0,
          maxUses: null,
          validFrom: null,
          validUntil: new Date('2020-01-01T00:00:00.000Z'),
        }),
      },
    };
    const service = createService(prisma);

    await expect(service.useCoupon(5000, 'OLD')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('caps fixed discounts at the booking price', async () => {
    const prisma = {
      coupon: {
        findUnique: jest.fn().mockResolvedValue({
          code: 'FREE',
          discountType: DiscountType.FIXED,
          discountValue: 10000,
          isActive: true,
          currentUses: 0,
          maxUses: null,
          validFrom: null,
          validUntil: null,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = createService(prisma);

    await expect(service.useCoupon(5000, 'FREE')).resolves.toEqual({
      finalPrice: 0,
      discount: 5000,
    });
  });

  it('rejects percentage discounts above 100 percent', async () => {
    const service = createService({
      coupon: { findUnique: jest.fn().mockResolvedValue(null) },
    });

    await expect(
      service.create({
        code: 'BAD',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 101,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
