"use client";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { useOperatorThread, useSupportInbox } from "@/lib/support/use-support-inbox";
import { MESSAGE_MAX_LENGTH, SUPPORT_STATUS_LABEL, type SupportContext } from "@/lib/support/types";
import type { PendingMessage } from "@/lib/support/reconcile";
import styles from "./support-inbox.module.css";

const filters = [{ status: "QUEUED", label: "Na fila" }, { status: "HUMAN", label: "Em atendimento" }, { status: "RESOLVED", label: "Resolvidos" }, { status: "", label: "Todos" }];
const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const planLabels: Record<string, string> = { trialing: "Em teste", active: "Ativo", past_due: "Pendente", canceled: "Cancelado", expired: "Expirado" };

function ProviderContext({ context }: { context: SupportContext }) {
  return <aside className={styles.context} aria-label="Contexto do prestador"><p className={styles.eyebrow}>Prestador</p><div className={styles.avatar}>{context.company.slice(0, 1)}</div><h3>{context.company}</h3><p className={styles.contextName}>{context.provider}</p><dl>
    {[["Ramo", context.category], ["Cidade", context.city], ["WhatsApp", context.whatsapp || "Não informado"], ["Plano", context.plan], ["Status do plano", planLabels[context.planStatus] || context.planStatus], ["Serviços", String(context.services)], ["Orçamentos", String(context.budgets)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl><Link href={`/empresas/${context.companyId}`} className={styles.companyLink}>Abrir empresa no Control ↗</Link></aside>;
}

function Conversation({ id, operatorId, operatorName, back, changed }: { id: string; operatorId: string; operatorName: string; back: () => void; changed: () => void }) {
  const chat = useOperatorThread(id, operatorId, operatorName, changed);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const lastId = chat.messages.at(-1)?.id;
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [lastId]);
  const thread = chat.snapshot?.thread;
  const context = chat.snapshot?.context;
  const mine = thread?.status === "HUMAN" && thread.assignedOperatorId === operatorId;
  const other = thread?.status === "HUMAN" && !mine;
  function submit() { if (!draft.trim() || !mine || chat.busy) return; const content = draft.trim(); setDraft(""); void chat.send(content); }
  return <>
    <section className={styles.conversation} aria-label="Conversa de suporte">
      <header className={styles.chatHeader}><button type="button" className={styles.back} onClick={back} aria-label="Voltar à fila">←</button><div><h2>{context?.company || "Carregando conversa…"}</h2><p>{thread ? SUPPORT_STATUS_LABEL[thread.status] : ""}{thread?.assignedOperator ? ` · ${thread.assignedOperator}` : ""}</p></div><span className={styles.connection} data-connected={chat.connected}>{chat.connected ? "Conectado" : "Reconectando…"}</span></header>
      {thread && <div className={styles.actions}>
        {thread.status === "QUEUED" && <button className={styles.primary} type="button" disabled={chat.busy} onClick={() => void chat.action("claim")}>Assumir atendimento</button>}
        {mine && <button className={styles.primary} type="button" disabled={chat.busy} onClick={() => void chat.action("resolve")}>Resolver atendimento</button>}
        {thread.status === "RESOLVED" && <button className={styles.primary} type="button" disabled={chat.busy} onClick={() => void chat.action("reopen")}>Reabrir</button>}
        {thread.status !== "BOT" && <button type="button" disabled={chat.busy || other} onClick={() => void chat.action("return-to-bot")}>Devolver ao mascote</button>}
        <button type="button" aria-pressed={thread.priority === "HIGH"} disabled={chat.busy || other} onClick={() => void chat.action("priority", thread.priority === "HIGH" ? "NORMAL" : "HIGH")}>{thread.priority === "HIGH" ? "★ Prioridade alta" : "☆ Marcar prioridade"}</button>
      </div>}
      <div className={styles.history} role="log" aria-label="Histórico da conversa" aria-live="polite" aria-relevant="additions text">
        {chat.snapshot?.olderCursor && <button type="button" className={styles.older} disabled={chat.busy} onClick={() => void chat.older()}>Ver mensagens anteriores</button>}
        {chat.messages.map(m => m.senderType === "SYSTEM" ? <p key={m.id} className={styles.system}>{m.content}</p> : <div key={m.id} className={styles.bubble} data-sender={m.senderType}>
          <span className={styles.sender}>{m.senderType === "USER" ? context?.provider || "Prestador" : m.senderType === "ASSISTANT" ? "Assistente ORÇAH" : m.senderName}</span><p>{m.content}</p><span className={styles.timestamp}>{date(m.createdAt)}{"delivery" in m && m.delivery === "sending" ? " · Enviando…" : ""}</span>
          {"delivery" in m && m.delivery === "failed" && <button type="button" disabled={chat.busy || !mine} className={styles.retry} onClick={() => void chat.send(m.content, m as PendingMessage)}>Não enviada · Tentar novamente</button>}
        </div>)}
        {!chat.messages.length && chat.snapshot && <p className={styles.empty}>O histórico aparecerá aqui.</p>}
        <div ref={end} />
      </div>
      {chat.error && <p role="alert" className={styles.error}>{chat.error}</p>}
      {!mine && thread && <p className={styles.composerHint}>{other ? `Atendimento com ${thread.assignedOperator}.` : thread.status === "QUEUED" ? "Assuma o atendimento para responder." : thread.status === "RESOLVED" ? "Atendimento resolvido. Reabra para continuar." : "O Assistente ORÇAH está conversando com o prestador."}</p>}
      <form className={styles.composer} onSubmit={e => { e.preventDefault(); submit(); }}><label className="sr-only" htmlFor="operator-draft">Resposta ao prestador</label><textarea id="operator-draft" rows={2} value={draft} maxLength={MESSAGE_MAX_LENGTH} onChange={e => setDraft(e.target.value)} disabled={!mine} placeholder="Escreva sua resposta…" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} /><button type="submit" disabled={!mine || !draft.trim() || chat.busy}>Enviar</button><small>{draft.length}/{MESSAGE_MAX_LENGTH} · Enter envia, Shift + Enter quebra a linha</small></form>
      {context && <details className={styles.mobileContext}><summary>Ver contexto do prestador</summary><ProviderContext context={context} /></details>}
    </section>
    {context && <div className={styles.desktopContext}><ProviderContext context={context} /></div>}
  </>;
}

export function SupportInbox({ operatorId, operatorName }: { operatorId: string; operatorName: string }) {
  const [status, setStatus] = useState("QUEUED");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const deferred = useDeferredValue(query);
  const inbox = useSupportInbox(status, deferred, offset);
  const { refresh } = inbox;
  const changed = useCallback(() => { void refresh().catch(() => {}); }, [refresh]);
  return <>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>ORÇAH Control</p><h1>Suporte</h1><p>Do assistente à pessoa certa, na mesma conversa.</p></div><span className={styles.operator}>{operatorName} · {inbox.connected ? "Online" : "Reconectando…"}</span></header>
    <div className={styles.inbox} data-selected={Boolean(selected)}>
      <section className={styles.queue} aria-label="Fila de suporte">
        <div className={styles.queueTools}><div className={styles.filters} aria-label="Filtrar conversas">{filters.map(f => <button key={f.status} type="button" aria-pressed={status === f.status} onClick={() => { setStatus(f.status); setOffset(0); }}>{f.label}</button>)}</div><label className="sr-only" htmlFor="support-search">Buscar por empresa, prestador, e-mail ou telefone</label><input id="support-search" value={query} maxLength={100} onChange={e => { setQuery(e.target.value); setOffset(0); }} placeholder="Buscar empresa ou prestador…" /></div>
        {inbox.error && <p className={styles.error} role="alert">{inbox.error}</p>}
        <div className={styles.queueList}>{inbox.data?.rows.map(row => <button key={row.id} type="button" className={styles.queueItem} aria-pressed={selected === row.id} onClick={() => setSelected(row.id)}>
          <div className={styles.queueIdentity}><span className={styles.smallAvatar}>{row.context.company.slice(0, 1)}</span><div><strong>{row.context.company}</strong><p>{row.context.provider}</p></div>{row.unread > 0 && <span className={styles.unread} aria-label={`${row.unread} mensagens não lidas`}>{row.unread}</span>}</div><p className={styles.preview}>{row.lastMessage?.content || "Conversa iniciada"}</p><div className={styles.queueMeta}><span>{row.priority === "HIGH" ? "★ Alta · " : "Normal · "}{SUPPORT_STATUS_LABEL[row.status]}</span><time dateTime={row.lastMessageAt}>{date(row.lastMessageAt)}</time></div>
        </button>)}
          {inbox.data?.rows.length === 0 && <div className={styles.empty}><strong>{query ? "Nenhuma conversa encontrada" : "Nenhuma conversa neste filtro"}</strong><p>{query ? "Tente outro nome, e-mail ou telefone." : "Novos pedidos aparecem aqui automaticamente."}</p></div>}
          {!inbox.data && !inbox.error && <p className={styles.empty}>Carregando conversas…</p>}
        </div>
        {(offset > 0 || inbox.data?.nextOffset != null) && <nav className={styles.pagination} aria-label="Páginas da fila"><button type="button" disabled={!offset} onClick={() => setOffset(Math.max(0, offset - 60))}>Anterior</button><span>{Math.floor(offset / 60) + 1}</span><button type="button" disabled={inbox.data?.nextOffset == null} onClick={() => setOffset(inbox.data!.nextOffset!)}>Próxima</button></nav>}
      </section>
      {selected ? <Conversation key={selected} id={selected} operatorId={operatorId} operatorName={operatorName} back={() => setSelected(null)} changed={changed} /> : <div className={styles.selectionEmpty}><div className={styles.emptyMark}>↗</div><h2>Uma conversa de cada vez</h2><p>Selecione um prestador para ver o histórico, assumir o atendimento e responder.</p></div>}
    </div>
  </>;
}
