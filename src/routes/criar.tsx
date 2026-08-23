import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { templates } from "@/lib/templates";
import { onlyDigits } from "@/lib/store-config";

export const Route = createFileRoute("/criar")({
  head: () => {
    const title = "Criar meu site de comércio local em 1 minuto";
    const description =
      "Escolha o ramo, coloque o nome, o WhatsApp e o endereço do seu comércio e receba o site funcionando na hora, com pedido ou agendamento no WhatsApp.";
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
  component: CriarPage,
});

function CriarPage() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState(templates[0]!.slug);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const base = templates.find((t) => t.slug === slug)!;
  const valid = name.trim().length >= 2 && onlyDigits(whatsapp).length >= 12 && address.trim().length >= 5;

  const prompt = `${base.prompt}\n\nDados do comércio:\n- Nome: ${name || base.name}\n- Descrição: ${
    tagline || base.tagline
  }\n- WhatsApp: ${onlyDigits(whatsapp) || base.whatsapp}\n- Endereço: ${address || base.address}`;

  const create = () => {
    if (!valid) {
      toast.error("Preencha nome, WhatsApp (com DDI e DDD) e endereço.");
      return;
    }
    try {
      localStorage.setItem(
        `tpl-config:${slug}`,
        JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim() || base.tagline,
          whatsapp: onlyDigits(whatsapp),
          address: address.trim(),
        }),
      );
    } catch {
      /* storage indisponível */
    }
    toast.success("Seu site está pronto!");
    navigate({ to: "/t/$slug", params: { slug } });
  };

  return (
    <div className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Criar o site do <span className="text-accent">meu comércio</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Escolha o ramo, preencha seus dados e o site sai funcionando — com pedido ou agendamento
          caindo no seu WhatsApp.
        </p>

        <div className="mt-8 grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Ramo do comércio
            </span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input-base"
            >
              {templates.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.niche} ({t.kind === "pedido" ? "pedido" : "agendamento"})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Nome do comércio *
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Descrição curta
            </span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={base.tagline}
              className="input-base"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              WhatsApp com DDI e DDD *
            </span>
            <input
              value={whatsapp}
              inputMode="numeric"
              placeholder="5581999998888"
              onChange={(e) => setWhatsapp(onlyDigits(e.target.value))}
              className="input-base"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Endereço *
            </span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-base"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={create}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-110"
          >
            <Wand2 className="size-4" /> Gerar meu site
          </button>
          <button
            onClick={() =>
              navigator.clipboard
                .writeText(prompt)
                .then(() => toast.success("Prompt copiado!"))
                .catch(() => toast.error("Não foi possível copiar."))
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold"
          >
            <Copy className="size-4" /> Copiar prompt do meu ramo
          </button>
        </div>

        <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-card p-4 text-xs whitespace-pre-wrap text-muted-foreground">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
