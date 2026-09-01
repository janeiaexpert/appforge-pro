import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ClipboardList, Copy, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { getOpenState, hoursSummary, templates } from "@/lib/templates";

type Kind = "todos" | "pedido" | "agendamento";
type Estado = "todos" | "aberto" | "fechado";

type GallerySearch = { q: string; ramo: string; tipo: Kind; estado: Estado };

const kinds: Kind[] = ["todos", "pedido", "agendamento"];
const estados: Estado[] = ["todos", "aberto", "fechado"];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    ramo: typeof search["ramo"] === "string" ? search["ramo"] : "todos",
    tipo: kinds.includes(search["tipo"] as Kind) ? (search["tipo"] as Kind) : "todos",
    estado: estados.includes(search["estado"] as Estado) ? (search["estado"] as Estado) : "todos",
  }),
  head: () => {
    const title = "Templates de sites para comércio local — prontos e funcionais";
    const description =
      "16 modelos de site para pizzaria, barbearia, petshop, pousada e mais. Cardápio, agendamento, status aberto/fechado e pedido caindo no WhatsApp.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { q, ramo, tipo, estado } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const setSearch = (patch: Partial<GallerySearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ramos = useMemo(
    () => Array.from(new Set(templates.map((t) => t.niche))).sort((a, b) => a.localeCompare(b)),
    [],
  );

  const term = q.trim().toLowerCase();
  const filtered = templates.filter((t) => {
    if (tipo !== "todos" && t.kind !== tipo) return false;
    if (ramo !== "todos" && t.niche !== ramo) return false;
    if (estado !== "todos") {
      if (!now) return true;
      const open = getOpenState(t.hours, now).open;
      if (estado === "aberto" && !open) return false;
      if (estado === "fechado" && open) return false;
    }
    if (!term) return true;
    const haystack = [t.name, t.niche, t.tagline, ...t.categories.flatMap((c) => [c.name, ...c.items.map((i) => i.name)])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });

  const hasFilters = Boolean(term) || ramo !== "todos" || tipo !== "todos" || estado !== "todos";


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 pt-12 pb-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-accent">
          <Sparkles className="size-3.5" /> {templates.length} modelos funcionais
        </span>

        <h1 className="font-display mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
          <span className="text-accent">{templates.length} modelos de site</span> prontos{" "}
          <span className="text-accent">+ os prompts</span> pra personalizar
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Cada modelo já funciona de verdade: cardápio ou lista de serviços, status aberto/fechado no
          horário real, carrinho, agendamento e o pedido caindo no WhatsApp do comércio.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/criar"
            className="rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground transition hover:brightness-110"
          >
            Criar o meu agora
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-base font-semibold text-foreground transition hover:bg-muted"
          >
            <ClipboardList className="size-4" /> Painel de pedidos
          </Link>
        </div>

        <section id="modelos" className="mt-12 rounded-2xl border border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Buscar por ramo, nome, serviço ou item do cardápio…"
              className="input-base pl-9"
              aria-label="Buscar modelos"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Ramo
              <select
                value={ramo}
                onChange={(e) => setSearch({ ramo: e.target.value })}
                className="input-base"
              >
                <option value="todos">Todos os ramos</option>
                {ramos.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Estilo
              <select
                value={tipo}
                onChange={(e) => setSearch({ tipo: e.target.value as Kind })}
                className="input-base"
              >
                <option value="todos">Pedido e agendamento</option>
                <option value="pedido">Pedido / cardápio</option>
                <option value="agendamento">Agendamento / serviços</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
              Situação agora
              <select
                value={estado}
                onChange={(e) => setSearch({ estado: e.target.value as Estado })}
                className="input-base"
              >
                <option value="todos">Qualquer situação</option>
                <option value="aberto">Aberto agora</option>
                <option value="fechado">Fechado agora</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} de {templates.length} modelos
            </span>
            {hasFilters && (
              <button
                onClick={() => setSearch({ q: "", ramo: "todos", tipo: "todos", estado: "todos" })}
                className="inline-flex items-center gap-1 font-semibold text-accent"
              >
                <X className="size-3.5" /> Limpar filtros
              </button>
            )}
          </div>
        </section>

        {filtered.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum modelo encontrado com esses filtros. Tente outro termo ou limpe os filtros.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => {
            const status = now ? getOpenState(t.hours, now) : null;

            return (
              <article
                key={t.slug}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Link to="/t/$slug" params={{ slug: t.slug }} className="block">
                  <div
                    className="px-4 pt-4 pb-3"
                    style={{
                      backgroundImage: `linear-gradient(160deg, ${t.headerFrom}, ${t.headerTo})`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid size-9 place-items-center rounded-lg text-base font-black"
                        style={{ backgroundColor: t.accent, color: "oklch(0.16 0.01 0)" }}
                      >
                        {t.name.charAt(0)}
                      </span>
                      <span>
                        <span className="font-display block leading-tight font-bold text-foreground">
                          {t.name}
                        </span>
                        <span className="block text-[11px] text-foreground/60">{t.tagline}</span>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-1 text-foreground/80">
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            backgroundColor: status?.open
                              ? "oklch(0.75 0.19 145)"
                              : "oklch(0.70 0.18 30)",
                          }}
                        />
                        {status ? (status.open ? "Aberto agora" : "Fechado") : "—"}
                      </span>
                      <span className="rounded-full bg-foreground/10 px-2 py-1 text-foreground/70">
                        {hoursSummary(t.hours).split(" · ")[0]}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-1.5 overflow-hidden">
                      {t.categories.slice(0, 3).map((c, i) => (
                        <span
                          key={c.id}
                          className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap"
                          style={
                            i === 0
                              ? { backgroundColor: t.accent, color: "oklch(0.16 0.01 0)" }
                              : { backgroundColor: "oklch(1 0 0 / 12%)", color: "oklch(0.95 0 0 / 80%)" }
                          }
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3.5">
                    <span className="size-2 rounded-full bg-accent" />
                    <h2 className="font-display flex-1 text-lg font-bold">{t.niche}</h2>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      {t.kind === "pedido" ? (
                        <>
                          <ShoppingBag className="size-3.5" /> Pedido
                        </>
                      ) : (
                        <>
                          <CalendarClock className="size-3.5" /> Agendamento
                        </>
                      )}
                    </span>
                  </div>
                </Link>
                <div className="flex gap-2 border-t border-border px-4 py-3">
                  <Link
                    to="/t/$slug"
                    params={{ slug: t.slug }}
                    className="flex-1 rounded-lg bg-accent px-3 py-2 text-center text-xs font-bold text-accent-foreground"
                  >
                    Abrir template
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(t.prompt)
                        .then(() => toast.success("Prompt copiado!"))
                        .catch(() => toast.error("Não foi possível copiar."));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    <Copy className="size-3.5" /> Copiar prompt
                  </button>
                </div>
              </article>
            );
          })}

          <Link
            to="/criar"
            className="grid place-items-center rounded-2xl border border-dashed border-accent/60 p-10 text-center transition hover:bg-muted/40"
          >
            <span>
              <span className="font-display block text-2xl font-extrabold text-accent">+ o seu</span>
              <span className="mt-1 block text-sm text-muted-foreground">qualquer ramo</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
