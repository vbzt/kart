---
tags: [kart, módulo, subscription, assinatura, créditos]
---

# Subscription

## Papel

Assinaturas mensais: criar assinatura (escolher plano), pagar via PIX; após confirmação no webhook [[Abacate]], assinatura fica ativa com créditos. Créditos são usados em [[Booking]] (rota `POST /booking/subscription`). SubscriptionGuard protege rotas que exigem assinatura ativa.

### Uso típico

1. Cliente autenticado chama `GET /subscription/active` para verificar se tem assinatura ativa e ver créditos/datas.
2. Com assinatura ativa, cria reservas usando `POST /booking/subscription` (fluxo protegido por `SubscriptionGuard` e que debita créditos em vez de gerar um novo PIX).

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
