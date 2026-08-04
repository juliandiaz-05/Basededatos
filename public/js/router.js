/* ============================================================
   ROUTER: carga las páginas HTML desde pages/ y las inicializa
   ============================================================ */

import { $, $$ } from "./utils.js";
import { initDashboard } from "./dashboard.js";
import { initDocumentacion } from "./documentacion.js";
import { initProducciones, openNewProduccion } from "./producciones.js";
import { initPersonal, openNewPersonal } from "./personal.js";
import { initLocaciones, openNewLocacion } from "./locaciones.js";
import { initEscenas, openNewEscena } from "./escenas.js";
import { initPlan, openNewPlan } from "./planRodaje.js";
import { initAlertas, openNewAlerta } from "./alertas.js";

const routes = {
  dashboard: { page: "pages/dashboard.html", init: initDashboard },
  doc: { page: "pages/documentacion.html", init: initDocumentacion },
  producciones: { page: "pages/producciones.html", init: initProducciones, crear: openNewProduccion },
  personal: { page: "pages/personal.html", init: initPersonal, crear: openNewPersonal },
  locaciones: { page: "pages/locaciones.html", init: initLocaciones, crear: openNewLocacion },
  escenas: { page: "pages/escenas.html", init: initEscenas, crear: openNewEscena },
  plan: { page: "pages/planRodaje.html", init: initPlan, crear: openNewPlan },
  alertas: { page: "pages/alertas.html", init: initAlertas, crear: openNewAlerta },
};

export async function showView(name) {
  const route = routes[name];
  if (!route) return;

  const container = $("#page-container");
  try {
    const resp = await fetch(route.page, { cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    container.innerHTML = await resp.text();
  } catch (e) {
    container.innerHTML = `<div class="card"><p style="color:var(--red)">No se pudo cargar la página (${e.message}). Verifica que el servidor esté activo.</p></div>`;
    return;
  }

  $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === name));

  if (route.init) await route.init();

  const newBtn = container.querySelector("[data-new]");
  if (newBtn && route.crear) newBtn.addEventListener("click", route.crear);

  container.querySelectorAll("[data-goto]").forEach((btn) =>
    btn.addEventListener("click", () => showView(btn.dataset.goto))
  );
}
