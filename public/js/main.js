/* ============================================================
   PUNTO DE ENTRADA: verifica la BD y carga la primera vista
   ============================================================ */

import { $, $$ } from "./utils.js";
import { showView } from "./router.js";

/* Navegación del sidebar */
$$(".nav-item").forEach((btn) =>
  btn.addEventListener("click", () => showView(btn.dataset.view))
);

/* Verificación del estado de la base de datos */
async function checkDb() {
  try {
    const r = await fetch("/api");
    if (r.ok) {
      $("#db-badge").textContent = "● Base de datos conectada";
      $("#db-badge").classList.add("ok");
    }
  } catch {
    $("#db-badge").textContent = "● Sin conexión a la BD";
    $("#db-badge").classList.add("bad");
  }
}

checkDb();
showView("dashboard");
