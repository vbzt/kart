import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { EditUserDTO } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create( data: CreateUserDTO ){ 
    const user = await this.prismaService.user.findFirst( { where: { email: data.email }} )
    if (user) throw new ConflictException('Usuário com este e-mail já existe.')
    return await this.prismaService.user.create( { data } )
  }

  async read(){
    return this.prismaService.user.findMany()
  }

  async readOne(identifier: string){ 
    const user = await this.prismaService.user.findFirst( { where: {  OR: [ { id: identifier }, { email: identifier } ]} } )
    if(!user) throw new NotFoundException("Este usuário não existe.")
    return user
  }

  async readMe(userId: string){
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        cpf: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if(!user) throw new NotFoundException("Este usuário não existe.")
    return user
  }

  async update( data: EditUserDTO, id: string ){ 
    if(data.email){
      const existingUser = await this.readOne(data.email)
      if (existingUser) throw new ConflictException('Usuário com este e-mail já existe.')
    }

    await this.prismaService.user.update({ where: { id }, data })
  }

  async delete(id: string){ 
    await this.readOne(id)
    const deletedUser =  await this.prismaService.user.delete({ where: { id } } )
    return deletedUser 
  }



}
