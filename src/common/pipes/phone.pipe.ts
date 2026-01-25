import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class Phonepipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(!value?.phone) return value
    
    const cleanPhone = String(value.phone).replace(/\D/g, '')
    if(cleanPhone.length !== 11) throw new BadRequestException("Telefone inválido.")
    return { ...value, phone: cleanPhone}
  }
}
