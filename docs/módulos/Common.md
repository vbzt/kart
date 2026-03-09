---
tags: [kart, módulo, common, guards, pipes]
---

# Common

## Papel

Código compartilhado: guards, pipes, decorators, tipos e config usados por vários módulos.

## Localização

`src/common/`

## Guards

- **JwtAuthGuard** – exige JWT válido.
- **AdminGuard** – exige usuário com role admin.
- **SubscriptionGuard** – exige assinatura ativa; usa SubscriptionService e injeta `req.subscription`.

## Decorators

- **CurrentUser** – extrai usuário do request (JWT).
- **ParamId** – extrai id de parâmetro.
- **CurrentSubscription** – assinatura (quando usada rota com SubscriptionGuard).

## Pipes

- **CpfPipe** – valida/formata CPF.
- **PhonePipe** – valida/formata telefone.
- **ParseCouponPipe** – valida/parse de código de cupom.

## Tipos

- **JwtUserPayload** – payload do JWT (userId, email, etc.).
- **AvailabilitySlot** – representação de slot de disponibilidade.

## Config / Exceptions

- **supabase.config.ts** – config Supabase.
- **supabase-error.handler.ts** – tratamento de erros Supabase.

## Ver também

- [[Kart - Visão Geral]]
- [[Auth]]
- [[User]]
- [[Subscription]]
- [[00 - Índice (MOC)]]
