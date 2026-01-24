import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CpfPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(!value?.cpf) return value
    
    const cleanCpf = String(value.cpf).replace(/\D/g, '')
    const cleanCpfArray = Array.from(cleanCpf).map((val) => Number(val))
    if(cleanCpfArray.length !== 11) throw new BadRequestException('CPF inválido.')
    
    let total = 0
    let weight = 10
  
    for (let i = 0; i < 9; i++) {
      total += cleanCpfArray[i] * weight
      weight--
    }
  
    const firstDigit = (total * 10) % 11
    const dv1 = firstDigit === 10 ? 0 : firstDigit   
    
    total = 0
    weight = 11

    for (let i = 0; i < 10; i++) {
      total += cleanCpfArray[i] * weight
      weight--
    }

    const secondDigit = (total * 10) % 11
    const dv2 = secondDigit === 10 ? 0 : secondDigit

    const isValid = dv1 === cleanCpfArray[9] && dv2 === cleanCpfArray[10]
    if(!isValid) throw new BadRequestException("CPF inválido.")

    return cleanCpf    

  }

  
}
