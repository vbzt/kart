import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDTO } from './dto/create-coupon.dto';
import { EditCouponDTO } from './dto/edit-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateCouponDTO) {
    this.validateCouponRules(data);

    const existingCoupon = await this.prismaService.coupon.findUnique({
      where: { code: data.code },
    });
    if (existingCoupon) throw new ConflictException('Este cupom já existe.');

    const coupon = await this.prismaService.coupon.create({ data });
    return { message: 'Cupom criado com sucesso.', coupon };
  }

  async read() {
    return this.prismaService.coupon.findMany();
  }

  async readOne(code: string) {
    const coupon = await this.prismaService.coupon.findUnique({
      where: { code },
    });
    if (!coupon) throw new NotFoundException('Este cupom não existe.');
    return coupon;
  }

  async update(data: EditCouponDTO, code: string) {
    const currentCoupon = await this.readOne(code);
    this.validateCouponRules({ ...currentCoupon, ...data });

    if (data.code && data.code !== code) {
      const existingCoupon = await this.prismaService.coupon.findUnique({
        where: { code: data.code },
      });
      if (existingCoupon) throw new ConflictException('Este cupom já existe.');
    }

    const updatedCoupon = await this.prismaService.coupon.update({
      where: { code },
      data,
    });
    return { message: 'Cupom atualizado com sucesso.', updatedCoupon };
  }

  async delete(code: string) {
    await this.readOne(code);
    await this.prismaService.coupon.delete({ where: { code } });
    return { message: 'Cupom removido com sucesso.' };
  }

  async useCoupon(
    price: number,
    couponCode: string,
    client: Prisma.TransactionClient | PrismaService = this.prismaService,
  ) {
    const coupon = await client.coupon.findUnique({ where: { code: couponCode } });
    if (!coupon) throw new NotFoundException('Este cupom não existe.');

    this.assertCouponCanBeUsed(coupon);

    const updated = await client.coupon.updateMany({
      where: { code: couponCode, currentUses: coupon.currentUses },
      data: { currentUses: { increment: 1 } },
    });

    if (updated.count !== 1) {
      throw new BadRequestException(
        'Cupom atingiu o limite de uso. Tente novamente.',
      );
    }

    if (coupon.discountType === DiscountType.FIXED) {
      const discount = Math.min(price, coupon.discountValue);
      return { finalPrice: price - discount, discount };
    }

    const discount = Math.min(
      price,
      Math.round(price * (coupon.discountValue / 100)),
    );
    return { finalPrice: price - discount, discount };
  }

  private assertCouponCanBeUsed(coupon: {
    isActive: boolean;
    maxUses: number | null;
    currentUses: number;
    validFrom: Date | null;
    validUntil: Date | null;
  }) {
    const now = new Date();

    if (!coupon.isActive) throw new BadRequestException('Cupom inválido.');
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestException('Cupom ainda não está válido.');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw new BadRequestException('Cupom expirado.');
    }
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('Cupom atingiu o limite de uso.');
    }
  }

  private validateCouponRules(data: {
    discountType?: DiscountType;
    discountValue?: number;
    validFrom?: Date | null;
    validUntil?: Date | null;
  }) {
    if (
      data.discountType === DiscountType.PERCENTAGE &&
      data.discountValue !== undefined &&
      data.discountValue > 100
    ) {
      throw new BadRequestException(
        'Cupom percentual não pode ter desconto acima de 100%.',
      );
    }

    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil) {
      throw new BadRequestException(
        'Data inicial do cupom deve ser anterior à data final.',
      );
    }
  }
}
