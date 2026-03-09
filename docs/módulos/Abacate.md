---
tags: [kart, módulo, abacate, pix, pagamento]
---

# Abacate

## Papel

Pagamentos PIX via AbacatePay: criação de cobrança e recebimento de webhook para confirmar pagamento (atualiza Payment e confirma [[Booking]] ou ativa [[Subscription]]).

## Localização

`src/modules/abacate/`

## Controller (gateway)

- `POST /gateway/abacatepay` – criar pagamento PIX (retorna QR etc.)

## Submódulo Webhook

- `POST /webhook/abacatepay` – recebe eventos do AbacatePay; em `billing.paid` atualiza Payment e confirma booking ou ativa assinatura (startDate/endDate, status ACTIVE).

## Arquivos

- `abacate.controller.ts`
- `abacate.service.ts`
- `webhook/webhook.controller.ts`, `webhook.service.ts`
- DTO: `create-pix.dto.ts`

## Exporta

- `AbacateService` – usado por [[Booking]], [[Subscription]]

## Ver também

- [[Kart - Visão Geral]]
- [[Booking]]
- [[Subscription]]
- [[00 - Índice (MOC)]]
