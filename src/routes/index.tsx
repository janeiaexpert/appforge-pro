import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Copy, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getOpenState, hoursSummary, templates } from "@/lib/templates";

export const Route = createFileRoute("/")({
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
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

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
          <a
            href="#modelos"
            className="rounded-xl border border-border px-6 py-3.5 text-base font-semibold text-foreground transition hover:bg-muted"
          >
            Ver os modelos
          </a>
        </div>

        <div id="modelos" className="mt-14 grid gap-4 sm:grid-cols-2">
          {templates.map((t) => {
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
