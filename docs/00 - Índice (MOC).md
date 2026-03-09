---
tags: [moc, kart, índice]
---

# Kart (eventos) – Map of Content

Backend NestJS para agendamento de eventos (ex.: kart): usuários, planos, serviços, disponibilidade, reservas avulsas (PIX + cupom) e reservas via assinatura (créditos).

## Visão geral

- [[Kart - Visão Geral]]
- [[Resumo - Prioridades e melhorias]]

## Módulos

| Módulo | Descrição |
|--------|-----------|
| [[Prisma]] | Banco de dados e schema |
| [[Auth]] | Registro, login, JWT, recuperação de senha |
| [[User]] | CRUD de usuários (admin) |
| [[Plans]] | Planos de assinatura e acesso a serviços |
| [[Service]] | Serviços agendáveis (ex.: sessão de kart) |
| [[Availability]] | Horário de funcionamento, bloqueios e slots |
| [[Abacate]] | Pagamentos PIX (AbacatePay) e webhook |
| [[Booking]] | Reservas (PIX ou crédito de assinatura) |
| [[Coupon]] | Cupons de desconto |
| [[Subscription]] | Assinaturas mensais e créditos |
| [[Common]] | Guards, pipes, decorators, tipos compartilhados |

## Dependências entre módulos

```
Prisma → User, Plans, Service, Availability, Abacate, Booking, Coupon, Subscription
User → Auth, Plans, Service, Booking, Subscription, AdminGuard
Auth → User
Plans → Subscription
Service → Plans, Availability, Booking
Availability → Booking
Abacate → Booking, Subscription (webhook atualiza Payment/Booking/Subscription)
Coupon → Booking
Subscription → Booking (SubscriptionGuard)
```

## Stack

- **Runtime:** Node (NestJS 11)
- **ORM:** Prisma (PostgreSQL)
- **Auth:** Supabase Auth + JWT
- **Pagamento:** AbacatePay (PIX)
- **Validação:** class-validator, class-transformer
- **Datas:** date-fns
