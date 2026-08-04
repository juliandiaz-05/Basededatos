/* ============================================================
   MÓDULO: PANEL DE CONTROL (dashboard)
   ============================================================ */

import { $, esc, money, fmtDate, prodBadge, planBadge } from "./utils.js";
import { apiGet } from "./api.js";

export async function initDashboard() {
  try {
    const data = await apiGet("/api/dashboard");
    const { kpis, produccionesPorEstado, planesPorEstado, alertasPorTipo, escenasPorAmbiente, proximosRodajes, enRiesgo, resumen } = data;

    $("#today-date").textContent = "Hoy: " + new Date().toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    $("#kpi-grid").innerHTML = `
      <div class="kpi"><div class="kpi-num">${kpis.totalProducciones}</div><div class="kpi-label">Producciones</div><div class="kpi-sub">${kpis.produccionesActivas} activas</div></div>
      <div class="kpi green"><div class="kpi-num">${money(kpis.presupuestoTotal)}</div><div class="kpi-label">Presupuesto total</div><div class="kpi-sub">${kpis.pctPresupuesto}% en locaciones</div></div>
      <div class="kpi blue"><div class="kpi-num">${kpis.totalEscenas}</div><div class="kpi-label">Escenas</div><div class="kpi-sub">${kpis.totalPersonal} en personal</div></div>
      <div class="kpi purple"><div class="kpi-num">${kpis.totalLocaciones}</div><div class="kpi-label">Locaciones</div></div>
      <div class="kpi red"><div class="kpi-num">${kpis.totalAlertas}</div><div class="kpi-label">Alertas</div><div class="kpi-sub">${enRiesgo.length} con riesgo $</div></div>`;

    renderBars("#chart-producciones-estado", produccionesPorEstado, "estado", "total");
    renderBars("#chart-alertas", alertasPorTipo, "tipo", "total");
    renderBars("#chart-ambiente", escenasPorAmbiente, "tipo_ambiente", "total");
    renderDonut(planesPorEstado);

    $("#proximos-rodajes").innerHTML =
      proximosRodajes.length === 0
        ? `<p style="color:var(--text-dim);font-size:13px">No hay rodajes programados próximos.</p>`
        : proximosRodajes.map((p) => `
            <div class="list-row">
              <div><span class="date">${fmtDate(p.fecha_rodaje)}</span> · <span class="title">Esc. ${p.numero_escena}</span> · ${esc(p.produccion)}</div>
              <div class="sub">${esc(p.locacion || "Sin locación")} · ${planBadge(p.estado_rodaje)}</div>
            </div>`).join("");

    $("#riesgo-presupuesto").innerHTML =
      enRiesgo.length === 0
        ? `<p style="color:var(--text-dim);font-size:13px">Ninguna producción supera el 80% de su presupuesto en locaciones.</p>`
        : enRiesgo.map((p) => `
            <div class="list-row">
              <div><span class="title">${esc(p.titulo)}</span><div class="sub">${money(p.presupuesto_total)} de presupuesto</div></div>
              <div><span class="badge cancel">${money(p.costo_locaciones)}</span></div>
            </div>`).join("");

    $("#tabla-resumen").innerHTML = resumen.map((p) => `
      <tr>
        <td><strong>${esc(p.titulo)}</strong></td>
        <td>${prodBadge(p.estado)}</td>
        <td class="num money">${money(p.presupuesto_total)}</td>
        <td class="num">${money(p.costo_locaciones)}</td>
        <td class="num">${p.total_escenas}</td>
        <td class="num">${p.total_alertas}</td>
        <td class="num">${fmtDate(p.fecha_inicio)} → ${fmtDate(p.fecha_fin_estimada)}</td>
      </tr>`).join("");
  } catch (err) {
    $("#kpi-grid").innerHTML =
      `<div class="card"><p style="color:var(--red)">Error al cargar el panel: ${esc(err.message)}</p></div>`;
  }
}

function renderBars(sel, data, key, value) {
  const el = $(sel);
  if (!el) return;
  if (!data.length) {
    el.innerHTML = `<p style="color:var(--text-dim);font-size:13px">Sin datos.</p>`;
    return;
  }
  const max = Math.max(...data.map((d) => Number(d[value])));
  el.innerHTML = data.map((d) => {
    const h = max > 0 ? Math.max(6, Math.round((Number(d[value]) / max) * 100)) : 6;
    return `<div class="bar-col">
              <span class="bar-num">${d[value]}</span>
              <div class="bar" style="height:${h}%"></div>
              <span class="bar-label">${esc(d[key])}</span>
            </div>`;
  }).join("");
}

function renderDonut(planesPorEstado) {
  const el = $("#donut-planes");
  const legend = $("#donut-planes-legend");
  if (!el) return;
  const colors = { Programado: "#ff7a00", Completado: "#3ddc97", Cancelado_Clima: "#ff5f56", Reprogramado: "#ffb04d" };
  const total = planesPorEstado.reduce((a, d) => a + Number(d.total), 0);
  if (total === 0) {
    el.style.background = "#2a2e3f";
    legend.innerHTML = "<p style='color:var(--text-dim);font-size:13px'>Sin planes registrados.</p>";
    return;
  }
  let acc = 0;
  const segs = planesPorEstado.map((d) => {
    const start = (acc / total) * 360;
    acc += Number(d.total);
    const end = (acc / total) * 360;
    const color = colors[d.estado_rodaje] || "#9aa0b5";
    return `${color} ${start}deg ${end}deg`;
  });
  el.style.background = `conic-gradient(${segs.join(", ")})`;
  legend.innerHTML = planesPorEstado
    .map((d) => `<div class="legend-item"><span class="dot" style="background:${colors[d.estado_rodaje] || "#9aa0b5"}"></span>${String(d.estado_rodaje).replace(/_/g, " ")} <strong>${d.total}</strong></div>`)
    .join("");
}
