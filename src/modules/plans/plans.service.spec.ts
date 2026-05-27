import { BadRequestException } from '@nestjs/common';
import { PlansService } from './plans.service';

describe('PlansService', () => {
  function createService(prisma: any) {
    return new PlansService(prisma);
  }

  it('rejects duplicated service ids on create', async () => {
    const service = createService({});

    await expect(
      service.create({
        name: 'Mensal',
        creditsPerMonth: 2,
        priceCents: 10000,
        servicesIds: ['service-id', 'service-id'],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('replaces service access when updating servicesIds', async () => {
    const tx = {
      plan: { update: jest.fn().mockResolvedValue({ id: 'plan-id' }) },
      planServiceAccess: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prisma = {
      plan: {
        findUnique: jest.fn().mockResolvedValue({ id: 'plan-id' }),
      },
      service: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'service-a' }, { id: 'service-b' }]),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = createService(prisma);

    await service.update(
      { servicesIds: ['service-a', 'service-b'] } as any,
      'plan-id',
    );

    expect(tx.planServiceAccess.deleteMany).toHaveBeenCalledWith({
      where: { planId: 'plan-id' },
    });
    expect(tx.planServiceAccess.createMany).toHaveBeenCalledWith({
      data: [
        { planId: 'plan-id', serviceId: 'service-a' },
        { planId: 'plan-id', serviceId: 'service-b' },
      ],
    });
  });
});
