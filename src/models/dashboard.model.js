import pool from "../config/db.js";

const PLANES_PROXIMOS = `SELECT pr.id_plan, pr.fecha_rodaje, pr.estado_rodaje,
  e.numero_escena, p.titulo AS produccion, l.nombre AS locacion
  FROM Plan_Rodaje pr
  JOIN Escena e ON e.id_escena = pr.id_escena
  JOIN Produccion p ON p.id_produccion = e.id_produccion
  LEFT JOIN Locacion l ON l.id_locacion = e.id_locacion
  WHERE pr.fecha_rodaje >= CURDATE() AND pr.estado_rodaje = 'Programado'
  ORDER BY pr.fecha_rodaje LIMIT 6`;

export const DashboardModel = {
  getData: async () => {
    const [resumen] = await pool.query("SELECT * FROM v_resumen_produccion");
    const [produccionesPorEstado] = await pool.query("SELECT estado, COUNT(*) AS total FROM Produccion GROUP BY estado");
    const [planesPorEstado] = await pool.query("SELECT estado_rodaje, COUNT(*) AS total FROM Plan_Rodaje GROUP BY estado_rodaje");
    const [alertasPorTipo] = await pool.query("SELECT tipo, COUNT(*) AS total FROM Alerta GROUP BY tipo");
    const [escenasPorAmbiente] = await pool.query("SELECT tipo_ambiente, COUNT(*) AS total FROM Escena GROUP BY tipo_ambiente");
    const [personalPorRol] = await pool.query("SELECT rol, COUNT(*) AS total FROM Personal GROUP BY rol ORDER BY total DESC");
    const [proximosRodajes] = await pool.query(PLANES_PROXIMOS);
    const [totalPersonal] = await pool.query("SELECT COUNT(*) AS n FROM Personal");
    const [totalLocaciones] = await pool.query("SELECT COUNT(*) AS n FROM Locacion");

    return {
      resumen,
      produccionesPorEstado,
      planesPorEstado,
      alertasPorTipo,
      escenasPorAmbiente,
      personalPorRol,
      proximosRodajes,
      totalPersonal: totalPersonal[0].n,
      totalLocaciones: totalLocaciones[0].n,
    };
  },
};
