/* ============================================================
   MÓDULO: PLAN DE RODAJE (cronograma + reglas de clima)
   ============================================================ */

import { $, esc, fmtDate, planBadge, estadoList, optList } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

export async function initPlan() {
  const rows = await apiGet("/api/plan-rodaje");
  $("#tabla-plan").innerHTML = rows.map((p) => `
    <tr>
      <td class="num">${p.id_plan}</td>
      <td class="num"><strong>${fmtDate(p.fecha_rodaje)}</strong></td>
      <td>${esc(p.produccion)}</td>
      <td>Esc. ${p.numero_escena} <span class="sub">${esc(p.descripcion || "")}</span></td>
      <td><span class="badge ${p.tipo_ambiente === "Exterior" ? "rodaje" : "post"}">${esc(p.tipo_ambiente)}</span></td>
      <td>${esc(p.clima_requerido)}</td>
      <td>${esc(p.locacion || "—")}</td>
      <td>${planBadge(p.estado_rodaje)}</td>
      <td>
        <button class="btn-icon" title="Editar" data-act="edit" data-id="${p.id_plan}">&#9998;</button>
        ${p.estado_rodaje === "Programado" ? `<button class="btn-icon danger" title="Cancelar por clima" data-act="clima" data-id="${p.id_plan}">&#127783;</button>` : ""}
        <button class="btn-icon" title="Reprogramar" data-act="repro" data-id="${p.id_plan}">&#128260;</button>
        <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${p.id_plan}">&#128465;</button>
      </td>
    </tr>`).join("");
  bindActions();
}

function bindActions() {
  $("#tabla-plan").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;
      if (act === "edit") openEditPlan(id);
      if (act === "clima") cancelarClima(id);
      if (act === "repro") reprogramar(id);
      if (act === "del") deletePlan(id);
    })
  );
}

async function getEscenaOptions() {
  const escenas = await apiGet("/api/escenas");
  return optList(escenas, "id_escena", (e) => `${e.produccion} · Esc. ${e.numero_escena} (${e.tipo_ambiente})`);
}

export async function openNewPlan() {
  openForm(
    "Programar rodaje",
    `
      ${field("id_escena", "Escena", "select", true, await getEscenaOptions())}
      ${field("fecha_rodaje", "Fecha de rodaje", "date", true)}
      ${field("estado_rodaje", "Estado", "select", false, estadoList(["Programado", "Completado"]))}
      <div class="field full"><p class="hint">Si el rodaje se cancela por clima o se reprograma, el sistema generará una alerta automáticamente.</p></div>`,
    async (v) => {
      await apiSend("POST", "/api/plan-rodaje", v);
      toast("Rodaje programado");
      initPlan();
    }
  );
}

async function openEditPlan(id) {
  const rows = await apiGet("/api/plan-rodaje");
  const p = rows.find((r) => r.id_plan === id);
  openForm(
    "Editar plan de rodaje",
    `
      ${field("id_escena", "Escena", "select", true, await getEscenaOptions())}
      ${field("fecha_rodaje", "Fecha de rodaje", "date", true)}
      ${field("estado_rodaje", "Estado", "select", false, estadoList(["Programado", "Completado", "Cancelado_Clima", "Reprogramado"]))}`,
    async (v) => {
      await apiSend("PUT", `/api/plan-rodaje/${id}`, v);
      toast("Plan de rodaje actualizado");
      initPlan();
    },
    { id_escena: p.id_escena, fecha_rodaje: p.fecha_rodaje, estado_rodaje: p.estado_rodaje }
  );
}

/* Regla de negocio: cancelación por clima adverso */
async function cancelarClima(id) {
  const rows = await apiGet("/api/plan-rodaje");
  const p = rows.find((r) => r.id_plan === id);
  openForm(
    "Cancelar rodaje por clima adverso",
    `
      ${field("motivo", "Condición climática (ej. nevada intensa)", "text", false, `placeholder="Nevada intensa"`)}
      <div class="field full">
        <p class="hint warn">&#9888; Se cambiará el estado a <strong>Cancelado_Clima</strong> y se registrará una alerta automática para la producción <em>${esc(p.produccion)}</em>, Escena ${p.numero_escena}.</p>
      </div>`,
    async (v) => {
      await apiSend("POST", `/api/plan-rodaje/${id}/cancelar-clima`, { motivo: v.motivo });
      toast("Rodaje cancelado y alerta generada", "warn");
      initPlan();
    }
  );
}

/* Regla de negocio: reprogramación */
async function reprogramar(id) {
  const rows = await apiGet("/api/plan-rodaje");
  const p = rows.find((r) => r.id_plan === id);
  openForm(
    "Reprogramar rodaje",
    `
      ${field("nueva_fecha", "Nueva fecha de rodaje", "date", true)}
      <div class="field full">
        <p class="hint warn">&#9888; El estado cambiará a <strong>Reprogramado</strong> y se registrará una alerta para <em>${esc(p.produccion)}</em>, Escena ${p.numero_escena}.</p>
      </div>`,
    async (v) => {
      await apiSend("POST", `/api/plan-rodaje/${id}/reprogramar`, { nueva_fecha: v.nueva_fecha });
      toast("Rodaje reprogramado y alerta generada", "warn");
      initPlan();
    }
  );
}

async function deletePlan(id) {
  confirmDialog("¿Eliminar este plan de rodaje del cronograma?", async () => {
    await apiSend("DELETE", `/api/plan-rodaje/${id}`);
    toast("Plan de rodaje eliminado");
    initPlan();
  });
}
