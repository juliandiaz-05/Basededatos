import pool from "../config/db.js";

const VIEW_SQL = "SELECT * FROM v_resumen_produccion";

const ALLOWED = ["titulo", "estado", "presupuesto_total", "fecha_inicio", "fecha_fin_estimada"];

export const ProduccionModel = {
  findAll: async () => {
    const [rows] = await pool.query(VIEW_SQL + " ORDER BY id_produccion");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(VIEW_SQL + " WHERE id_produccion = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Produccion (titulo, estado, presupuesto_total, fecha_inicio, fecha_fin_estimada) VALUES (?, ?, ?, ?, ?)",
      [
        data.titulo,
        data.estado || "Preproduccion",
        data.presupuesto_total,
        data.fecha_inicio || null,
        data.fecha_fin_estimada || null,
      ]
    );
    return await ProduccionModel.findById(result.insertId);
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
      `UPDATE Produccion SET ${sets.join(", ")} WHERE id_produccion = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return await ProduccionModel.findById(id);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Produccion WHERE id_produccion = ?", [id]);
    return result.affectedRows > 0;
  },
};
