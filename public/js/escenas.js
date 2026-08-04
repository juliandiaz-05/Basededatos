/* ============================================================
   MÓDULO: ESCENAS (CRUD + filtro por producción)
   ============================================================ */

import { $, esc, estadoList, optList } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

export async function initEscenas() {
  const producciones = await apiGet("/api/producciones");
  const filtro = $("#filtro-escenas");
  const anterior = filtro.value;
  filtro.innerHTML = `<option value="">Todas</option>` + optList(producciones, "id_produccion", (p) => p.titulo);
  if (anterior) filtro.value = anterior;

  filtro.onchange = initEscenas;

  const q = filtro.value ? `?idProduccion=${filtro.value}` : "";
  const rows = await apiGet("/api/escenas" + q);
  window._escenasCache = rows;

  $("#tabla-escenas").innerHTML = rows.map((e) => `
    <tr>
      <td class="num">${e.id_escena}</td>
      <td><strong>${esc(e.produccion)}</strong></td>
      <td class="num">Esc. ${e.numero_escena}</td>
      <td>${esc(e.descripcion || "—")}</td>
      <td>${esc(e.locacion || "—")}</td>
      <td><span class="badge ${e.tipo_ambiente === "Exterior" ? "rodaje" : "post"}">${esc(e.tipo_ambiente)}</span></td>
      <td>${esc(e.clima_requerido)}</td>
      <td>
        <button class="btn-icon" title="Editar" data-act="edit" data-id="${e.id_escena}">&#9998;</button>
        <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${e.id_escena}">&#128465;</button>
      </td>
    </tr>`).join("");
  bindActions();
}

function bindActions() {
  $("#tabla-escenas").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "edit") openEditEscena(id);
      if (btn.dataset.act === "del") deleteEscena(id);
    })
  );
}

async function getFormOptions() {
  const [producciones, locaciones] = await Promise.all([
    apiGet("/api/producciones"),
    apiGet("/api/locaciones"),
  ]);
  return `
    ${field("id_produccion", "Producción", "select", true, optList(producciones, "id_produccion", (p) => p.titulo))}
    ${field("id_locacion", "Locación", "select", false, optList(locaciones, "id_locacion", (l) => `${l.nombre} (${l.pais})`, `<option value="">Sin locación</option>`))}
    ${field("numero_escena", "Número de escena", "number", true, `min="1"`)}
    ${field("descripcion", "Descripción", "textarea", false)}
    ${field("tipo_ambiente", "Tipo de ambiente", "select", true, estadoList(["Interior", "Exterior"]))}
    ${field("clima_requerido", "Clima requerido", "select", false, estadoList(["Indiferente", "Despejado", "Soleado", "Nublado", "Lluvia", "Nevada", "Tormenta"]))}`;
}

export async function openNewEscena() {
  openForm("Nueva escena", await getFormOptions(), async (v) => {
    await apiSend("POST", "/api/escenas", v);
    toast("Escena creada");
    initEscenas();
  });
}

async function openEditEscena(id) {
  const cache = window._escenasCache || [];
  const e = cache.find((r) => r.id_escena === id) || (await apiGet("/api/escenas")).find((r) => r.id_escena === id);
  openForm(
    "Editar escena",
    await getFormOptions(),
    async (v) => {
      await apiSend("PUT", `/api/escenas/${id}`, v);
      toast("Escena actualizada");
      initEscenas();
    },
    { ...e, id_locacion: e.id_locacion || "" }
  );
}

async function deleteEscena(id) {
  confirmDialog("¿Eliminar esta escena? No se permitirá si tiene un plan de rodaje vinculado (integridad referencial).", async () => {
    await apiSend("DELETE", `/api/escenas/${id}`);
    toast("Escena eliminada");
    initEscenas();
  });
}
