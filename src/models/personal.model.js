import pool from "../config/db.js";

const ALLOWED = ["nombre", "rol", "email", "telefono", "pais_origen"];

export const PersonalModel = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM Personal ORDER BY id_personal");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM Personal WHERE id_personal = ?", [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await pool.query(
      "INSERT INTO Personal (nombre, rol, email, telefono, pais_origen) VALUES (?, ?, ?, ?, ?)",
      [data.nombre, data.rol, data.email, data.telefono || null, data.pais_origen || null]
    );
    return await PersonalModel.findById(result.insertId);
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
      `UPDATE Personal SET ${sets.join(", ")} WHERE id_personal = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return await PersonalModel.findById(id);
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM Personal WHERE id_personal = ?", [id]);
    return result.affectedRows > 0;
  },
};
