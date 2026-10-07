# ORÇAH CONTROL

Painel interno de monitoramento e atendimento do ORÇAH.

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
npm run build
```

## Execução

```bash
npm run dev
```

## Variáveis de ambiente

Nunca coloque valores reais no repositório.

```env
CONTROL_APP_URL=
CONTROL_INTERNAL_SECRET=
CONTROL_AUTH_SECRET=
CONTROL_ADMIN_USER=
CONTROL_ADMIN_PASSWORD_HASH=
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

- Login usa as credenciais internas existentes de Adriel/César.
- `CONTROL_INTERNAL_SECRET` autentica a ponte com a main (mesmo valor, >= 32 bytes).
- Sessão usa cookie `httpOnly`, `sameSite=lax` e `secure` em produção.
- Monitoramento mantém leituras; a área Suporte permite ações autenticadas de atendimento.
- O frontend não recebe `DATABASE_URL`, `ASAAS_API_KEY`, hashes de senha, tokens ou cookies.
- CPF/CNPJ é mascarado.
- IDs externos financeiros são mascarados quando apropriado.

## Arquitetura

O Control usa `controlApi` → gateway interno autenticado na main → serviços/Prisma/PostgreSQL do ORÇAH. Não configurar DATABASE_URL, DIRECT_URL ou Service Role aqui. A página Asaas também consulta nomes de empresas pela ponte.

O schema e dependências Prisma legados permanecem como referência histórica, sem imports em src. O monitoramento usa tipos do contrato do gateway e o build não roda prisma generate. Alterações de banco pertencem exclusivamente ao orcah-clone.

Veja [entrega do suporte](docs/SUPPORT_DELIVERY.md).

## Asaas

Veja `docs/ASAAS_AUDIT.md`.
