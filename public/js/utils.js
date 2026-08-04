/* ============================================================
   UTILIDADES (selectores, formatos, badges)
   ============================================================ */

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export const esc = (str) =>
  String(str ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export const money = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));

export const money2 = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" }).format(Number(n || 0));

export const fmtDate = (d) => {
  if (!d) return "—";
  const parts = String(d).split("-");
  if (parts.length !== 3) return d;
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${parts[2]} ${months[Number(parts[1]) - 1]} ${parts[0]}`;
};

export const prodBadge = (estado) => {
  const map = {
    Preproduccion: "prep",
    Rodaje: "rodaje",
    Postproduccion: "post",
    Distribucion: "dist",
    Completada: "comple",
  };
  return `<span class="badge ${map[estado] || "comple"}">${esc(estado || "Sin estado")}</span>`;
};

export const planBadge = (estado) => {
  const map = {
    Programado: "prog",
    Completado: "comple",
    Cancelado_Clima: "cancel",
    Reprogramado: "repro",
  };
  return `<span class="badge ${map[estado] || "comple"}">${esc(estado || "Sin estado").replace(/_/g, " ")}</span>`;
};

export const estadoList = (estados) =>
  estados.map((e) => `<option value="${e}">${String(e).replace(/_/g, " ")}</option>`).join("");

export const optList = (items, valueKey, labelFn, extraOpts = "") =>
  extraOpts + items.map((it) => `<option value="${it[valueKey]}">${esc(labelFn(it))}</option>`).join("");
