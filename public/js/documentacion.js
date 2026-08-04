/* ============================================================
   MÓDULO: DOCUMENTACIÓN (tabs del contenido académico)
   ============================================================ */

import { $$, $ } from "./utils.js";

export function initDocumentacion() {
  const tabs = $$("#doc-tabs .tab");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      $$(".tab-pane").forEach((p) => p.classList.remove("active"));
      const pane = $(`#pane-${tab.dataset.tab}`);
      if (pane) pane.classList.add("active");
    })
  );
}
