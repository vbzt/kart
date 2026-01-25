import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDTO } from './dto/create-plan.dto';
import { EditPlanDTO } from './dto/edit-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prismaService: PrismaService){}

  async create(data: CreatePlanDTO){ 
    const plan = await this.prismaService.plan.create({ data })
    return { message: "Plano criado com sucesso.", plan }
  }

  async read(){ 
    const plans = await this.prismaService.plan.findMany()
    return plans
  }

  async readOne(id: string){ 
    const plan = await this.prismaService.plan.findUnique( { where: { id } } )
    if(!plan) throw new NotFoundException("Este plano não existe.")
    return plan
  }

  async update(data: EditPlanDTO, id: string){ 
    const plan = await this.readOne(id)
    const updatedPlan = await this.prismaService.plan.update( { where: { id: plan.id }, data } ) 
    return { message: "Plano atualizado com sucesso.", updatedPlan} 
  }

  async remove(id: string){ 
    const plan = await this.readOne(id)
    await this.prismaService.plan.delete({ where: { id: plan.id } })
    return { message: "Plano removido com sucesso" }
  }

}
