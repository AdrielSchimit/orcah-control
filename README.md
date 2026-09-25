# ORÇAH CONTROL

Painel interno read-only para monitorar o ORÇAH.

## Objetivo

O Control acompanha empresas, usuários, orçamentos, assinaturas, eventos e integração Asaas sem alterar dados críticos do SaaS.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL Supabase
- Vercel

## Instalação

```bash
npm install
npm run db:validate
npm run build
```

## Execução

```bash
npm run dev
```

## Variáveis de ambiente

Nunca coloque valores reais no repositório.

```env
DATABASE_URL=
DIRECT_URL=
CONTROL_AUTH_SECRET=
CONTROL_ADMIN_EMAILS=
ASAAS_API_URL=
ASAAS_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Comandos

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Segurança

- Login reutiliza usuários existentes do ORÇAH.
- `CONTROL_ADMIN_EMAILS` define a allowlist administrativa.
- Sessão usa cookie `httpOnly`, `sameSite=lax` e `secure` em produção.
- O painel é read-only.
- O frontend não recebe `DATABASE_URL`, `ASAAS_API_KEY`, hashes de senha, tokens ou cookies.
- CPF/CNPJ é mascarado.
- IDs externos financeiros são mascarados quando apropriado.

## Arquitetura

O Prisma usa o mesmo schema do ORÇAH para ler o PostgreSQL Supabase. As páginas protegidas consultam dados no servidor. A área Asaas usa apenas chamadas `GET` server-side.

## Asaas

Veja `docs/ASAAS_AUDIT.md`.
