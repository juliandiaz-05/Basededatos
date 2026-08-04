/* ============================================================
   MÓDULO: ALERTAS (listado + CRUD)
   ============================================================ */

import { $, esc, estadoList, optList } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

export async function initAlertas() {
  const rows = await apiGet("/api/alertas");
  $("#lista-alertas").innerHTML =
    rows.length === 0
      ? `<p style="color:var(--text-dim);font-size:13px">No hay alertas registradas.</p>`
      : rows.map((a) => `
          <div class="list-row">
            <div>
              <div>
                <span class="badge ${a.tipo === "Clima Adverso" ? "cancel" : a.tipo === "Presupuesto" ? "rodaje" : a.tipo === "Reprogramacion" ? "repro" : "prog"}">${esc(a.tipo)}</span>
                <span class="title"> · ${esc(a.produccion)}</span>
              </div>
              <div class="sub">${esc(a.mensaje)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="sub">${esc(a.fecha_registro ? String(a.fecha_registro).split(" ")[0] : "")}</span>
              <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${a.id_alerta}">&#128465;</button>
            </div>
          </div>`).join("");
  bindActions();
}

function bindActions() {
  $("#lista-alertas").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => deleteAlerta(Number(btn.dataset.id)))
  );
}

export function openNewAlerta() {
  openForm(
    "Nueva alerta",
    `
      ${field("id_produccion", "Producción", "select", true, "<option value=''>Cargando...</option>")}
      ${field("tipo", "Tipo de alerta", "select", true, estadoList(["Clima Adverso", "Presupuesto", "Reprogramacion", "Plan de Rodaje", "Normativa", "Otro"]))}
      ${field("mensaje", "Mensaje", "textarea", true)}`,
    async (v) => {
      await apiSend("POST", "/api/alertas", v);
      toast("Alerta creada");
      initAlertas();
    }
  );
  apiGet("/api/producciones").then((rows) => {
    const sel = $("#modal-form").elements.id_produccion;
    if (sel) sel.innerHTML = optList(rows, "id_produccion", (p) => p.titulo);
  });
}

async function deleteAlerta(id) {
  confirmDialog("¿Eliminar esta alerta?", async () => {
    await apiSend("DELETE", `/api/alertas/${id}`);
    toast("Alerta eliminada");
    initAlertas();
  });
}
