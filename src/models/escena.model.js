import pool from "../config/db.js";

const JOIN_SQL = `SELECT e.*, p.titulo AS produccion, l.nombre AS locacion
  FROM Escena e
  LEFT JOIN Produccion p ON p.id_produccion = e.id_produccion
  LEFT JOIN Locacion l ON l.id_locacion = e.id_locacion`;

const ALLOWED = ["id_produccion", "id_locacion", "numero_escena", "descripcion", "tipo_ambiente", "clima_requerido"];

export const EscenaModel = {
  findAll: async (idProduccion) => {
    let sql = JOIN_SQL;
    const params = [];
    if (idProduccion) {
      sql += " WHERE e.id_produccion = ?";
      params.push(Number(idProduccion));
    }
    sql += " ORDER BY e.id_produccion, e.numero_escena";
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(JOIN_SQL + " WHERE e.id_escena = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Escena (id_produccion, id_locacion, numero_escena, descripcion, tipo_ambiente, clima_requerido) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.id_produccion,
        data.id_locacion || null,
        data.numero_escena,
        data.descripcion || null,
        data.tipo_ambiente,
        data.clima_requerido || "Indiferente",
      ]
    );
    return await EscenaModel.findById(result.insertId);
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
      `UPDATE Escena SET ${sets.join(", ")} WHERE id_escena = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return await EscenaModel.findById(id);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Escena WHERE id_escena = ?", [id]);
    return result.affectedRows > 0;
  },

  countPlans: async (id) => {
    const [rows] = await pool.query("SELECT COUNT(*) AS n FROM Plan_Rodaje WHERE id_escena = ?", [id]);
    return rows[0].n;
  },
};
