---
tags: [kart, módulo, prisma, banco]
---

# Prisma

## Papel

Acesso ao banco de dados e definição do schema (PostgreSQL).

## Localização

`src/modules/prisma/`

## Arquivos

- `prisma.service.ts`
- `prisma.module.ts`
- `prisma/schema.prisma`

## Modelos principais

- **User** – usuários (email, nome, CPF, telefone, role)
- **Service** – serviços agendáveis (preço, duração, capacidade, priceType)
- **Plan** – planos de assinatura (créditos/mês, preço)
- **PlanServiceAccess** – relação plano ↔ serviços
- **Booking** – reservas (serviço, usuário, data/hora, status, preço, cupom)
- **Payment** – pagamentos (booking ou subscription, provider, status)
- **Subscription** – assinaturas (usuário, plano, créditos, datas)
- **CreditTransaction** – uso/compra/ajuste de créditos
- **Coupon** – cupons (código, tipo, valor, validade, usos)
- **BusinessHour** – horário de funcionamento por dia da semana
- **BlockedPeriod** – períodos bloqueados (datas e horários)
- **Setting** – chave/valor para configurações

### Uso do modelo Setting

- Armazena configurações globais do sistema em formato chave/valor (ex.: capacidade padrão de karts, limites de agendamento, flags de negócio).
- Permite mover constantes de código (como capacidade total de karts) para o banco, facilitando ajustes sem deploy.

## Enums

- UserRole, PriceType, BookingStatus, ExperienceLevel
- PaymentStatus, PaymentType, SubscriptionStatus
- CreditTransactionType, DiscountType

## Relações

Usado por: [[User]], [[Plans]], [[Service]], [[Availability]], [[Abacate]], [[Booking]], [[Coupon]], [[Subscription]].

## Ver também

- [[Kart - Visão Geral]]
- [[00 - Índice (MOC)]]
