import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDTO } from './dto/create-plan.dto';
import { EditPlanDTO } from './dto/edit-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prismaService: PrismaService){}

  async create(data: CreatePlanDTO){ 
    const services = await this.prismaService.service.findMany( { where: { id: { in: data.servicesIds }, isActive: true }, select: { id: true } } )
    if(services.length !== data.servicesIds.length) throw new BadRequestException('Um ou mais serviços não existem ou não estão ativos.')
    
    return await this.prismaService.$transaction(async(tx) => {
      const { servicesIds, ...planData} = data
      const plan = await tx.plan.create({ data: planData })

      await tx.planServiceAccess.createMany( { data: servicesIds.map((serviceId) => ({ planId: plan.id, serviceId }) ) } )

      return { message: "Plano criado com sucesso.", plan }
    })
  }

  async read({ isActive }: { isActive?: boolean } = {}){ 
    return this.prismaService.plan.findMany({
      where: typeof isActive === 'boolean' ? { isActive } : undefined,
    })
  }

  async readOne(id: string){ 
    const plan = await this.prismaService.plan.findUnique( { where: { id } } )
    if(!plan) throw new NotFoundException("Este plano não existe.")
    return plan
  }

  async update(data: EditPlanDTO, id: string){ 
    
    const plan = await this.readOne(id)
    const { servicesIds, ...planData} = data
    
    if(servicesIds){ 
        const services = await this.prismaService.service.findMany( { where: { id: { in: data.servicesIds }, isActive: true }, select: { id: true } } )
        if(services.length !== servicesIds.length) throw new BadRequestException('Um ou mais serviços não existem ou não estão ativos.')

        const existingServiceAccess = await this.prismaService.planServiceAccess.findMany( { where : { planId: id, serviceId: { in: data.servicesIds } } })
        if(existingServiceAccess) throw new BadRequestException("Um ou mais serviços já estão relacionados a este plano")
        
        await this.prismaService.planServiceAccess.createMany( { data: servicesIds.map((serviceId) => ({ planId: plan.id, serviceId }) ) } )
    }
    
    const updatedPlan = await this.prismaService.plan.update( { where: { id: plan.id }, data: planData } ) 
    return { message: "Plano atualizado com sucesso.", updatedPlan} 
  }

  async remove(id: string){ 
    
    await this.readOne(id)
    await this.prismaService.plan.delete({ where: { id } })
    return { message: "Plano removido com sucesso" }
  }

}
