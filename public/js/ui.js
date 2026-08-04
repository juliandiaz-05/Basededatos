/* ============================================================
   INTERFAZ: modal, formularios, confirmaciones y toasts
   ============================================================ */

import { $ } from "./utils.js";

/* ---------- Toasts ---------- */
export function toast(message, type = "success") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.textContent = message;
  $("#toast-container").appendChild(box);
  setTimeout(() => {
    box.style.opacity = "0";
    box.style.transition = "opacity 0.4s";
    setTimeout(() => box.remove(), 400);
  }, 3200);
}

/* ---------- Modal ---------- */
const overlay = $("#modal-overlay");

export function openModal(title, bodyHTML, footHTML = "") {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = bodyHTML;
  $("#modal-foot").innerHTML = footHTML;
  overlay.classList.add("open");
}

export function closeModal() {
  overlay.classList.remove("open");
  $("#modal-body").innerHTML = "";
  $("#modal-foot").innerHTML = "";
}

$("#modal-close").addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

/* ---------- Confirmación ---------- */
export function confirmDialog(message, onConfirm) {
  openModal(
    "Confirmar acción",
    `<p class="confirm-text">${message}</p>`,
    `<button class="btn btn-ghost" id="cf-cancel">Cancelar</button>
     <button class="btn btn-danger" id="cf-ok">Sí, continuar</button>`
  );
  $("#cf-cancel").addEventListener("click", closeModal);
  $("#cf-ok").addEventListener("click", async () => {
    closeModal();
    await onConfirm();
  });
}

/* ---------- Formularios ---------- */
export function openForm(title, formHTML, onSubmit, data = {}) {
  openModal(
    title,
    `<form id="modal-form" class="form-grid">${formHTML}</form>`,
    `<button type="button" class="btn btn-ghost" id="btn-cancel">Cancelar</button>
     <button type="submit" class="btn btn-primary" id="btn-save">Guardar</button>`
  );
  const form = $("#modal-form");
  $("#btn-cancel").addEventListener("click", closeModal);

  Object.entries(data).forEach(([name, value]) => {
    const input = form.elements[name];
    if (input && value !== undefined && value !== null) input.value = value;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      await onSubmit(values);
      closeModal();
    } catch (err) {
      toast(err.message, "error");
    }
  });
}

export const field = (name, label, type, required = true, extra = "") =>
  `<div class="field ${type === "textarea" || type === "select" ? "full" : ""}">
     <label for="f-${name}">${label}${required ? " *" : ""}</label>
     ${
       type === "select"
         ? `<select name="${name}" id="f-${name}" ${required ? "required" : ""}>${extra}</select>`
         : type === "textarea"
         ? `<textarea name="${name}" id="f-${name}" ${required ? "required" : ""}>${extra}</textarea>`
         : `<input type="${type}" name="${name}" id="f-${name}" ${required ? "required" : ""} ${extra} />`
     }
   </div>`;
