---
tags: [kart, resumo, arquitetura]
---

# Kart (eventos) – Visão Geral

## O que é

Backend em **NestJS 11** para sistema de agendamento de eventos (ex.: sessões de kart), com:

- Autenticação (Supabase + JWT)
- Planos de assinatura com créditos mensais
- Serviços agendáveis (preço, duração, capacidade)
- Disponibilidade por horário de funcionamento e períodos bloqueados
- Reservas avulsas (pagamento PIX + cupom) ou com crédito de assinatura
- Cupons de desconto (percentual ou fixo)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 11 |
| Banco | PostgreSQL (Prisma) |
| Auth | Supabase Auth, JWT (Passport) |
| Pagamento | AbacatePay (PIX) |
| Validação | class-validator, class-transformer |
| Utilitários | date-fns |

## Estrutura de módulos

- [[Prisma]] – Acesso ao banco e schema
- [[Auth]] – Registro, login, logout, refresh, recuperação de senha
- [[User]] – CRUD usuários (admin)
- [[Plans]] – Planos e quais serviços cada plano inclui
- [[Service]] – Serviços (ex.: kart) – CRUD admin
- [[Availability]] – Horários de funcionamento, bloqueios, slots disponíveis
- [[Abacate]] – Criar PIX e receber webhook de confirmação
- [[Booking]] – Criar/listar reservas (depósito PIX ou crédito assinatura)
- [[Coupon]] – Cupons de desconto
- [[Subscription]] – Assinaturas (criar, pagar PIX, usar créditos)
- [[Common]] – Guards, pipes, decorators, tipos

## Fluxos principais

1. **Reserva avulsa:** Cliente escolhe serviço e slot → aplica cupom (opcional) → gera PIX → webhook confirma → booking fica pago.
2. **Reserva com assinatura:** Cliente com assinatura ativa → escolhe slot → usa créditos (sem PIX nessa hora).
3. **Assinatura:** Cliente escolhe plano → gera PIX → webhook confirma → assinatura ativa, créditos disponíveis.

## Entrada no app

- [[00 - Índice (MOC)]]
