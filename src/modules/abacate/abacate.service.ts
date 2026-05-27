import { BadGatewayException, Injectable } from '@nestjs/common';
import { JwtUserPayload } from 'src/common/types/jwt-payload';
import { UserService } from '../user/user.service';
import { CreatePixDTO } from './dto/create-pix.dto';

@Injectable()
export class AbacateService {
  private readonly abacateKey: string;

  constructor(private readonly userService: UserService) {
    const abacateKey = process.env.ABACATE_KEY;

    if (!abacateKey) {
      throw new Error('Chave da API AbacatePay não definida.');
    }

    this.abacateKey = abacateKey;
  }

  async createPayment({ amount }: CreatePixDTO, user: JwtUserPayload) {
    const customer = await this.userService.readOne(user.userId);
    const response = await fetch(
      'https://api.abacatepay.com/v2/transparents/create',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.abacateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'PIX',
          data: {
            amount,
            expiresIn: 900,
            description: 'Reserva Kart',
            customer: {
              name: customer.name,
              email: customer.email,
              cellphone: customer.phone,
              taxId: customer.cpf,
            },
            metadata: {
              userId: customer.id,
            },
          },
        }),
      },
    );

    const json = await response.json();

    if (!response.ok || json?.error || !json?.data) {
      throw new BadGatewayException(
        json?.error ?? 'Erro ao criar cobrança Pix no AbacatePay.',
      );
    }

    return json;
  }
}
