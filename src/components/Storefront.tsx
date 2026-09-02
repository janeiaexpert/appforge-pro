import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  brl,
  dayNames,
  fmtMinutes,
  getOpenState,
  hoursSummary,
  type BizTemplate,
  type Item,
  type Weekday,
} from "@/lib/templates";
import { mapsLink, onlyDigits, useStoreConfig, waLink, type StoreConfig } from "@/lib/store-config";
import { addRecord } from "@/lib/orders";


type Line = { item: Item; qty: number };

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function timeSlots(t: BizTemplate, isoDate: string, durationMin: number) {
  if (!isoDate) return [];
  const [y, mo, d] = isoDate.split("-").map(Number);
  const date = new Date(y ?? 2026, (mo ?? 1) - 1, d ?? 1);
  const slot = t.hours[date.getDay() as Weekday];
  if (!slot) return [];
  const out: string[] = [];
  const last = slot.close - Math.max(durationMin, 30);
  for (let v = slot.open; v <= last; v += 30) {
    out.push(`${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`);
  }
  return out;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function Storefront({ template: t }: { template: BizTemplate }) {
  const now = useNow();
  const { config, save, reset } = useStoreConfig(t);
  const [activeCat, setActiveCat] = useState(t.categories[0]!.id);
  const [lines, setLines] = useState<Record<string, Line>>({});
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState(false);

  // pedido
  const [customer, setCustomer] = useState("");
  const [mode, setMode] = useState<"entrega" | "retirada">("entrega");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [payment, setPayment] = useState("Pix");
  const [notes, setNotes] = useState("");

  // agendamento
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");

  useEffect(() => {
    setLines({});
    setActiveCat(t.categories[0]!.id);
    setSheet(false);
    setTime("");
  }, [t]);

  const cart = Object.values(lines);
  const total = cart.reduce((s, l) => s + l.item.price * l.qty, 0);
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const totalDuration = cart.reduce((s, l) => s + (l.item.duration ?? 0) * l.qty, 0);
  const status = now ? getOpenState(t.hours, now) : null;
  const slots = useMemo(() => timeSlots(t, date, totalDuration), [t, date, totalDuration]);

  const add = (item: Item) =>
    setLines((p) => ({ ...p, [item.id]: { item, qty: (p[item.id]?.qty ?? 0) + 1 } }));
  const sub = (item: Item) =>
    setLines((p) => {
      const qty = (p[item.id]?.qty ?? 0) - 1;
      const next = { ...p };
      if (qty <= 0) delete next[item.id];
      else next[item.id] = { item, qty };
      return next;
    });

  const scheduleValid = t.kind === "pedido" || (Boolean(date) && Boolean(time));
  const canSend =
    count > 0 &&
    customer.trim().length >= 2 &&
    scheduleValid &&
    (t.kind === "agendamento" || mode === "retirada" || deliveryAddress.trim().length >= 5);

  const message = () => {
    const l: string[] = [];
    l.push(t.kind === "pedido" ? `*Novo pedido — ${config.name}*` : `*Novo agendamento — ${config.name}*`);
    l.push("");
    l.push(`Cliente: ${customer.trim()}`);
    if (t.kind === "agendamento" && date) {
      const [y, mo, d] = date.split("-");
      l.push(`Data: ${d}/${mo}/${y} às ${time}`);
      if (totalDuration) l.push(`Duração estimada: ${totalDuration} min`);
    }
    if (t.kind === "pedido") {
      l.push(`Tipo: ${mode === "entrega" ? "Entrega" : "Retirada no local"}`);
      if (mode === "entrega") l.push(`Endereço: ${deliveryAddress.trim()}`);
      l.push(`Pagamento: ${payment}`);
    }
    l.push("");
    l.push(t.kind === "pedido" ? "*Itens*" : "*Serviços*");
    cart.forEach((line) => {
      l.push(`• ${line.qty}x ${line.item.name} — ${brl(line.item.price * line.qty)}`);
    });
    l.push("");
    l.push(`*Total: ${brl(total)}*`);
    if (notes.trim()) {
      l.push("");
      l.push(`Observações: ${notes.trim()}`);
    }
    if (status && !status.open) {
      l.push("");
      l.push("(enviado fora do horário de atendimento)");
    }
    return l.join("\n");
  };

  const send = () => {
    if (!canSend) {
      toast.error("Complete os campos obrigatórios antes de enviar.");
      return;
    }
    addRecord({
      kind: t.kind,
      templateSlug: t.slug,
      templateNiche: t.niche,
      storeName: config.name,
      customer: customer.trim(),
      date: t.kind === "agendamento" ? date : todayISO(),
      ...(t.kind === "agendamento" ? { time } : { mode, payment }),
      ...(t.kind === "pedido" && mode === "entrega" ? { address: deliveryAddress.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      lines: cart.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
      total,
    });
    window.open(waLink(config.whatsapp, message()), "_blank", "noopener,noreferrer");
    toast.success("Registrado no painel e WhatsApp aberto com o resumo.");
  };


  const cat = t.categories.find((c) => c.id === activeCat) ?? t.categories[0]!;

  return (
    <div
      className="min-h-screen bg-background pb-40"
      style={
        {
          "--brand": t.accent,
          "--brand-soft": t.accentSoft,
          "--head-from": t.headerFrom,
          "--head-to": t.headerTo,
        } as React.CSSProperties
      }
    >
      <header
        className="px-5 pb-6 pt-5"
        style={{ backgroundImage: "linear-gradient(160deg, var(--head-from), var(--head-to))" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              search={{ q: "", ramo: "todos", tipo: "todos", estado: "todos" }}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-foreground/20"
            >
              <ArrowLeft className="size-3.5" /> Templates
            </Link>
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-foreground/20"
            >
              <Pencil className="size-3.5" /> Personalizar
            </button>
          </div>

          <div className="mt-5 flex items-start gap-3">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-xl text-xl font-black"
              style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
            >
              {config.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl leading-tight font-bold text-foreground">
                {config.name}
              </h1>
              <p className="text-sm text-foreground/60">{config.tagline}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 font-medium text-foreground/85">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: status?.open
                    ? "oklch(0.75 0.19 145)"
                    : status
                      ? "oklch(0.70 0.18 30)"
                      : "oklch(0.6 0 0)",
                }}
              />
              {status ? (status.open ? "Aberto agora" : "Fechado") : "Verificando…"}
            </span>
            <a
              href={mapsLink(config.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 font-medium text-foreground/85 transition hover:bg-foreground/20"
            >
              <MapPin className="size-3.5" /> Como chegar
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 font-medium text-foreground/70">
              <Clock className="size-3.5" /> {hoursSummary(t.hours)}
            </span>
          </div>
        </div>
      </header>

      {editing && (
        <ConfigPanel
          config={config}
          onSave={(c) => {
            save(c);
            setEditing(false);
            toast.success("Dados do comércio atualizados.");
          }}
          onReset={() => {
            reset();
            toast.success("Voltamos aos dados originais do template.");
          }}
          onClose={() => setEditing(false)}
        />
      )}

      {status && !status.open && (
        <div
          className="px-5 py-3 text-center text-xs font-medium"
          style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
        >
          {t.closedNotice} Abrimos {status.nextOpenLabel}.
        </div>
      )}

      <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-5 py-3">
          {t.categories.map((c) => {
            const active = c.id === cat.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
                style={
                  active
                    ? { backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)", borderColor: "var(--brand)" }
                    : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5 py-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--brand)" }}>
            {cat.name}
          </h2>
          {cat.note && <span className="text-xs text-muted-foreground italic">{cat.note}</span>}
        </div>

        <ul className="mt-4 space-y-2">
          {cat.items.map((item) => {
            const qty = lines[item.id]?.qty ?? 0;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-card-foreground">{item.name}</p>
                  {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
                  <p className="mt-1 text-sm font-bold" style={{ color: "var(--brand)" }}>
                    {item.price === 0 ? "Grátis" : brl(item.price)}
                    {item.duration ? (
                      <span className="ml-2 font-normal text-muted-foreground">
                        · {item.duration} min
                      </span>
                    ) : null}
                  </p>
                </div>
                {qty === 0 ? (
                  <button
                    onClick={() => add(item)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold"
                    style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
                  >
                    <Plus className="size-3.5" /> {t.kind === "pedido" ? "Adicionar" : "Escolher"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border p-1">
                    <button
                      onClick={() => sub(item)}
                      aria-label={`Remover um ${item.name}`}
                      className="grid size-7 place-items-center rounded-md bg-muted text-foreground"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => add(item)}
                      aria-label={`Adicionar um ${item.name}`}
                      className="grid size-7 place-items-center rounded-md"
                      style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <section className="mt-10 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">
            {t.kind === "pedido" ? "Seus dados de entrega" : "Seu agendamento"}
          </h3>

          <div className="mt-4 grid gap-4">
            <Field label="Seu nome *">
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Como podemos te chamar?"
                className="input-base"
              />
            </Field>

            {t.kind === "pedido" ? (
              <>
                <Field label="Como quer receber?">
                  <div className="flex gap-2">
                    {(["entrega", "retirada"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setMode(opt)}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition"
                        style={
                          mode === opt
                            ? { backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)", borderColor: "var(--brand)" }
                            : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
                        }
                      >
                        {opt === "entrega" ? "Entrega" : "Retirar no local"}
                      </button>
                    ))}
                  </div>
                </Field>

                {mode === "entrega" && (
                  <Field label="Endereço de entrega *">
                    <input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Rua, número, bairro e complemento"
                      className="input-base"
                    />
                  </Field>
                )}

                <Field label="Forma de pagamento">
                  <div className="relative">
                    <select
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      className="input-base appearance-none pr-9"
                    >
                      {["Pix", "Dinheiro", "Cartão na entrega", "Cartão online"].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Data *">
                  <input
                    type="date"
                    value={date}
                    min={todayISO()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime("");
                    }}
                    className="input-base"
                  />
                </Field>
                <Field label="Horário *">
                  {slots.length === 0 ? (
                    <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                      Sem atendimento nesse dia — escolha outra data.
                    </p>
                  ) : (
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      {slots.map((s) => (
                        <button
                          key={s}
                          onClick={() => setTime(s)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                          style={
                            time === s
                              ? { backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)", borderColor: "var(--brand)" }
                              : { borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            )}

            <Field label="Observações">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  t.kind === "pedido"
                    ? "Ex: sem cebola, troco para R$ 100…"
                    : "Ex: preferência de profissional, alguma alergia…"
                }
                className="input-base resize-y"
              />
            </Field>
          </div>
        </section>

        {cart.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Resumo</h3>
              <button
                onClick={() => setLines({})}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="size-3.5" /> Limpar
              </button>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {cart.map((l) => (
                <li key={l.item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-card-foreground">
                    {l.qty}x {l.item.name}
                  </span>
                  <span className="font-semibold">{brl(l.item.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold">
              <span>Total</span>
              <span style={{ color: "var(--brand)" }}>{brl(total)}</span>
            </div>
            {t.kind === "agendamento" && totalDuration > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Duração estimada: {totalDuration} minutos
              </p>
            )}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">Horários de atendimento</h3>
          <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const slot = t.hours[d as Weekday];
              return (
                <li key={d} className="flex justify-between gap-4 text-muted-foreground">
                  <span>{dayNames[d]}</span>
                  <span className="text-card-foreground">
                    {slot ? `${fmtMinutes(slot.open)} – ${fmtMinutes(slot.close)}` : "Fechado"}
                  </span>
                </li>
              );
            })}
          </ul>
          <a
            href={mapsLink(config.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--brand)" }}
          >
            <MapPin className="size-4" /> {config.address}
          </a>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-5">
        <div className="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSheet((v) => !v)}
            aria-label={sheet ? "Fechar resumo" : "Ver resumo"}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-2.5 py-2.5 text-sm font-semibold"
          >
            <ShoppingBag className="size-4" />
            {count}
          </button>
          <div className="min-w-0 shrink-0">
            <p className="text-[11px] leading-tight text-muted-foreground">Total</p>
            <p className="font-bold whitespace-nowrap">{brl(total)}</p>
          </div>
          <button
            onClick={send}
            disabled={!canSend}
            className="min-w-0 flex-1 truncate rounded-xl px-3 py-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
          >
            {t.ctaLabel}
          </button>
        </div>
        {sheet && (
          <div className="mx-auto mt-3 max-w-3xl rounded-xl border border-border bg-card p-4 text-sm">
            {cart.length === 0 ? (
              <p className="text-muted-foreground">
                Nada escolhido ainda. Toque em {t.kind === "pedido" ? "“Adicionar”" : "“Escolher”"} nos
                itens acima.
              </p>
            ) : (
              <ul className="space-y-2">
                {cart.map((l) => (
                  <li key={l.item.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {l.qty}x {l.item.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => sub(l.item)}
                        aria-label={`Remover ${l.item.name}`}
                        className="grid size-6 place-items-center rounded bg-muted"
                      >
                        <Minus className="size-3" />
                      </button>
                      <button
                        onClick={() => add(l.item)}
                        aria-label={`Adicionar ${l.item.name}`}
                        className="grid size-6 place-items-center rounded"
                        style={{ backgroundColor: "var(--brand)", color: "oklch(0.16 0.01 0)" }}
                      >
                        <Plus className="size-3" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function ConfigPanel({
  config,
  onSave,
  onReset,
  onClose,
}: {
  config: StoreConfig;
  onSave: (c: StoreConfig) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(config);
  useEffect(() => setDraft(config), [config]);

  return (
    <div className="border-b border-border bg-muted/40 px-5 py-5">
      <div className="mx-auto max-w-3xl">
        <h3 className="font-display text-lg font-bold">Personalizar este template</h3>
        <p className="text-xs text-muted-foreground">
          Salvo neste navegador e usado nos links de WhatsApp e mapa.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nome do comércio">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Descrição curta">
            <input
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="WhatsApp (com DDI e DDD)">
            <input
              value={draft.whatsapp}
              inputMode="numeric"
              onChange={(e) => setDraft({ ...draft, whatsapp: onlyDigits(e.target.value) })}
              placeholder="5581999998888"
              className="input-base"
            />
          </Field>
          <Field label="Endereço">
            <input
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              className="input-base"
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onSave({ ...draft, whatsapp: onlyDigits(draft.whatsapp) })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <Check className="size-4" /> Salvar
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold"
          >
            <RotateCcw className="size-4" /> Restaurar
          </button>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
