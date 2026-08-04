/* ============================================================
   MÓDULO: PERSONAL (CRUD)
   ============================================================ */

import { $, esc, estadoList } from "./utils.js";
import { apiGet, apiSend } from "./api.js";
import { openForm, confirmDialog, toast, field } from "./ui.js";

const ROLES = [
  "Director",
  "Directora de Fotografía",
  "Editor/a",
  "Guionista",
  "Maquillaje",
  "Productor/a",
  "Productor Ejecutivo",
  "Sonidista",
  "Técnico de Cámara",
  "Asistente de Dirección",
  "Actor Principal",
  "Actriz Principal",
  "Otro",
];

export async function initPersonal() {
  const rows = await apiGet("/api/personal");
  $("#tabla-personal").innerHTML = rows.map((p) => `
    <tr>
      <td class="num">${p.id_personal}</td>
      <td><strong>${esc(p.nombre)}</strong></td>
      <td>${esc(p.rol)}</td>
      <td>${esc(p.email)}</td>
      <td>${esc(p.telefono || "—")}</td>
      <td>${esc(p.pais_origen || "—")}</td>
      <td>
        <button class="btn-icon" title="Editar" data-act="edit" data-id="${p.id_personal}">&#9998;</button>
        <button class="btn-icon danger" title="Eliminar" data-act="del" data-id="${p.id_personal}">&#128465;</button>
      </td>
    </tr>`).join("");
  bindActions();
}

function bindActions() {
  $("#tabla-personal").querySelectorAll("button[data-act]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (btn.dataset.act === "edit") openEditPersonal(id);
      if (btn.dataset.act === "del") deletePersonal(id);
    })
  );
}

const FORM = `
  ${field("nombre", "Nombre completo", "text", true, `maxlength="100"`)}
  ${field("rol", "Rol", "select", true, estadoList(ROLES))}
  ${field("email", "Email", "email", true, `maxlength="100"`)}
  ${field("telefono", "Teléfono", "text", false, `maxlength="20"`)}
  ${field("pais_origen", "País de origen", "text", false, `maxlength="50"`)}`;

export function openNewPersonal() {
  openForm("Nuevo integrante del equipo", FORM, async (v) => {
    await apiSend("POST", "/api/personal", v);
    toast("Integrante creado");
    initPersonal();
  });
}

async function openEditPersonal(id) {
  const rows = await apiGet("/api/personal");
  const p = rows.find((r) => r.id_personal === id);
  openForm("Editar integrante", FORM, async (v) => {
    await apiSend("PUT", `/api/personal/${id}`, v);
    toast("Integrante actualizado");
    initPersonal();
  }, p);
}

async function deletePersonal(id) {
  confirmDialog("¿Eliminar este integrante del equipo?", async () => {
    await apiSend("DELETE", `/api/personal/${id}`);
    toast("Integrante eliminado");
    initPersonal();
  });
}
