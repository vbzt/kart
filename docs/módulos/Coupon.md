---
tags: [kart, módulo, coupon, cupom, desconto]
---

# Coupon

## Papel

Cupons de desconto (percentual ou valor fixo). CRUD de cupons e aplicação no fluxo de [[Booking]] (método `useCoupon` incrementa `currentUses`).

## Localização

`src/modules/coupon/`

## Controller

- `GET /coupon` – listar
- `GET /coupon/:code` – buscar por código (ParseCouponPipe)
- `POST /coupon` – criar
- `PATCH /coupon/:id` – atualizar
- `DELETE /coupon/:id` – remover

## Arquivos

- `coupon.controller.ts`
- `coupon.service.ts`
- DTOs: `create-coupon.dto.ts`, `edit-coupon.dto.ts`

## Modelo (resumo)

- code, discountType (PERCENTAGE | FIXED), discountValue
- isActive, validFrom, validUntil, maxUses, currentUses

## Exporta

- `CouponService` – usado por [[Booking]]

## Ver também

- [[Kart - Visão Geral]]
- [[Booking]]
- [[00 - Índice (MOC)]]
