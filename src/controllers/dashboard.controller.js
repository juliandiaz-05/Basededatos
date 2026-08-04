import { DashboardModel } from "../models/dashboard.model.js";
import { ok, fail } from "../utils/http.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await DashboardModel.getData();
    const { resumen } = data;

    const presupuestoTotal = resumen.reduce((a, r) => a + Number(r.presupuesto_total), 0);
    const costoLocaciones = resumen.reduce((a, r) => a + Number(r.costo_locaciones), 0);
    const enRiesgo = resumen.filter((r) => Number(r.costo_locaciones) > Number(r.presupuesto_total) * 0.8);

    const kpis = {
      totalProducciones: resumen.length,
      produccionesActivas: resumen.filter((r) => ["Preproduccion", "Rodaje"].includes(r.estado)).length,
      totalEscenas: resumen.reduce((a, r) => a + Number(r.total_escenas), 0),
      totalPersonal: data.totalPersonal,
      totalLocaciones: data.totalLocaciones,
      totalAlertas: resumen.reduce((a, r) => a + Number(r.total_alertas), 0),
      presupuestoTotal,
      costoLocaciones,
      pctPresupuesto: presupuestoTotal > 0 ? Math.round((costoLocaciones / presupuestoTotal) * 100) : 0,
    };

    ok(res, "Dashboard generado", {
      resumen,
      kpis,
      produccionesPorEstado: data.produccionesPorEstado,
      planesPorEstado: data.planesPorEstado,
      alertasPorTipo: data.alertasPorTipo,
      escenasPorAmbiente: data.escenasPorAmbiente,
      personalPorRol: data.personalPorRol,
      proximosRodajes: data.proximosRodajes,
      enRiesgo,
    });
  } catch (e) {
    fail(res, "Error al generar dashboard", e.message, 500);
  }
};
