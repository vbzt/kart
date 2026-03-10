---
tags: [kart, módulo, booking, reservas]
---

# Booking

## Papel

Criar e listar reservas. Dois fluxos: (1) depósito PIX (cupom opcional) e (2) uso de crédito de assinatura (rota protegida por SubscriptionGuard).

## Localização

`src/modules/booking/`

## Controller

- `GET /booking/my-bookings` – reservas do usuário logado
- `GET /booking/:id` – detalhe de uma reserva
- `POST /booking` – criar reserva (depósito PIX)
- `POST /booking/subscription` – criar reserva com crédito de assinatura (SubscriptionGuard)

## Fluxo depósito

1. Valida slot com [[Availability]] `readSlot`.
2. Opcional: aplica [[Coupon]] e calcula desconto.
3. Transação Prisma: cria [[Prisma#Booking]], chama [[Abacate]] para PIX, cria Payment.
4. Webhook Abacate confirma pagamento e atualiza status do booking.

## Fluxo assinatura

- Usa [[Subscription]] (créditos); cria booking já pago e transação de crédito (uso).
- Rota típica para cliente com assinatura ativa:
  1. Cliente chama `GET /subscription/active` para ver se tem assinatura válida e quantos créditos restam.
  2. Em seguida chama `POST /booking/subscription` com o slot escolhido; o sistema valida assinatura, debita créditos e cria o booking já confirmado (sem novo PIX).

## Arquivos

- `booking.controller.ts`
- `booking.service.ts`
- DTO: `create-booking.dto.ts`

## Dependências

- [[Prisma]], [[Abacate]], [[User]], [[Coupon]], [[Service]], [[Availability]], [[Subscription]]

## Ver também

- [[Kart - Visão Geral]]
- [[Availability]]
- [[Abacate]]
- [[Coupon]]
- [[Subscription]]
- [[00 - Índice (MOC)]]
