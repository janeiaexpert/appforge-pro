import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { brl } from "@/lib/templates";
import {
  clearRecords,
  fmtDateBR,
  removeRecord,
  setStatus,
  statusLabels,
  useRecords,
  type BizRecord,
  type RecordStatus,
} from "@/lib/orders";

type Tipo = "todos" | "pedido" | "agendamento";
type StatusFilter = "todos" | RecordStatus;

type AdminSearch = { q: string; tipo: Tipo; status: StatusFilter; de: string; ate: string };

const tipos: Tipo[] = ["todos", "pedido", "agendamento"];
const statuses: StatusFilter[] = ["todos", "pendente", "confirmado", "concluido", "cancelado"];

const statusStyle: Record<RecordStatus, string> = {
  pendente: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmado: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  concluido: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelado: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    tipo: tipos.includes(search["tipo"] as Tipo) ? (search["tipo"] as Tipo) : "todos",
    status: statuses.includes(search["status"] as StatusFilter)
      ? (search["status"] as StatusFilter)
      : "todos",
    de: typeof search["de"] === "string" ? search["de"] : "",
    ate: typeof search["ate"] === "string" ? search["ate"] : "",
  }),
  head: () => {
    const title = "Painel de pedidos e agendamentos — comércio local";
    const description =
      "Acompanhe pedidos e agendamentos recebidos, filtre por status e data, confirme, conclua ou cancele com um clique.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const { q, tipo, status, de, ate } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin" });
  const setSearch = (patch: Partial<AdminSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });

  const { records, loaded } = useRecords();
  const [cancelling, setCancelling] = useState<BizRecord | null>(null);
  const [reason, setReason] = useState("");

  const term = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (tipo !== "todos" && r.kind !== tipo) return false;
        if (status !== "todos" && r.status !== status) return false;
        if (de && r.date < de) return false;
        if (ate && r.date > ate) return false;
        if (!term) return true;
        return [r.customer, r.storeName, r.templateNiche, ...r.lines.map((l) => l.name)]
          .join(" ")
          .toLowerCase()
          .includes(term);
      }),
    [records, tipo, status, de, ate, term],
  );

  const revenue = filtered
    .filter((r) => r.status !== "cancelado")
    .reduce((s, r) => s + r.total, 0);
  const counts = (s: RecordStatus) => records.filter((r) => r.status === s).length;
  const hasFilters = Boolean(term || de || ate) || tipo !== "todos" || status !== "todos";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 pt-8 pb-20">
        <Link
          to="/"
          search={{ q: "", ramo: "todos", tipo: "todos", estado: "todos" }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Templates
        </Link>

        <h1 className="font-display mt-5 text-3xl font-extrabold tracking-tight">
          Painel de <span className="text-accent">pedidos e agendamentos</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tudo que é enviado pelos templates entra aqui. Filtre por status e data, confirme, conclua
          ou cancele.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["pendente", "confirmado", "concluido", "cancelado"] as RecordStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setSearch({ status: status === s ? "todos" : s })}
              className={`rounded-xl border p-3 text-left transition ${
                status === s ? "border-accent" : "border-border hover:bg-muted/50"
              }`}
            >
              <span className="block text-xs text-muted-foreground">{statusLabels[s]}</span>
              <span className="font-display block text-2xl font-bold">{counts(s)}</span>
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Buscar por cliente, comércio ou item…"
              className="input-base pl-9"
              aria-label="Buscar pedidos e agendamentos"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Tipo
              <select
                value={tipo}
                onChange={(e) => setSearch({ tipo: e.target.value as Tipo })}
                className="input-base"
              >
                <option value="todos">Todos</option>
                <option value="pedido">Pedidos</option>
                <option value="agendamento">Agendamentos</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Status
              <select
                value={status}
                onChange={(e) => setSearch({ status: e.target.value as StatusFilter })}
                className="input-base"
              >
                <option value="todos">Todos</option>
                {(["pendente", "confirmado", "concluido", "cancelado"] as RecordStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              De
              <input
                type="date"
                value={de}
                onChange={(e) => setSearch({ de: e.target.value })}
                className="input-base"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Até
              <input
                type="date"
                value={ate}
                onChange={(e) => setSearch({ ate: e.target.value })}
                className="input-base"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} registro(s) · total ativo{" "}
              <strong className="text-foreground">{brl(revenue)}</strong>
            </span>
            <span className="flex gap-3">
              {hasFilters && (
                <button
                  onClick={() =>
                    setSearch({ q: "", tipo: "todos", status: "todos", de: "", ate: "" })
                  }
                  className="inline-flex items-center gap-1 font-semibold text-accent"
                >
                  <X className="size-3.5" /> Limpar filtros
                </button>
              )}
              {records.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Apagar todo o histórico do painel?")) {
                      clearRecords();
                      toast.success("Histórico apagado.");
                    }
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="size-3.5" /> Limpar histórico
                </button>
              )}
            </span>
          </div>
        </section>

        {loaded && records.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum pedido ou agendamento ainda. Abra um template, monte um pedido e envie — ele
            aparece aqui na hora.
          </p>
        )}

        {loaded && records.length > 0 && filtered.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum registro com esses filtros.
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {r.kind === "pedido" ? (
                      <ShoppingBag className="size-4 text-accent" />
                    ) : (
                      <CalendarClock className="size-4 text-accent" />
                    )}
                    {r.customer}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.storeName} · {r.templateNiche} · {fmtDateBR(r.date)}
                    {r.time ? ` às ${r.time}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyle[r.status]}`}
                >
                  {statusLabels[r.status]}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {r.lines.map((l, i) => (
                  <li key={`${l.name}-${i}`} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {l.qty}x {l.name}
                    </span>
                    <span>{brl(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
                <span>Total</span>
                <span>{brl(r.total)}</span>
              </div>

              {(r.mode || r.address || r.payment || r.notes) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.mode ? (r.mode === "entrega" ? "Entrega" : "Retirada no local") : null}
                  {r.address ? ` · ${r.address}` : ""}
                  {r.payment ? ` · ${r.payment}` : ""}
                  {r.notes ? ` · Obs: ${r.notes}` : ""}
                </p>
              )}

              {r.status === "cancelado" && r.cancelReason && (
                <p className="mt-2 text-xs text-rose-400">Motivo do cancelamento: {r.cancelReason}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "confirmado" && r.status !== "cancelado" && (
                  <ActionBtn
                    onClick={() => {
                      setStatus(r.id, "confirmado");
                      toast.success("Confirmado.");
                    }}
                  >
                    Confirmar
                  </ActionBtn>
                )}
                {r.status !== "concluido" && r.status !== "cancelado" && (
                  <ActionBtn
                    onClick={() => {
                      setStatus(r.id, "concluido");
                      toast.success("Marcado como concluído.");
                    }}
                  >
                    Concluir
                  </ActionBtn>
                )}
                {r.status !== "cancelado" ? (
                  <ActionBtn
                    danger
                    onClick={() => {
                      setCancelling(r);
                      setReason("");
                    }}
                  >
                    Cancelar
                  </ActionBtn>
                ) : (
                  <ActionBtn
                    onClick={() => {
                      setStatus(r.id, "pendente");
                      toast.success("Cancelamento revertido.");
                    }}
                  >
                    Reabrir
                  </ActionBtn>
                )}
                <ActionBtn
                  onClick={() => {
                    removeRecord(r.id);
                    toast.success("Registro removido.");
                  }}
                >
                  Excluir
                </ActionBtn>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {cancelling && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">
              Cancelar {cancelling.kind === "pedido" ? "pedido" : "agendamento"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {cancelling.customer} · {fmtDateBR(cancelling.date)}
              {cancelling.time ? ` às ${cancelling.time}` : ""}
            </p>
            <label className="mt-4 grid gap-1 text-xs font-semibold text-muted-foreground">
              Motivo (opcional)
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: cliente desistiu, item sem estoque…"
                className="input-base"
              />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCancelling(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setStatus(cancelling.id, "cancelado", reason.trim() || undefined);
                  setCancelling(null);
                  toast.success("Cancelado.");
                }}
                className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-sm font-bold text-white"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        danger
          ? "border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
