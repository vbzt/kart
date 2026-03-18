import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService, private readonly userService: UserService){}

  async readAdmins(){ 
    return this.prismaService.user.findMany({ where: { role: 'ADMIN'}})
  }

  async setAdminUser(userId: string){ 
    const user = await this.userService.readOne(userId)
    if(user.role === "ADMIN") throw new BadRequestException("Usuário já é admin.")
    await this.prismaService.user.update({ data: { role: "ADMIN" }, where: { id: userId } } )
    return { message: "Usuário admin atualizado com sucesso."}
  }

  async removeAdminUser(userId: string){ 
    const user = await this.userService.readOne(userId)
    if(user.role ===  "CLIENT") throw new BadRequestException("Usuário não é um admin.")
    await this.prismaService.user.update({ data: { role: "CLIENT" }, where: { id: userId } } )
    return { message: "Usuário admin atualizado com sucesso."}
  }



}
