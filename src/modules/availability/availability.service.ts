import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessHourDTO } from './dto/create-business-hour.dto';
import { EditBusinessHourDTO } from './dto/edit-business-hour.dto';
import { CreateBlockedPeriodDTO } from './dto/create-blocked-period.dto';
import { EditBlockPeriodDTO } from './dto/edit-blocked-period.dto';
import { AvailabilityDTO } from './dto/availability.dto';
import { ServiceService } from '../service/service.service';
import { addMinutes, isAfter, isBefore, setHours, setMinutes} from 'date-fns'
import { BookingStatus } from '@prisma/client';
import { AvailabilitySlot } from 'src/common/types/slot';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prismaService: PrismaService, private readonly serviceService: ServiceService){ }
  private TOTAL_KARTS = 6;
  private readonly SLOT_DURATION_MINUTES = 15;

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

  async getAvailability(data: AvailabilityDTO){
  // Parse manual no timezone local (evita problemas de UTC)
  const [year, month, day] = data.date.split('-').map(Number)
  const localDate = new Date(year, month - 1, day) 
  
  const { durationMinutes } = await this.serviceService.readOne(data.serviceId)
  const dayOfWeek = localDate.getDay()
  const businessHour = await this.prismaService.businessHour.findUnique({ where: { dayOfWeek } })
  
  if(!businessHour || !businessHour.isOpen) return []
  
  // pega a data da query e coloca as horas e minutos da abertura e fechamento do dia
  const openTime = setMinutes(setHours(localDate, businessHour.openTime.getHours()), businessHour.openTime.getMinutes())
  const closeTime = setMinutes( setHours(localDate, businessHour.closeTime.getHours()), businessHour.closeTime.getMinutes())
  
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
  
  const bookings = await this.prismaService.booking.findMany({
    where: { 
      bookingDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING]}
    },
    select: { 
      numberOfPeople: true, 
      bookingTime: true, 
      service: { select: { durationMinutes: true } } 
    }
  })
  
  const slots: AvailabilitySlot[] = []
  let current = openTime
  
  while(isBefore(addMinutes(current, durationMinutes), closeTime) || addMinutes(current, durationMinutes).getTime() === closeTime.getTime()){ 
    const slotStart = current 
    const slotEnd = addMinutes(slotStart, this.SLOT_DURATION_MINUTES)
    let usedKarts = 0
    
    for(const booking of bookings){ 
      const bookingStart = booking.bookingTime
      const bookingEnd = addMinutes(booking.bookingTime, booking.service.durationMinutes)
      const overlaps = isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, slotStart)
      
      if(overlaps){ 
        usedKarts += booking.numberOfPeople
      }
    }
    
    const availableKarts = Math.max(this.TOTAL_KARTS - usedKarts, 0)
    slots.push({
      startTime: slotStart, 
      endTime: slotEnd,
      availableKarts, 
      available: availableKarts > 0
    })
    current = addMinutes(current, this.SLOT_DURATION_MINUTES)
  }
  
  return slots 
  }



}
