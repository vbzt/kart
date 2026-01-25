import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { ParamId } from 'src/common/decorators/param-id.decorator';
import { CreatePlanDTO } from './dto/create-plan.dto';
import { EditPlanDTO } from './dto/edit-plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor( private readonly plansService: PlansService){ }

  @Get('')
  async read(){ 
    return this.plansService.read()
  }

  @Get('/:id')
  async readOne(@ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.readOne(id)
  }

  @Post()
  async create(@Body() data: CreatePlanDTO){ 
    return this.plansService.create(data)
  }


  @Patch('/:id')
  async update(@Body() data: EditPlanDTO, @ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.update(data, id)
  }

  
  @Delete('/:id')
  async delete(@ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.remove(id)
  }


}
