---
tags: [kart, resumo, prioridades, melhorias]
---

# Resumo – Prioridades e melhorias

Sugestões de evolução com base na análise módulo a módulo.

## Prioridade alta

| O quê                                                                                                                                        | Onde        |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| ✅ Garantir que booking com assinatura use sempre o endpoint com SubscriptionGuard e que o fluxo sem DEPOSIT não deixe o cliente sem resposta | [[Booking]] |
| ✅ Webhook Abacate: validar assinatura da requisição e tratar idempotência (reenvios)                                                         | [[Abacate]] |

## Prioridade média

| O quê                                                                                                                                     | Onde                             |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| ✅Disponibilidade: tirar TOTAL_KARTS de constante (config/env ou tabela) e documentar; alinhar quais status de booking consomem capacidade | [[Availability]]                 |
| ✅Cupom: validar vigência e uso dentro da mesma transação do booking (ou compensação em falha)                                             | [[Coupon]], [[Booking]]          |
| ✅Endpoints “públicos” ou para cliente: listar planos ativos, listar serviços ativos, perfil do usuário (ex.: GET /users/me)               | [[Plans]], [[Service]], [[User]] |

## Prioridade baixa

| O quê | Onde |
|-------|------|
| Cancelamento de reserva e de assinatura; política de renovação e recarga de créditos; soft delete se precisar de auditoria | [[Booking]], [[Subscription]], [[Prisma]] |
| Documentar exemplo de uso típico da assinatura: cliente verifica `/subscription/active` e em seguida cria booking em `/booking/subscription` | [[Subscription]], [[Booking]] |
| Detalhar na doc do Abacate que o webhook já trata idempotência e ignora pagamentos já processados (atualização segura de Payment/Booking/Subscription) | [[Abacate]] |
| Criar nota ou subseção explicando uso esperado de `Setting` para configurações globais (ex.: capacidade padrão de karts, flags de negócio) | [[Prisma]] |

## Ver também

- [[Kart - Visão Geral]]
- [[00 - Índice (MOC)]]
