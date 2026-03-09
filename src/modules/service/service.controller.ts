import { Body, Controller, Delete, Get, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ServiceService } from './service.service';
import { ParamId } from 'src/common/decorators/param-id.decorator';
import { CreateServiceDTO } from './dto/create-service.dto';
import { EditServiceDTO } from './dto/edit-service.dto';

@UseGuards(JwtAuthGuard)
@Controller('service')
export class ServiceController {
  constructor( private readonly serviceService: ServiceService ){}

  @Get('/active')
  async readActive() {
    return this.serviceService.readActive();
  }

  @UseGuards(AdminGuard)
  @Get()
  async read(){ 
    return this.serviceService.read()
  }
  @UseGuards(AdminGuard)
  @Get('/:id')
  async readOne(@ParamId(new ParseUUIDPipe({ version: "4"})) id: string){
    return this.serviceService.readOne(id)
  }
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() data: CreateServiceDTO){ 
    return this.serviceService.create(data)
  }
  @UseGuards(AdminGuard)
  @Patch('/:id')
  async update(@ParamId(new ParseUUIDPipe({ version: "4"})) id: string, @Body() data: EditServiceDTO){ 
    return this.serviceService.update( id, data)
  }
  
  @UseGuards(AdminGuard)
  @Delete("/:id")
  async remove(@ParamId(new ParseUUIDPipe({ version: "4"})) id: string){
    return this.serviceService.remove(id)
  }

}
