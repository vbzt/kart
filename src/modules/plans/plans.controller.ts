import { BadRequestException, Body, Controller, Delete, Get, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { ParamId } from 'src/common/decorators/param-id.decorator';
import { CreatePlanDTO } from './dto/create-plan.dto';
import { EditPlanDTO } from './dto/edit-plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor( private readonly plansService: PlansService){ }

  @Get('')
  async read(@Query('active') active?: string){ 
    let isActive: boolean | undefined = undefined
    if (active !== undefined) {
      const normalized = active.trim().toLowerCase()
      if (!['true', 'false', '1', '0'].includes(normalized)) {
        throw new BadRequestException("Query param 'active' deve ser boolean (true/false).")
      }
      isActive = normalized === 'true' || normalized === '1'
    }
    return this.plansService.read({ isActive })
  }

  @Get('/:id')
  async readOne(@ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.readOne(id)
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() data: CreatePlanDTO){ 
    return this.plansService.create(data)
  }


  @Patch('/:id')
  @UseGuards(AdminGuard)
  async update(@Body() data: EditPlanDTO, @ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.update(data, id)
  }

  
  @Delete('/:id')
  @UseGuards(AdminGuard)
  async delete(@ParamId(new ParseUUIDPipe({ version: '4' })) id: string){ 
    return this.plansService.remove(id)
  }


}
