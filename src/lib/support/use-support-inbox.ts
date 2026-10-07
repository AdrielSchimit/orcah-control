"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { pollingTransport, supportFetch } from "./transport";
import { mergeSnapshot, reconcileMessages, type PendingMessage } from "./reconcile";
import type { InboxSnapshot, OperatorSnapshot, SupportPriority } from "./types";

export function useSupportInbox(status: string, query: string, offset: number) {
  const [data, setData] = useState<InboxSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const next = await supportFetch<InboxSnapshot>(`/api/support/inbox?${new URLSearchParams({ status, q: query, offset: String(offset) })}`);
      if (signal?.aborted) return;
      setData(next); setError("");
    } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Falha ao carregar fila."); throw e; }
  }, [status, query, offset]);
  useEffect(() => pollingTransport().subscribe(refresh, setConnected), [refresh]);
  return { data, connected, error, refresh };
}

export function useOperatorThread(id: string, operatorId: string, operatorName: string, changed: () => void) {
  const [snapshot, setSnapshot] = useState<OperatorSnapshot | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lastRead = useRef("");
  const base = `/api/support/threads/${encodeURIComponent(id)}`;
  const accept = useCallback((next: OperatorSnapshot) => {
    setSnapshot(old => ({ ...mergeSnapshot(old, next), context: next.context }));
    setPending(old => old.filter(p => !next.messages.some(m => m.senderType === "OPERATOR" && m.clientId === p.clientId)));
  }, []);
  const refresh = useCallback(async (signal: AbortSignal) => {
    try {
      const next = await supportFetch<OperatorSnapshot>(base);
      if (signal.aborted) return;
      accept(next); setError("");
    } catch (e) { if (!signal.aborted) setError(e instanceof Error ? e.message : "Falha ao atualizar conversa."); throw e; }
  }, [base, accept]);
  useEffect(() => pollingTransport().subscribe(refresh, setConnected), [refresh]);
  const throughId = snapshot?.messages.at(-1)?.id;
  useEffect(() => {
    if (!snapshot?.thread.unread || !throughId || lastRead.current === throughId) return;
    let disposed = false;
    const acknowledge = () => {
      if (document.visibilityState === "hidden") return;
      void supportFetch(`${base}/read`, { throughId }).then(() => { if (!disposed) { lastRead.current = throughId; changed(); } }).catch(() => {});
    };
    acknowledge(); document.addEventListener("visibilitychange", acknowledge);
    return () => { disposed = true; document.removeEventListener("visibilitychange", acknowledge); };
  }, [base, throughId, snapshot?.thread.unread, changed]);
  async function send(content: string, retry?: PendingMessage) {
    if (busy || snapshot?.thread.assignedOperatorId !== operatorId) return;
    const clientId = retry?.clientId || crypto.randomUUID();
    const optimistic: PendingMessage = { id: `pending_${clientId}`, clientId, senderType: "OPERATOR", senderName: operatorName, content, readAt: null, createdAt: retry?.createdAt || new Date().toISOString(), delivery: "sending" };
    setBusy(true); setError(""); setPending(old => [...old.filter(p => p.clientId !== clientId), optimistic]);
    try { accept(await supportFetch<OperatorSnapshot>(`${base}/messages`, { content, clientId })); setPending(old => old.filter(p => p.clientId !== clientId)); changed(); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha ao enviar."); setPending(old => old.map(p => p.clientId === clientId ? { ...p, delivery: "failed" } : p)); }
    finally { setBusy(false); }
  }
  async function action(action: "claim" | "resolve" | "reopen" | "return-to-bot" | "priority", priority?: SupportPriority) {
    if (busy) return;
    setBusy(true); setError("");
    try { accept(await supportFetch<OperatorSnapshot>(`${base}/${action}`, { priority }, action === "priority" ? "PATCH" : "POST")); changed(); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); }
    finally { setBusy(false); }
  }
  async function older() {
    if (!snapshot?.olderCursor || busy) return;
    setBusy(true);
    try {
      const next = await supportFetch<OperatorSnapshot>(`${base}?before=${encodeURIComponent(snapshot.olderCursor)}`);
      setSnapshot(old => ({ ...mergeSnapshot(old, next), context: next.context, olderCursor: next.olderCursor }));
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar histórico."); }
    finally { setBusy(false); }
  }
  return { snapshot, messages: reconcileMessages(snapshot?.messages || [], pending), connected, error, busy, send, action, older };
}
