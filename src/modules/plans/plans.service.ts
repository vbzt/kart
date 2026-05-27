import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDTO } from './dto/create-plan.dto';
import { EditPlanDTO } from './dto/edit-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreatePlanDTO) {
    this.assertUniqueServices(data.servicesIds);

    const services = await this.prismaService.service.findMany({
      where: { id: { in: data.servicesIds }, isActive: true },
      select: { id: true },
    });
    if (services.length !== data.servicesIds.length) {
      throw new BadRequestException(
        'Um ou mais serviços não existem ou não estão ativos.',
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const { servicesIds, ...planData } = data;
      const plan = await tx.plan.create({ data: planData });

      await tx.planServiceAccess.createMany({
        data: servicesIds.map((serviceId) => ({ planId: plan.id, serviceId })),
      });

      return { message: 'Plano criado com sucesso.', plan };
    });
  }

  async read({ isActive }: { isActive?: boolean } = {}) {
    return this.prismaService.plan.findMany({
      where: typeof isActive === 'boolean' ? { isActive } : undefined,
      include: { serviceAccess: { include: { service: true } } },
    });
  }

  async readOne(id: string) {
    const plan = await this.prismaService.plan.findUnique({
      where: { id },
      include: { serviceAccess: { include: { service: true } } },
    });
    if (!plan) throw new NotFoundException('Este plano não existe.');
    return plan;
  }

  async update(data: EditPlanDTO, id: string) {
    const plan = await this.readOne(id);
    const { servicesIds, ...planData } = data;

    if (servicesIds) {
      this.assertUniqueServices(servicesIds);

      const services = await this.prismaService.service.findMany({
        where: { id: { in: servicesIds }, isActive: true },
        select: { id: true },
      });
      if (services.length !== servicesIds.length) {
        throw new BadRequestException(
          'Um ou mais serviços não existem ou não estão ativos.',
        );
      }
    }

    const updatedPlan = await this.prismaService.$transaction(async (tx) => {
      const updated = await tx.plan.update({
        where: { id: plan.id },
        data: planData,
      });

      if (servicesIds) {
        await tx.planServiceAccess.deleteMany({ where: { planId: plan.id } });
        await tx.planServiceAccess.createMany({
          data: servicesIds.map((serviceId) => ({
            planId: plan.id,
            serviceId,
          })),
        });
      }

      return updated;
    });

    return { message: 'Plano atualizado com sucesso.', updatedPlan };
  }

  async remove(id: string) {
    await this.readOne(id);
    await this.prismaService.plan.delete({ where: { id } });
    return { message: 'Plano removido com sucesso' };
  }

  private assertUniqueServices(servicesIds: string[]) {
    if (new Set(servicesIds).size !== servicesIds.length) {
      throw new BadRequestException(
        'A lista de serviços não pode conter itens duplicados.',
      );
    }
  }
}
