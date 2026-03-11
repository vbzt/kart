import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreatePixDTO } from './dto/create-pix.dto';
import { AbacateService } from './abacate.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUserPayload } from 'src/common/types/jwt-payload';

@UseGuards(JwtAuthGuard)
@Controller('gateway/abacatepay')
export class AbacateController {
  constructor(private readonly abacateService: AbacateService){}

  @Post()
  async createPix(@Body() data: CreatePixDTO, @CurrentUser() user: JwtUserPayload){ 
    return await this.abacateService.createPayment(data, user)
  }
}
