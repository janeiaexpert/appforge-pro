import { useCallback, useEffect, useState } from "react";
import type { BizTemplate } from "./templates";

export type StoreConfig = {
  name: string;
  tagline: string;
  whatsapp: string;
  address: string;
};

const key = (slug: string) => `tpl-config:${slug}`;

export function defaultsFor(t: BizTemplate): StoreConfig {
  return { name: t.name, tagline: t.tagline, whatsapp: t.whatsapp, address: t.address };
}

/** Configuração editável do comércio, persistida no navegador. */
export function useStoreConfig(t: BizTemplate) {
  const [config, setConfig] = useState<StoreConfig>(() => defaultsFor(t));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    try {
      const raw = localStorage.getItem(key(t.slug));
      setConfig(raw ? { ...defaultsFor(t), ...JSON.parse(raw) } : defaultsFor(t));
    } catch {
      setConfig(defaultsFor(t));
    }
    setLoaded(true);
  }, [t]);

  const save = useCallback(
    (next: StoreConfig) => {
      setConfig(next);
      try {
        localStorage.setItem(key(t.slug), JSON.stringify(next));
      } catch {
        /* storage indisponível */
      }
    },
    [t.slug],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key(t.slug));
    } catch {
      /* storage indisponível */
    }
    setConfig(defaultsFor(t));
  }, [t]);

  return { config, save, reset, loaded };
}

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(text)}`;

export const mapsLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
