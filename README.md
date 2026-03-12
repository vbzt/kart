<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
<div align="center">

## Kart

### API de agendamento para baterias de drift de kart

Construída com NestJS · Focada em segurança e experiência do piloto

[Visão geral](#visão-geral) • [Arquitetura](#arquitetura) • [Stack](#tech-stack) • [Getting Started](#getting-started) • [Segurança](#segurança)

</div>

---

## Visão geral

Kart é uma API backend para gerenciar agendamentos de baterias de drift, planos de assinatura e pagamentos via Pix (AbacatePay).  
Ela foi desenhada para lidar com:

- **Reservas de horários** considerando capacidade de karts e conflitos de agenda.
- **Planos de assinatura** com créditos mensais.
- **Pagamentos via Pix** integrados com AbacatePay.
- **Autenticação segura** com Supabase e JWT.

---

## Arquitetura

O projeto segue a arquitetura modular do NestJS:

```text
src/
├── app.module.ts        # Módulo raiz
├── main.ts              # Bootstrap da aplicação
└── modules/
    ├── auth/            # Autenticação (Supabase + JWT)
    ├── user/            # Usuários e perfis
    ├── service/         # Serviços (tipos de bateria / sessões)
    ├── availability/    # Regras de disponibilidade e slots
    ├── booking/         # Agendamentos
    ├── plans/           # Planos de assinatura
    ├── subscription/    # Assinaturas ativas / histórico
    ├── coupon/          # Cupons de desconto
    ├── abacate/         # Integração com AbacatePay (Pix + webhooks)
    └── prisma/          # Cliente Prisma e acesso ao banco
```

No diretório `common/` ficam peças reutilizáveis:

- `guards` (`JwtAuthGuard`, `AdminGuard`, `SubscriptionGuard`)
- `decorators` (`CurrentUser`, `CurrentSubscription`, `ParamId`)
- `pipes` (sanitização de CPF, telefone, cupom)
- `types` (payload JWT, slots de disponibilidade, etc.)

---

## Tech Stack

- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** compatível com o configurado em `prisma/schema.prisma`
- **Autenticação:** Supabase Auth (JWT + JWKS)
- **Pagamentos:** AbacatePay (Pix + webhooks)
- **Validação:** class-validator + class-transformer
- **Segurança:** helmet, guards customizados, DTOs com validação e pipes
- **Rate limiting:** @nestjs/throttler

---

## Getting Started

### Pré-requisitos

- Node.js 18+
- npm
- Banco de dados compatível com o `schema.prisma` (ex.: PostgreSQL/MySQL)

### Instalação

```bash
# Clonar o repositório
git clone <seu-repo-aqui>.git
cd kart

# Instalar dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto com, no mínimo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kart"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_KEY="sua-service-key"
ABACATE_KEY="sua_chave_abacatepay"
ABACATE_WEBHOOK_SECRET="seu_webhook_secret"
TOTAL_KARTS=10
PORT=3000
```

Ajuste os valores para o seu ambiente/banco.

### Migrações do Prisma

```bash
npx prisma migrate dev
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Por padrão a API sobe em `http://localhost:3000`.

### Build e produção

```bash
npm run build
npm run start:prod
```

---

## Segurança

Alguns pontos importantes da implementação:

- **Autenticação**
  - JWT com estratégia `passport-jwt` e chaves da Supabase via JWKS.
  - `JwtAuthGuard` centralizado e decorators como `CurrentUser` para acessar o payload.

- **Autorização**
  - `AdminGuard` para rotas administrativas (usuários, serviços, planos, cupons, etc.).
  - `SubscriptionGuard` para rotas que exigem assinatura ativa.

- **Validação e sanitização**
  - `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.
  - DTOs validados com `class-validator`.
  - Pipes para normalizar CPF, telefone e códigos de cupom.

- **Rate limiting**
  - `ThrottlerModule` configurado globalmente.
  - Limites mais agressivos em rotas sensíveis:
    - `/auth/register`, `/auth/login`, `/auth/refresh`
    - Criação de bookings e assinaturas
    - Criação de pagamentos Pix via AbacatePay
  - Webhook do AbacatePay com `@SkipThrottle()` para não bloquear notificações externas.

> Em ambiente de produção, recomenda-se endurecer a configuração de CORS e cookies (por exemplo, `secure: true` para cookies de refresh e `origin` restrito no CORS).

---

## Endpoints (visão de alto nível)

- `/auth` – registro, login, refresh de sessão, recuperação de senha, `/me`.
- `/users` – gestão de usuários (admin) e `/users/me` para dados do próprio usuário.
- `/service` – serviços de pista (tipos de baterias, preços, duração, capacidade).
- `/availability` – horários de funcionamento, períodos bloqueados, verificação de slots.
- `/booking` – criação e listagem de agendamentos (incluindo uso de créditos de assinatura).
- `/plans` – planos de assinatura com créditos mensais.
- `/subscription` – aquisição, renovação e leitura de assinaturas ativas/histórico.
- `/coupon` – cupons de desconto (criação/edição apenas para admin).
- `/gateway/abacatepay` – criação de pagamentos Pix.
- `/webhook/abacatepay` – webhook de notificação do AbacatePay.

---

## License

Este projeto é **código proprietário**.  
Nenhum uso, cópia, modificação, distribuição ou uso comercial por terceiros é permitido sem autorização explícita por escrito do autor.

---

## Autor

- **Nome:** Vitor de Castro Buzato  
- **Email:** vitorcastrobuzato@gmail.com  
- **GitHub:** https://github.com/vbzt


