/* ============================================================
   MÓDULO: PRODUCCIONES (CRUD)
   ============================================================ */

import { $, esc, money, fmtDate, prodBadge, estadoList } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

export async function initProducciones() {
  const rows = await apiGet("/api/producciones");
  $("#tabla-producciones").innerHTML = rows.map((p) => `
    <tr>
      <td class="num">${p.id_produccion}</td>
      <td><strong>${esc(p.titulo)}</strong></td>
      <td>${prodBadge(p.estado)}</td>
      <td class="num money">${money(p.presupuesto_total)}</td>
      <td class="num">${money(p.costo_locaciones)}</td>
      <td class="num">${p.total_escenas}</td>
      <td class="num">${p.total_planes}</td>
      <td class="num">${p.total_alertas}</td>
      <td class="num">${fmtDate(p.fecha_inicio)} → ${fmtDate(p.fecha_fin_estimada)}</td>
      <td>
        <button class="btn-icon" title="Editar" data-act="edit" data-id="${p.id_produccion}">&#9998;</button>
        <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${p.id_produccion}">&#128465;</button>
      </td>
    </tr>`).join("");
  bindActions();
}

function bindActions() {
  $("#tabla-producciones").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "edit") openEditProduccion(id);
      if (btn.dataset.act === "del") deleteProduccion(id);
    })
  );
}

const FORM = `
  ${field("titulo", "Título", "text", true, `maxlength="150" placeholder="Título de la película"`)}
  ${field("estado", "Estado", "select", false, estadoList(["Preproduccion", "Rodaje", "Postproduccion", "Distribucion", "Completada"]))}
  ${field("presupuesto_total", "Presupuesto total (USD)", "number", true, `step="0.01" min="0"`)}
  ${field("fecha_inicio", "Fecha de inicio", "date", false)}
  ${field("fecha_fin_estimada", "Fecha fin estimada", "date", false)}
  <div class="field full"><p class="hint">Los estados Preproducción, Rodaje, Postproducción y Distribución representan las etapas del proyecto audiovisual.</p></div>`;

export function openNewProduccion() {
  openForm("Nueva producción", FORM, async (v) => {
    await apiSend("POST", "/api/producciones", v);
    toast("Producción creada correctamente");
    initProducciones();
  });
}

async function openEditProduccion(id) {
  const p = await apiGet(`/api/producciones/${id}`);
  openForm(
    "Editar producción",
    FORM.replace(
      `<div class="field full"><p class="hint">Los estados Preproducción, Rodaje, Postproducción y Distribución representan las etapas del proyecto audiovisual.</p></div>`,
      ""
    ),
    async (v) => {
      await apiSend("PUT", `/api/producciones/${id}`, v);
      toast("Producción actualizada");
      initProducciones();
    },
    {
      titulo: p.titulo,
      estado: p.estado,
      presupuesto_total: p.presupuesto_total,
      fecha_inicio: p.fecha_inicio,
      fecha_fin_estimada: p.fecha_fin_estimada,
    }
  );
}

async function deleteProduccion(id) {
  confirmDialog("¿Eliminar esta producción? Se borrarán también sus escenas, rodajes y alertas (relación en cascada).", async () => {
    await apiSend("DELETE", `/api/producciones/${id}`);
    toast("Producción eliminada");
    initProducciones();
  });
}
