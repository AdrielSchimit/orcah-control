# Entrega — Inbox Suporte

Branch feat/support-inbox, base cf1668f. Parear com orcah-clone/feat/mascote-support-chat. Sem merge em main/develop.

Sessão interna → API proxy → gateway autenticado na main. Identidade do browser descartada; IDs Adriel/César derivados da sessão. Não configurar PostgreSQL/Service Role no Control. Asaas também consulta nomes pela ponte; src/lib/db.ts removido. Métricas usam tipos do contrato, sem import de Prisma; schema/dependências legados permanecem como referência histórica.

Ambiente: CONTROL_APP_URL, CONTROL_INTERNAL_SECRET igual ao da main (>= 32 bytes), CONTROL_AUTH_SECRET e credenciais internas existentes; consulte .env.example. Migration fonte exclusivamente na main: 20261007160000_support_chat, pendente de revisão/aplicação no ambiente aprovado. Produção não migrada.

Inbox: filtros, busca, paginação, prioridade, não lidas, contexto seguro, claim/resposta/resolução/reabertura/retorno ao mascote. Polling autenticado ~2 s com backoff, pausa em aba oculta e envio otimista reconciliado. Desktop fila/chat/contexto; mobile lista/conversa e contexto expansível.

Validação: 18 testes, TypeScript, ESLint dos arquivos alterados e build. Integração HTTP/PostgreSQL local e inspeção desktop/mobile pelo script da main, com Control sem credenciais de banco. Fluxo completo, isolamento, concorrência e limites validados com fixtures fictícias.

Limites: dois operadores; sem voz/anexos/WhatsApp/SLA. Fase 2: gestão de operadores, outbox, observabilidade, retenção, curadoria e avaliação de SSE privado. Contrato/transporte/reconciliação espelhados até haver pacote comum.

Relatório completo e evidências: docs/SUPPORT_DELIVERY.md no repositório principal. Lista exata de arquivos no diff do commit.
