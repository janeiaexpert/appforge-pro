import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Copy,
  Download,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { brl, templates, type BizTemplate } from "@/lib/templates";
import { addRecord, type RecordLine } from "@/lib/orders";
import { waLink } from "@/lib/store-config";

/** WhatsApp que recebe os pedidos da loja de templates. */
const LOJA_WHATSAPP = "5581991234567";
const LOJA_NOME = "Loja de Templates Locais";
const PACOTE_PRECO = 297;

/** Preço por modelo: templates de pedido têm carrinho completo e custam mais. */
const priceOf = (t: BizTemplate) => (t.kind === "pedido" ? 49 : 39);

type CartItem = { slug: string; qty: number };

export const Route = createFileRoute("/loja")({
  head: () => {
    const title = "Loja de templates para comércio local — compre e receba o prompt";
    const description =
      "Escolha o modelo, adicione ao carrinho e finalize o pedido: você recebe o template funcional e o prompt completo para personalizar.";
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
  component: LojaPage,
});

function LojaPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pacote, setPacote] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [zap, setZap] = useState("");
  const [obs, setObs] = useState("");
  const [pago, setPago] = useState<{ slugs: string[]; id: string } | null>(null);

  const lines: RecordLine[] = useMemo(() => {
    if (pacote) {
      return [{ name: `Pacote completo — ${templates.length} modelos`, qty: 1, price: PACOTE_PRECO }];
    }
    return cart.map((c) => {
      const t = templates.find((x) => x.slug === c.slug)!;
      return { name: `Template ${t.name} (${t.niche})`, qty: c.qty, price: priceOf(t) };
    });
  }, [cart, pacote]);

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const qtyOf = (slug: string) => cart.find((c) => c.slug === slug)?.qty ?? 0;

  const add = (slug: string) =>
    setCart((prev) =>
      prev.some((c) => c.slug === slug)
        ? prev.map((c) => (c.slug === slug ? { ...c, qty: c.qty + 1 } : c))
        : [...prev, { slug, qty: 1 }],
    );

  const dec = (slug: string) =>
    setCart((prev) =>
      prev.flatMap((c) =>
        c.slug === slug ? (c.qty > 1 ? [{ ...c, qty: c.qty - 1 }] : []) : [c],
      ),
    );

  const remove = (slug: string) => setCart((prev) => prev.filter((c) => c.slug !== slug));

  const canCheckout = total > 0 && nome.trim().length > 1 && zap.replace(/\D/g, "").length >= 10;

  const promptsFor = (slugs: string[]) =>
    slugs
      .map((s) => {
        const t = templates.find((x) => x.slug === s)!;
        return `### ${t.name} — ${t.niche}\n${t.prompt}`;
      })
      .join("\n\n");

  const finalizar = () => {
    if (!canCheckout) {
      toast.error("Preencha nome e WhatsApp e escolha ao menos um modelo.");
      return;
    }
    const slugs = pacote ? templates.map((t) => t.slug) : cart.map((c) => c.slug);
    const rec = addRecord({
      kind: "pedido",
      templateSlug: "loja-templates",
      templateNiche: "Loja de templates",
      storeName: LOJA_NOME,
      customer: nome.trim(),
      date: new Date().toISOString().slice(0, 10),
      payment: "A combinar no WhatsApp",
      notes: [email.trim() && `E-mail: ${email.trim()}`, obs.trim()].filter(Boolean).join(" · "),
      lines,
      total,
    });

    const msg = [
      `*Pedido de templates — ${LOJA_NOME}*`,
      `Cliente: ${nome.trim()}`,
      email.trim() && `E-mail: ${email.trim()}`,
      `WhatsApp: ${zap}`,
      "",
      ...lines.map((l) => `• ${l.qty}x ${l.name} — ${brl(l.qty * l.price)}`),
      "",
      `*Total: ${brl(total)}*`,
      obs.trim() && `Obs.: ${obs.trim()}`,
      `Pedido nº ${rec.id}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(waLink(LOJA_WHATSAPP, msg), "_blank", "noopener,noreferrer");
    setPago({ slugs, id: rec.id });
    toast.success("Pedido registrado! Os prompts já estão liberados abaixo.");
  };

  const baixarPrompts = () => {
    if (!pago) return;
    const blob = new Blob([promptsFor(pago.slugs)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts-${pago.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 pt-8 pb-24">
        <Link
          to="/"
          search={{ q: "", ramo: "todos", tipo: "todos", estado: "todos" }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Voltar para a galeria
        </Link>

        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-accent">
          <Sparkles className="size-3.5" /> {templates.length} modelos disponíveis
        </span>
        <h1 className="font-display mt-4 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
          Compre o template e <span className="text-accent">receba o prompt</span> na hora
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Escolha os modelos, feche o pedido no WhatsApp e o prompt completo de cada template é
          liberado aqui mesmo para copiar ou baixar.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <button
              onClick={() => setPacote((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                pacote ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-md border ${
                  pacote ? "border-accent bg-accent text-accent-foreground" : "border-border"
                }`}
              >
                {pacote && <Check className="size-4" />}
              </span>
              <span className="flex-1">
                <span className="font-display block font-bold">
                  Pacote completo — todos os {templates.length} modelos
                </span>
                <span className="block text-xs text-muted-foreground">
                  Todos os templates + todos os prompts, com desconto
                </span>
              </span>
              <span className="font-display text-lg font-extrabold text-accent">
                {brl(PACOTE_PRECO)}
              </span>
            </button>

            <div
              className={`mt-5 grid gap-3 sm:grid-cols-2 ${pacote ? "pointer-events-none opacity-40" : ""}`}
            >
              {templates.map((t) => {
                const qty = qtyOf(t.slug);
                return (
                  <article key={t.slug} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-base font-black"
                        style={{ backgroundColor: t.accent, color: "oklch(0.16 0.01 0)" }}
                      >
                        {t.name.charAt(0)}
                      </span>
                      <span className="flex-1">
                        <span className="font-display block leading-tight font-bold">{t.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{t.niche}</span>
                      </span>
                      <span className="font-display font-extrabold text-accent">
                        {brl(priceOf(t))}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        {t.kind === "pedido" ? (
                          <>
                            <ShoppingBag className="size-3.5" /> Pedido + carrinho
                          </>
                        ) : (
                          <>
                            <CalendarClock className="size-3.5" /> Agendamento
                          </>
                        )}
                      </span>
                      {qty === 0 ? (
                        <button
                          onClick={() => add(t.slug)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground transition hover:brightness-110"
                        >
                          Adicionar
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1">
                          <button
                            onClick={() => dec(t.slug)}
                            aria-label={`Diminuir ${t.name}`}
                            className="text-muted-foreground transition hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-bold">{qty}</span>
                          <button
                            onClick={() => add(t.slug)}
                            aria-label={`Aumentar ${t.name}`}
                            className="text-muted-foreground transition hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </span>
                      )}
                    </div>

                    <Link
                      to="/t/$slug"
                      params={{ slug: t.slug }}
                      className="mt-3 block text-[11px] font-semibold text-accent hover:underline"
                    >
                      Abrir modelo funcional →
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <aside
            id="carrinho"
            className="h-fit scroll-mt-20 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-20"
          >
            <h2 className="font-display inline-flex items-center gap-2 text-lg font-bold">
              <ShoppingCart className="size-4 text-accent" /> Carrinho
            </h2>

            {lines.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Nenhum modelo escolhido ainda. Adicione templates ou leve o pacote completo.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {lines.map((l, i) => (
                  <li key={l.name} className="flex items-start gap-2 text-xs">
                    <span className="flex-1">
                      <span className="block font-semibold text-foreground">{l.name}</span>
                      <span className="text-muted-foreground">
                        {l.qty} × {brl(l.price)}
                      </span>
                    </span>
                    <span className="font-bold">{brl(l.qty * l.price)}</span>
                    {!pacote && (
                      <button
                        onClick={() => remove(cart[i]!.slug)}
                        aria-label={`Remover ${l.name}`}
                        className="text-muted-foreground transition hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-display text-xl font-extrabold text-accent">{brl(total)}</span>
            </div>

            <div className="mt-4 space-y-2">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Seu e-mail (opcional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                value={zap}
                onChange={(e) => setZap(e.target.value)}
                inputMode="tel"
                placeholder="Seu WhatsApp com DDD"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <textarea
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                rows={2}
                placeholder="Observações (nome do comércio, cores…)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <button
              onClick={finalizar}
              disabled={!canCheckout}
              className="mt-3 w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Finalizar pedido no WhatsApp
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              O pedido entra no painel em <span className="font-semibold">/admin</span> e o prompt é
              liberado assim que você confirma.
            </p>
          </aside>
        </div>

        {pago && (
          <section className="mt-10 rounded-2xl border border-accent/50 bg-accent/5 p-5">
            <h2 className="font-display text-xl font-extrabold">
              Prompts liberados — pedido nº {pago.id}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Copie o prompt de cada modelo comprado ou baixe todos em um arquivo.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(promptsFor(pago.slugs))
                    .then(() => toast.success("Todos os prompts copiados!"))
                    .catch(() => toast.error("Não foi possível copiar."));
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-foreground"
              >
                <Copy className="size-3.5" /> Copiar todos
              </button>
              <button
                onClick={baixarPrompts}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
              >
                <Download className="size-3.5" /> Baixar .txt
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {pago.slugs.map((s) => {
                const t = templates.find((x) => x.slug === s)!;
                return (
                  <li
                    key={s}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                  >
                    <span className="flex-1 text-sm font-semibold">{t.name}</span>
                    <Link
                      to="/t/$slug"
                      params={{ slug: t.slug }}
                      className="text-[11px] font-semibold text-accent hover:underline"
                    >
                      Abrir
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(t.prompt)
                          .then(() => toast.success(`Prompt de ${t.name} copiado!`))
                          .catch(() => toast.error("Não foi possível copiar."));
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
                    >
                      <Copy className="size-3" /> Prompt
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
