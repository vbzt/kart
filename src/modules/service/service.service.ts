import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDTO } from './dto/create-service.dto';
import { EditServiceDTO } from './dto/edit-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService){}

  async create(data: CreateServiceDTO){ 
    const service = await this.prismaService.service.create( { data } )
    return { message: "Serviço criado com sucesso.", service }
  }

  async read(){ 
    return this.prismaService.service.findMany()
  }

  async readOne(id: string){ 
    const service = await this.prismaService.service.findUnique( { where: { id } } )
    if(!service) throw new NotFoundException("Este serviço não existe.")
    return service
  }

  async update(id: string, data: EditServiceDTO){ 
    await this.readOne(id)
    const updatedService = await this.prismaService.service.update( { where: { id }, data} )
    return { message: "Serviço atualizado com sucesso.", updatedService }
  } 

  async remove(id: string){ 
    await this.readOne(id)
    await this.prismaService.service.delete( { where: { id } } )
    return { message: "Serviço removido com sucesso." }
  }

}
