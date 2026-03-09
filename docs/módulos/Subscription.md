---
tags: [kart, módulo, subscription, assinatura, créditos]
---

# Subscription

## Papel

Assinaturas mensais: criar assinatura (escolher plano), pagar via PIX; após confirmação no webhook [[Abacate]], assinatura fica ativa com créditos. Créditos são usados em [[Booking]] (rota `POST /booking/subscription`). SubscriptionGuard protege rotas que exigem assinatura ativa.

## Localização

`src/modules/subscription/`

**Nota:** SubscriptionModule não está no AppModule; é importado apenas por [[BookingModule]].

## Controller

- `POST /subscription` – criar assinatura (gera PIX)
- `GET /subscription/active` – assinatura ativa do usuário
- `GET /subscription/history` – histórico
- `GET /subscription/:id/payment-status` – status do pagamento

(JWT.)

## Arquivos

- `subscription.controller.ts`
- `subscription.service.ts`
- DTO: `create-subscription.dto.ts`

## Dependências

- [[Prisma]], [[Abacate]], [[Plans]], [[User]]

## Exporta

- `SubscriptionService` – usado por [[Booking]] e por [[Common#SubscriptionGuard]]

## Ver também

- [[Kart - Visão Geral]]
- [[Plans]]
- [[Booking]]
- [[Abacate]]
- [[00 - Índice (MOC)]]
