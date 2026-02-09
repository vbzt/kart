import { Injectable } from '@nestjs/common';
import AbacatePay from 'abacatepay-nodejs-sdk';
import { CreatePixDTO } from './dto/create-pix.dto';

@Injectable()
export class AbacateService {
  private abacate

  constructor() {
    const abacateKey = process.env.ABACATE_KEY;

    if (!abacateKey) {
      throw new Error('Chave da API AbacatePay não definida.')
    }

    this.abacate = AbacatePay(abacateKey)
  }

 async createPayment(data: CreatePixDTO) {
  const response = await fetch(
    'https://api.abacatepay.com/v1/pixQrCode/create',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ABACATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.price,
        expiresIn: 900,
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          cellphone: data.customer.cellphone,
          taxId: data.customer.taxId,
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
