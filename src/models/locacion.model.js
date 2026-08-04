import pool from "../config/db.js";

const ALLOWED = ["nombre", "direccion", "pais", "costo_diario"];

export const LocacionModel = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM Locacion ORDER BY id_locacion");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM Locacion WHERE id_locacion = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Locacion (nombre, direccion, pais, costo_diario) VALUES (?, ?, ?, ?)",
      [data.nombre, data.direccion || null, data.pais, data.costo_diario || 0]
    );
    return await LocacionModel.findById(result.insertId);
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
      `UPDATE Locacion SET ${sets.join(", ")} WHERE id_locacion = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return await LocacionModel.findById(id);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Locacion WHERE id_locacion = ?", [id]);
    return result.affectedRows > 0;
  },
};
