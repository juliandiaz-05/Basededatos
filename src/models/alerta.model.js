import pool from "../config/db.js";

const JOIN_SQL = `SELECT a.*, p.titulo AS produccion
  FROM Alerta a
  LEFT JOIN Produccion p ON p.id_produccion = a.id_produccion`;

export const AlertaModel = {
  findAll: async () => {
    const [rows] = await pool.query(JOIN_SQL + " ORDER BY a.fecha_registro DESC, a.id_alerta DESC");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(JOIN_SQL + " WHERE a.id_alerta = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Alerta (id_produccion, tipo, mensaje) VALUES (?, ?, ?)",
      [data.id_produccion, data.tipo, data.mensaje]
    );
    return await AlertaModel.findById(result.insertId);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Alerta WHERE id_alerta = ?", [id]);
    return result.affectedRows > 0;
  },
};
