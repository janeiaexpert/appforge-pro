import { createFileRoute, notFound } from "@tanstack/react-router";

import { Storefront } from "@/components/Storefront";
import { getTemplate } from "@/lib/templates";

export const Route = createFileRoute("/t/$slug")({
  loader: ({ params }) => {
    const template = getTemplate(params.slug);
    if (!template) throw notFound();
    return { template };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Template não encontrado" }, { name: "robots", content: "noindex" }],
      };
    }
    const { template } = loaderData;
    const title = `${template.name} — template de ${template.niche.toLowerCase()}`;
    const description = `${template.tagline}. Template funcional com status aberto/fechado, ${
      template.kind === "pedido" ? "carrinho de pedidos" : "agendamento de horário"
    } e envio direto no WhatsApp.`;
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
  component: TemplatePage,
});

function TemplatePage() {
  const { template } = Route.useLoaderData();
  return <Storefront template={template} />;
}
