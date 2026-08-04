import { PersonalModel } from "../models/personal.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllPersonal = async (req, res) => {
  try {
    const rows = await PersonalModel.findAll();
    ok(res, "Personal obtenido", rows);
  } catch (e) {
    fail(res, "Error al obtener personal", e.message, 500);
  }
};

export const createPersonal = async (req, res) => {
  try {
    const { nombre, rol, email } = req.body;
    if (!nombre || !rol || !email) return fail(res, "nombre, rol y email son obligatorios");
    const nuevo = await PersonalModel.create(req.body);
    ok(res, "Integrante creado", nuevo, 201);
  } catch (e) {
    fail(res, "Error al crear integrante (¿email duplicado?)", e.message, 500);
  }
};

export const updatePersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await PersonalModel.update(Number(id), req.body);
    if (!actualizado) return fail(res, "Integrante no encontrado", [], 404);
    ok(res, "Integrante actualizado", actualizado);
  } catch (e) {
    fail(res, "Error al actualizar integrante", e.message, 500);
  }
};

export const deletePersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await PersonalModel.delete(Number(id));
    if (!eliminado) return fail(res, "Integrante no encontrado", [], 404);
    ok(res, "Integrante eliminado");
  } catch (e) {
    fail(res, "Error al eliminar integrante", e.message, 500);
  }
};
