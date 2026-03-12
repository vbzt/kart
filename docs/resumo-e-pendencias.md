## Auditoria de Segurança - 2026-03-12

### ⚠️ Problemas Críticos Encontrados
- Falha original no `SubscriptionGuard` impedindo proteção correta de rotas que exigem assinatura ativa.
- Possibilidade de acesso a bookings de outros usuários via `GET /booking/:id` (IDOR), já tratada no código.
- Falta de validação robusta de `id` via `@ParamId()` (agora corrigido com validação de UUID v4).

### 🔸 Melhorias Recomendadas
- Ajustar CORS para ambientes de produção restringindo origens e métodos permitidos.
- Ativar `secure: true` para o cookie `refresh_token` em produção, mantendo `httpOnly` e `sameSite: 'strict'`.
- Revisar periodicamente limites do Throttler para rotas sensíveis conforme volume real de tráfego.

### ✅ Pontos Positivos
- Uso consistente de DTOs com `class-validator` e `class-transformer`, além de `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Guards bem estruturados (`JwtAuthGuard`, `AdminGuard`, `SubscriptionGuard`, `CurrentUser`, `CurrentSubscription`).
- Webhook da AbacatePay protegido com assinatura HMAC (`crypto.timingSafeEqual`) e segredo dedicado.
- `helmet()` habilitado globalmente e acesso ao Supabase feito apenas no backend.

### 📋 Checklist de Pendências
- [ ] Endurecer ainda mais regras de autorização em endpoints que retornam dados sensíveis, se necessário.
- [ ] Documentar política de CORS e cookies específica para produção.
- [ ] Criar/ajustar testes automatizados para cobrir cenários de autenticação, autorização e rate limiting.

