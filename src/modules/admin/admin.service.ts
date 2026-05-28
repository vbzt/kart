import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma, SubscriptionStatus } from '@prisma/client';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService, private readonly userService: UserService){}

  async readAdmins(){ 
    return this.prismaService.user.findMany({ where: { role: 'ADMIN'}})
  }

  async readDashboardMetrics() {
    const { startOfDay, endOfDay } = this.getTodayRange();

    const [
      reservationsToday,
      paidToday,
      pendingPix,
      todayBookings,
      activeSubscribers,
      subscriptionsByPlan,
    ] = await Promise.all([
      this.prismaService.booking.count({
        where: { bookingDate: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prismaService.payment.aggregate({
        _sum: { amountCents: true },
        where: {
          paidAt: { gte: startOfDay, lte: endOfDay },
          status: { in: [PaymentStatus.APPROVED, PaymentStatus.PAID] },
        },
      }),
      this.prismaService.payment.count({
        where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] } },
      }),
      this.prismaService.booking.findMany({
        where: { bookingDate: { gte: startOfDay, lte: endOfDay } },
        include: { service: { select: { maxCapacity: true } } },
      }),
      this.prismaService.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prismaService.subscription.groupBy({
        by: ['planId'],
        _count: { _all: true },
        where: { status: SubscriptionStatus.ACTIVE },
      }),
    ]);

    const planIds = subscriptionsByPlan.map((item) => item.planId);
    const plans = await this.prismaService.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true },
    });
    const planNameById = new Map(plans.map((plan) => [plan.id, plan.name]));

    return {
      kpis: {
        reservationsToday,
        revenueTodayCents: paidToday._sum.amountCents ?? 0,
        averageOccupancy: this.calculateAverageOccupancy(todayBookings),
        pendingPix,
      },
      occupancyByHour: this.calculateOccupancyByHour(todayBookings),
      activeSubscribers,
      subscribersByPlan: subscriptionsByPlan.map((item) => ({
        planId: item.planId,
        planName: planNameById.get(item.planId) ?? 'Plano',
        subscribers: item._count._all,
      })),
    };
  }

  async readBookings(filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
  }) {
    const where: Prisma.BookingWhereInput = {};

    if (filters.dateFrom || filters.dateTo) {
      where.bookingDate = {
        ...(filters.dateFrom ? { gte: this.parseLocalDate(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: this.parseLocalDate(filters.dateTo) } : {}),
      };
    }

    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) {
      where.payments = { some: { status: filters.paymentStatus } };
    }
    if (filters.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { service: { title: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prismaService.booking.findMany({
      where,
      include: {
        payments: { orderBy: { createdAt: 'desc' } },
        service: true,
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
      orderBy: [{ bookingDate: 'asc' }, { bookingTime: 'asc' }],
    });
  }

  async setAdminUser(userId: string){ 
    const user = await this.userService.readOne(userId)
    if(user.role === "ADMIN") throw new BadRequestException("Usuário já é admin.")
    await this.prismaService.user.update({ data: { role: "ADMIN" }, where: { id: userId } } )
    return { message: "Usuário admin atualizado com sucesso."}
  }

  async removeAdminUser(userId: string){ 
    const user = await this.userService.readOne(userId)
    if(user.role ===  "CLIENT") throw new BadRequestException("Usuário não é um admin.")
    await this.prismaService.user.update({ data: { role: "CLIENT" }, where: { id: userId } } )
    return { message: "Usuário admin atualizado com sucesso."}
  }



  private getTodayRange() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    return { startOfDay, endOfDay };
  }

  private parseLocalDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private calculateAverageOccupancy(
    bookings: Array<{ numberOfPeople: number; service: { maxCapacity: number } }>,
  ) {
    if (!bookings.length) return 0;

    const totalOccupancy = bookings.reduce((sum, booking) => {
      const capacity = Math.max(booking.service.maxCapacity, 1);
      return sum + Math.min((booking.numberOfPeople / capacity) * 100, 100);
    }, 0);

    return Math.round(totalOccupancy / bookings.length);
  }

  private calculateOccupancyByHour(
    bookings: Array<{
      bookingTime: Date;
      numberOfPeople: number;
      service: { maxCapacity: number };
    }>,
  ) {
    const groups = new Map<string, { used: number; capacity: number }>();

    for (const booking of bookings) {
      const label = `${String(booking.bookingTime.getHours()).padStart(2, '0')}h`;
      const current = groups.get(label) ?? { used: 0, capacity: 0 };
      current.used += booking.numberOfPeople;
      current.capacity += Math.max(booking.service.maxCapacity, 1);
      groups.set(label, current);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({
        label,
        value: value.capacity ? Math.round((value.used / value.capacity) * 100) : 0,
      }));
  }
}
