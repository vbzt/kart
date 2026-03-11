import { Injectable } from '@nestjs/common';
import AbacatePay from 'abacatepay-nodejs-sdk';
import { CreatePixDTO } from './dto/create-pix.dto';
import { JwtUserPayload } from 'src/common/types/jwt-payload';
import { UserService } from '../user/user.service';

@Injectable()
export class AbacateService {
  private abacate

  constructor(private readonly userService: UserService) {
    const abacateKey = process.env.ABACATE_KEY;

    if (!abacateKey) {
      throw new Error('Chave da API AbacatePay não definida.')
    }

    this.abacate = AbacatePay(abacateKey)
  }

 async createPayment({ amount }: CreatePixDTO, user: JwtUserPayload) {
  const customer = await this.userService.readOne(user.userId)
  const response = await fetch(
    'https://api.abacatepay.com/v1/pixQrCode/create',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ABACATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        expiresIn: 900,
        customer: {
          name: customer.name,
          email: customer.email,
          cellphone: customer.phone,
          taxId: customer.cpf,
        },
      }),
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json?.error ?? 'Erro ao criar QRCode Pix no AbacatePay',
    )
  }

  return json 
}



}
