---
tags: [kart, módulo, auth, jwt, supabase]
---

# Auth

## Papel

Registro, login, logout, refresh de token e recuperação de senha. Validação JWT (Passport). Integração com Supabase Auth.

## Localização

`src/modules/auth/`

## Controller

- `POST /auth/register` – cadastro
- `POST /auth/login` – login
- `POST /auth/logout` – logout
- `POST /auth/refresh` – refresh token
- `POST /auth/recover-password-request` – solicitar recuperação de senha
- `PATCH /auth/reset-password` – redefinir senha
- `GET /auth/me` – usuário logado

## Arquivos

- `auth.controller.ts`
- `auth.service.ts`
- `strategies/jwt.strategy.ts`
- DTOs: `login.dto.ts`, `sign-up.dto.ts`, `reset-password-request.dto.ts`, `reset-password.dto.ts`

## Dependências

- [[User]] (criação/leitura de usuário)
- PassportModule (JWT)

## Ver também

- [[Kart - Visão Geral]]
- [[00 - Índice (MOC)]]
