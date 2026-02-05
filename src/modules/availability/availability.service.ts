import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessHourDTO } from './dto/create-business-hour.dto';
import { EditBusinessHourDTO } from './dto/edit-business-hour.dto';
import { CreateBlockedPeriodDTO } from './dto/create-blocked-period.dto';
import { EditBlockPeriodDTO } from './dto/edit-blocked-period.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prismaService: PrismaService){ }

  async readBusinessHours(){
    return this.prismaService.businessHour.findMany()
  }

  async createBusinessHour(data: CreateBusinessHourDTO){   
    const existingBusinessHour = await this.prismaService.businessHour.findUnique({ where: { dayOfWeek: data.dayOfWeek } } )
    if(existingBusinessHour) throw new BadRequestException('Um dia útil neste dia da semana já existe.')
    const businessHour = await this.prismaService.businessHour.create( { data } )
    return { message: "Dia útil criado com sucesso.", businessHour}
  }

  async updateBusinessHour(data: EditBusinessHourDTO, dayOfWeek: number){
    const existingBusinessHour = await this.prismaService.businessHour.findUnique({ where: { dayOfWeek: data.dayOfWeek } } )
    if(existingBusinessHour) throw new BadRequestException('Um dia útil neste dia da semana já existe.')
    const updatedBusinessHour = await this.prismaService.businessHour.update( { data, where: { dayOfWeek } } )
    return { message: "Dia útil atualizado com sucesso.", updatedBusinessHour } 
  }

  async readBlockedPeriods(){ 
    return this.prismaService.blockedPeriod.findMany()
  }


  async createBlockedPeriod(data:CreateBlockedPeriodDTO){ 
    const blockedPeriod = await this.prismaService.blockedPeriod.create({ data })
    return { message: "Período bloqueado com sucesso.", blockedPeriod }
  }

  async updateBlockedPeriod(data:EditBlockPeriodDTO, id: string){
    const blockedPeriod = await this.prismaService.blockedPeriod.findUnique({ where: { id } })
    if(!blockedPeriod) throw new NotFoundException('Período bloqueado não encontrado.')
    const updatedBlockedPeriod = await this.prismaService.blockedPeriod.update({ where: { id }, data })
    return { message: "Período bloqueado atualizado com sucesso.", updatedBlockedPeriod }
  }

  



}
