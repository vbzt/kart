import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseCouponPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(!value?.code) return value
    const parsedCode = String(value.code).trim().toUpperCase()
    return { ...value, code: parsedCode}

  }
}
