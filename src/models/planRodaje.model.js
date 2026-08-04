import pool from "../config/db.js";

const JOIN_SQL = `SELECT pr.id_plan, pr.id_escena, pr.fecha_rodaje, pr.estado_rodaje,
  e.numero_escena, e.descripcion AS escena, e.tipo_ambiente, e.clima_requerido,
  p.id_produccion, p.titulo AS produccion, l.nombre AS locacion
  FROM Plan_Rodaje pr
  JOIN Escena e ON e.id_escena = pr.id_escena
  JOIN Produccion p ON p.id_produccion = e.id_produccion
  LEFT JOIN Locacion l ON l.id_locacion = e.id_locacion`;

const ALLOWED = ["id_escena", "fecha_rodaje", "estado_rodaje"];

export const PlanRodajeModel = {
  findAll: async () => {
    const [rows] = await pool.query(JOIN_SQL + " ORDER BY pr.fecha_rodaje");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(JOIN_SQL + " WHERE pr.id_plan = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Plan_Rodaje (id_escena, fecha_rodaje, estado_rodaje) VALUES (?, ?, ?)",
      [data.id_escena, data.fecha_rodaje, data.estado_rodaje || "Programado"]
    );
    return await PlanRodajeModel.findById(result.insertId);
  },

  update: async (id, fields) => {
    const sets = [];
    const values = [];
    for (const key of ALLOWED) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (sets.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE Plan_Rodaje SET ${sets.join(", ")} WHERE id_plan = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return await PlanRodajeModel.findById(id);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Plan_Rodaje WHERE id_plan = ?", [id]);
    return result.affectedRows > 0;
  },

  cancelarClima: async (id, motivo) => {
    const plan = await PlanRodajeModel.findById(id);
    if (!plan) return null;
    await pool.query("UPDATE Plan_Rodaje SET estado_rodaje = 'Cancelado_Clima' WHERE id_plan = ?", [id]);
    const mensaje = `Clima adverso (${motivo || "condiciones climáticas"}) canceló el rodaje de la Escena ${plan.numero_escena} (${plan.produccion}) previsto para ${plan.fecha_rodaje}. Se recomienda reprogramar.`;
    await pool.query(
      "INSERT INTO Alerta (id_produccion, tipo, mensaje) VALUES (?, 'Clima Adverso', ?)",
      [plan.id_produccion, mensaje]
    );
    return await PlanRodajeModel.findById(id);
  },

  reprogramar: async (id, nuevaFecha) => {
    const plan = await PlanRodajeModel.findById(id);
    if (!plan) return null;
    await pool.query(
      "UPDATE Plan_Rodaje SET estado_rodaje = 'Reprogramado', fecha_rodaje = ? WHERE id_plan = ?",
      [nuevaFecha, id]
    );
    const mensaje = `La Escena ${plan.numero_escena} (${plan.produccion}) se reprogramó del ${plan.fecha_rodaje} al ${nuevaFecha}.`;
    await pool.query(
      "INSERT INTO Alerta (id_produccion, tipo, mensaje) VALUES (?, 'Reprogramacion', ?)",
      [plan.id_produccion, mensaje]
    );
    return await PlanRodajeModel.findById(id);
  },
};
