/* ============================================================
   MÓDULO: LOCACIONES (CRUD)
   ============================================================ */

import { $, esc, money2 } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

export async function initLocaciones() {
  const rows = await apiGet("/api/locaciones");
  $("#tabla-locaciones").innerHTML = rows.map((l) => `
    <tr>
      <td class="num">${l.id_locacion}</td>
      <td><strong>${esc(l.nombre)}</strong></td>
      <td>${esc(l.direccion || "—")}</td>
      <td>${esc(l.pais)}</td>
      <td class="num money">${money2(l.costo_diario)}</td>
      <td>
        <button class="btn-icon" title="Editar" data-act="edit" data-id="${l.id_locacion}">&#9998;</button>
        <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${l.id_locacion}">&#128465;</button>
      </td>
    </tr>`).join("");
  bindActions();
}

function bindActions() {
  $("#tabla-locaciones").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "edit") openEditLocacion(id);
      if (btn.dataset.act === "del") deleteLocacion(id);
    })
  );
}

const FORM = `
  ${field("nombre", "Nombre de la locación", "text", true, `maxlength="100"`)}
  ${field("pais", "País", "text", true, `maxlength="50"`)}
  ${field("direccion", "Dirección", "textarea", false)}
  ${field("costo_diario", "Costo diario (USD)", "number", false, `step="0.01" min="0"`)}
  <div class="field full"><p class="hint">El costo diario se compara con el presupuesto de cada producción para detectar desviaciones.</p></div>`;

export function openNewLocacion() {
  openForm("Nueva locación", FORM, async (v) => {
    await apiSend("POST", "/api/locaciones", v);
    toast("Locación creada");
    initLocaciones();
  });
}

async function openEditLocacion(id) {
  const rows = await apiGet("/api/locaciones");
  const l = rows.find((r) => r.id_locacion === id);
  openForm(
    "Editar locación",
    FORM.replace(
      `<div class="field full"><p class="hint">El costo diario se compara con el presupuesto de cada producción para detectar desviaciones.</p></div>`,
      ""
    ),
    async (v) => {
      await apiSend("PUT", `/api/locaciones/${id}`, v);
      toast("Locación actualizada");
      initLocaciones();
    },
    l
  );
}

async function deleteLocacion(id) {
  confirmDialog("¿Eliminar esta locación? Las escenas asociadas quedarán sin locación (SET NULL).", async () => {
    await apiSend("DELETE", `/api/locaciones/${id}`);
    toast("Locación eliminada");
    initLocaciones();
  });
}
