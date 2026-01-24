import { BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common";

export function handleSupabaseError(supabaseError: any){ 
  const message = supabaseError.message?.toLowerCase() || ''

  if(message.includes('already registered')){ 
    throw new ConflictException('Este email já está cadastrado.')
  }

  if(message.includes('invalid login credentials')){ 
    throw new UnauthorizedException('Email ou senha inválidos.')
  }

  if(message.includes('email not confirmed')){ 
    throw new BadRequestException('Este email ainda não foi confirmado. Verifique sua caixa de entrada.')
  }

  if (message.includes('refresh') || message.includes('token')) {
    throw new UnauthorizedException('Sessão expirada')
  }

  throw new BadRequestException(supabaseError.message || 'Erro ao enviar requisição')

}