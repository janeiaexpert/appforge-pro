import { useCallback, useEffect, useState } from "react";

export type RecordStatus = "pendente" | "confirmado" | "concluido" | "cancelado";

export type RecordLine = { name: string; qty: number; price: number };

export type BizRecord = {
  id: string;
  kind: "pedido" | "agendamento";
  templateSlug: string;
  templateNiche: string;
  storeName: string;
  customer: string;
  /** ISO date (YYYY-MM-DD) do pedido/agendamento */
  date: string;
  /** HH:MM (agendamento) */
  time?: string;
  mode?: "entrega" | "retirada";
  address?: string;
  payment?: string;
  notes?: string;
  lines: RecordLine[];
  total: number;
  status: RecordStatus;
  cancelReason?: string;
  createdAt: string;
};

const KEY = "biz-records:v1";
const EVENT = "biz-records-changed";

export const statusLabels: Record<RecordStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function read(): BizRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as BizRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: BizRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage indisponível */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addRecord(rec: Omit<BizRecord, "id" | "createdAt" | "status">): BizRecord {
  const full: BizRecord = {
    ...rec,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "pendente",
  };
  write([full, ...read()]);
  return full;
}

export function setStatus(id: string, status: RecordStatus, cancelReason?: string) {
  write(
    read().map((r) =>
      r.id === id
        ? { ...r, status, ...(cancelReason === undefined ? {} : { cancelReason }) }
        : r,
    ),
  );
}

export function removeRecord(id: string) {
  write(read().filter((r) => r.id !== id));
}

export function clearRecords() {
  write([]);
}

/** Pedidos e agendamentos registrados no navegador. */
export function useRecords() {
  const [records, setRecords] = useState<BizRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => setRecords(read()), []);

  useEffect(() => {
    refresh();
    setLoaded(true);
    const onChange = () => refresh();
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { records, loaded, refresh };
}

export const fmtDateBR = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
