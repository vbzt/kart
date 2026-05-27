import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BlockedPeriod, BookingStatus } from '@prisma/client';
import { addMinutes, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { AvailabilitySlot } from 'src/common/types/slot';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from '../service/service.service';
import { AvailabilityDTO } from './dto/availability.dto';
import { CreateBlockedPeriodDTO } from './dto/create-blocked-period.dto';
import { CreateBusinessHourDTO } from './dto/create-business-hour.dto';
import { EditBlockPeriodDTO } from './dto/edit-blocked-period.dto';
import { EditBusinessHourDTO } from './dto/edit-business-hour.dto';
import { ReadSlotDTO } from './dto/read-slot.dto';

@Injectable()
export class AvailabilityService {
  private readonly TOTAL_KARTS: number;
  private readonly SLOT_DURATION_MINUTES = 15;
  private readonly OCCUPIED_STATUSES = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.PAID,
  ];

  constructor(
    private readonly prismaService: PrismaService,
    private readonly serviceService: ServiceService,
  ) {
    const rawTotalKarts = process.env.TOTAL_KARTS;
    const totalKarts = Number(rawTotalKarts);

    if (!rawTotalKarts || Number.isNaN(totalKarts)) {
      throw new Error('TOTAL_KARTS deve ser um número válido.');
    }

    this.TOTAL_KARTS = totalKarts;
  }

  async readBusinessHours() {
    return this.prismaService.businessHour.findMany();
  }

  async createBusinessHour(data: CreateBusinessHourDTO) {
    if (data.closeTime <= data.openTime) {
      throw new BadRequestException(
        'Horário de fechamento deve ser posterior ao horário de abertura.',
      );
    }

    const existingBusinessHour =
      await this.prismaService.businessHour.findUnique({
        where: { dayOfWeek: data.dayOfWeek },
      });
    if (existingBusinessHour) {
      throw new BadRequestException(
        'Um dia útil neste dia da semana já existe.',
      );
    }

    const businessHour = await this.prismaService.businessHour.create({ data });
    return { message: 'Dia útil criado com sucesso.', businessHour };
  }

  async updateBusinessHour(data: EditBusinessHourDTO, dayOfWeek: number) {
    const currentBusinessHour =
      await this.prismaService.businessHour.findUnique({ where: { dayOfWeek } });
    if (!currentBusinessHour) {
      throw new NotFoundException('Dia útil não encontrado.');
    }

    if (
      data.dayOfWeek !== undefined &&
      data.dayOfWeek !== dayOfWeek &&
      (await this.prismaService.businessHour.findUnique({
        where: { dayOfWeek: data.dayOfWeek },
      }))
    ) {
      throw new BadRequestException(
        'Um dia útil neste dia da semana já existe.',
      );
    }

    const openTime = data.openTime ?? currentBusinessHour.openTime;
    const closeTime = data.closeTime ?? currentBusinessHour.closeTime;
    if (closeTime <= openTime) {
      throw new BadRequestException(
        'Horário de fechamento deve ser posterior ao horário de abertura.',
      );
    }

    const updatedBusinessHour = await this.prismaService.businessHour.update({
      data,
      where: { dayOfWeek },
    });
    return {
      message: 'Dia útil atualizado com sucesso.',
      updatedBusinessHour,
    };
  }

  async readBlockedPeriods() {
    return this.prismaService.blockedPeriod.findMany();
  }

  async createBlockedPeriod(data: CreateBlockedPeriodDTO) {
    this.validateBlockedPeriod(data);
    const blockedPeriod = await this.prismaService.blockedPeriod.create({
      data,
    });
    return { message: 'Período bloqueado com sucesso.', blockedPeriod };
  }

  async updateBlockedPeriod(data: EditBlockPeriodDTO, id: string) {
    const blockedPeriod = await this.prismaService.blockedPeriod.findUnique({
      where: { id },
    });
    if (!blockedPeriod) {
      throw new NotFoundException('Período bloqueado não encontrado.');
    }

    this.validateBlockedPeriod({ ...blockedPeriod, ...data });

    const updatedBlockedPeriod = await this.prismaService.blockedPeriod.update({
      where: { id },
      data,
    });
    return {
      message: 'Período bloqueado atualizado com sucesso.',
      updatedBlockedPeriod,
    };
  }

  async getAvailability(data: AvailabilityDTO) {
    const { localDate, startOfDay, endOfDay } = this.parseLocalDay(data.date);
    const service = await this.serviceService.readOne(data.serviceId);
    const dayOfWeek = localDate.getDay();
    const businessHour = await this.prismaService.businessHour.findUnique({
      where: { dayOfWeek },
    });

    if (!businessHour || !businessHour.isOpen) return [];

    const openTime = this.withTime(localDate, businessHour.openTime);
    const closeTime = this.withTime(localDate, businessHour.closeTime);
    const capacity = Math.min(this.TOTAL_KARTS, service.maxCapacity);

    const [bookings, blockedPeriods] = await Promise.all([
      this.prismaService.booking.findMany({
        where: {
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: this.OCCUPIED_STATUSES },
        },
        select: {
          numberOfPeople: true,
          bookingTime: true,
          service: { select: { durationMinutes: true } },
        },
      }),
      this.readActiveBlockedPeriodsForDay(startOfDay, endOfDay),
    ]);

    const slots: AvailabilitySlot[] = [];
    let current = openTime;

    while (
      isBefore(addMinutes(current, service.durationMinutes), closeTime) ||
      addMinutes(current, service.durationMinutes).getTime() ===
        closeTime.getTime()
    ) {
      const slotStart = current;
      const slotEnd = addMinutes(slotStart, this.SLOT_DURATION_MINUTES);
      let usedKarts = 0;

      for (const booking of bookings) {
        const bookingStart = booking.bookingTime;
        const bookingEnd = addMinutes(
          booking.bookingTime,
          booking.service.durationMinutes,
        );
        if (this.overlaps(bookingStart, bookingEnd, slotStart, slotEnd)) {
          usedKarts += booking.numberOfPeople;
        }
      }

      const isBlocked = this.isBlocked(
        blockedPeriods,
        localDate,
        slotStart,
        slotEnd,
      );
      const availableKarts = isBlocked ? 0 : Math.max(capacity - usedKarts, 0);

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        availableKarts,
        available: availableKarts > 0,
      });
      current = addMinutes(current, this.SLOT_DURATION_MINUTES);
    }

    return slots;
  }

  async readSlot({
    bookingDate,
    bookingTime,
    numberOfPeople,
    serviceId,
  }: ReadSlotDTO) {
    const { localDate, startOfDay, endOfDay } = this.parseLocalDay(bookingDate);
    const service = await this.serviceService.readOne(serviceId);

    if (numberOfPeople > service.maxCapacity || numberOfPeople > this.TOTAL_KARTS) {
      return false;
    }

    const dayOfWeek = localDate.getDay();
    const businessHour = await this.prismaService.businessHour.findUnique({
      where: { dayOfWeek },
    });
    if (!businessHour || !businessHour.isOpen) return false;

    const openTime = this.withTime(localDate, businessHour.openTime);
    const closeTime = this.withTime(localDate, businessHour.closeTime);
    const slotEnd = addMinutes(bookingTime, service.durationMinutes);

    if (isBefore(bookingTime, openTime) || isAfter(slotEnd, closeTime)) {
      return false;
    }

    const [overlappingBookings, blockedPeriods] = await Promise.all([
      this.prismaService.booking.findMany({
        where: {
          bookingDate: { gte: startOfDay, lte: endOfDay },
          status: { in: this.OCCUPIED_STATUSES },
          bookingTime: { lt: slotEnd },
        },
        select: {
          numberOfPeople: true,
          bookingTime: true,
          service: { select: { durationMinutes: true } },
        },
      }),
      this.readActiveBlockedPeriodsForDay(startOfDay, endOfDay),
    ]);

    if (this.isBlocked(blockedPeriods, localDate, bookingTime, slotEnd)) {
      return false;
    }

    let usedKarts = 0;
    for (const booking of overlappingBookings) {
      const bookingEnd = addMinutes(
        booking.bookingTime,
        booking.service.durationMinutes,
      );
      if (this.overlaps(booking.bookingTime, bookingEnd, bookingTime, slotEnd)) {
        usedKarts += booking.numberOfPeople;
      }
    }

    const capacity = Math.min(this.TOTAL_KARTS, service.maxCapacity);
    const availableKarts = capacity - usedKarts;
    return availableKarts >= numberOfPeople;
  }

  private readActiveBlockedPeriodsForDay(startOfDay: Date, endOfDay: Date) {
    return this.prismaService.blockedPeriod.findMany({
      where: {
        isActive: true,
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    });
  }

  private parseLocalDay(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return {
      localDate,
      startOfDay: new Date(year, month - 1, day, 0, 0, 0, 0),
      endOfDay: new Date(year, month - 1, day, 23, 59, 59, 999),
    };
  }

  private withTime(date: Date, time: Date) {
    return setMinutes(setHours(date, time.getHours()), time.getMinutes());
  }

  private overlaps(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date,
  ) {
    return isBefore(startA, endB) && isAfter(endA, startB);
  }

  private isBlocked(
    blockedPeriods: BlockedPeriod[],
    localDate: Date,
    slotStart: Date,
    slotEnd: Date,
  ) {
    return blockedPeriods.some((blockedPeriod) => {
      const blockStart = this.withTime(localDate, blockedPeriod.startTime);
      const blockEnd = this.withTime(localDate, blockedPeriod.endTime);
      return this.overlaps(blockStart, blockEnd, slotStart, slotEnd);
    });
  }

  private validateBlockedPeriod(data: {
    startDate: Date;
    endDate: Date;
    startTime: Date | string;
    endTime: Date | string;
  }) {
    if (data.endDate < data.startDate) {
      throw new BadRequestException(
        'Data final deve ser posterior à data inicial.',
      );
    }
    if (
      data.startDate.getTime() === data.endDate.getTime() &&
      String(data.endTime) <= String(data.startTime)
    ) {
      throw new BadRequestException(
        'Horário final deve ser posterior ao horário inicial.',
      );
    }
  }
}
