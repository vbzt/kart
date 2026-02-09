import { Body, Controller, Post } from '@nestjs/common';
import { CreatePixDTO } from './dto/create-pix.dto';
import { AbacateService } from './abacate.service';

@Controller('gateway/abacatepay')
export class AbacateController {
  constructor(private readonly abacateService: AbacateService){}

  @Post()
  async createPix(@Body() data: CreatePixDTO){ 
    return await this.abacateService.createPayment(data)
  }
}
