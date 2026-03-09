---
tags: [kart, módulo, user, admin]
---

# User

## Papel

CRUD de usuários. Rotas protegidas por [[Common#Guards]] (JWT + AdminGuard). Serviço usado por Auth, Plans, Service, Booking, Subscription.

## Localização

`src/modules/user/`

## Controller

- `GET /users` – listar (admin)
- `POST /users` – criar (admin)
- `GET /users/:id` – buscar por id (admin)
- `PATCH /users/:id` – atualizar (admin)
- `DELETE /users/:id` – remover (admin)

## Arquivos

- `user.controller.ts`
- `user.service.ts`
- DTOs: `create-user.dto.ts`, `edit-user.dto.ts`

## Exporta

- `UserService` – usado por [[Auth]], [[Plans]], [[Service]], [[Booking]], [[Subscription]], guards

## Ver também

- [[Kart - Visão Geral]]
- [[00 - Índice (MOC)]]
