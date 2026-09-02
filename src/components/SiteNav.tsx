import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, LayoutGrid, Menu, Store, Wand2, X } from "lucide-react";

const galleryLinkProps = {
  to: "/" as const,
  search: { q: "", ramo: "todos", tipo: "todos", estado: "todos" } as const,
};

const adminLinkProps = {
  to: "/admin" as const,
  search: { q: "", tipo: "todos", status: "todos", de: "", ate: "" } as const,
};

/** Navegação principal do painel/galeria (não aparece dentro dos sites dos comércios). */
export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/t/")) return null;

  const itemClass =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground";
  const activeClass = { className: `${itemClass} bg-muted text-foreground` };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
        <Link
          {...galleryLinkProps}
          className="font-display mr-auto text-base font-extrabold tracking-tight"
        >
          Templates<span className="text-accent">Locais</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link {...galleryLinkProps} className={itemClass} activeOptions={{ exact: true }} activeProps={activeClass}>
            <LayoutGrid className="size-4" /> Modelos
          </Link>
          <Link to="/loja" className={itemClass} activeProps={activeClass}>
            <Store className="size-4" /> Loja
          </Link>
          <Link {...adminLinkProps} className={itemClass} activeProps={activeClass}>
            <ClipboardList className="size-4" /> Painel
          </Link>
          <Link
            to="/criar"
            className="ml-1 inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-bold text-accent-foreground transition hover:brightness-110"
          >
            <Wand2 className="size-4" /> Criar o meu
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border px-4 py-3 sm:hidden">
          <Link {...galleryLinkProps} className={itemClass} activeOptions={{ exact: true }} activeProps={activeClass}>
            <LayoutGrid className="size-4" /> Modelos
          </Link>
          <Link to="/loja" className={itemClass} activeProps={activeClass}>
            <Store className="size-4" /> Loja
          </Link>
          <Link {...adminLinkProps} className={itemClass} activeProps={activeClass}>
            <ClipboardList className="size-4" /> Painel de pedidos
          </Link>
          <Link
            to="/criar"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-2.5 text-sm font-bold text-accent-foreground"
          >
            <Wand2 className="size-4" /> Criar o meu
          </Link>
        </nav>
      )}
    </header>
  );
}
