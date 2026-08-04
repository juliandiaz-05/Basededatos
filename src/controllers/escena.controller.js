import { EscenaModel } from "../models/escena.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllEscenas = async (req, res) => {
  try {
    const { idProduccion } = req.query;
    const rows = await EscenaModel.findAll(idProduccion ? Number(idProduccion) : null);
    ok(res, "Escenas obtenidas", rows);
  } catch (e) {
    fail(res, "Error al obtener escenas", e.message, 500);
  }
};

export const createEscena = async (req, res) => {
  try {
    const { id_produccion, numero_escena, tipo_ambiente } = req.body;
    if (!id_produccion || !numero_escena || !tipo_ambiente) {
      return fail(res, "id_produccion, numero_escena y tipo_ambiente son obligatorios");
    }
    const nueva = await EscenaModel.create(req.body);
    ok(res, "Escena creada", nueva, 201);
  } catch (e) {
    fail(res, "Error al crear escena", e.message, 500);
  }
};

export const updateEscena = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await EscenaModel.update(Number(id), req.body);
    if (!actualizada) return fail(res, "Escena no encontrada", [], 404);
    ok(res, "Escena actualizada", actualizada);
  } catch (e) {
    fail(res, "Error al actualizar escena", e.message, 500);
  }
};

export const deleteEscena = async (req, res) => {
  try {
    const { id } = req.params;
    const planes = await EscenaModel.countPlans(Number(id));
    if (planes > 0) {
      return fail(res, "No se puede eliminar la escena porque tiene plan de rodaje vinculado", ["Integridad referencial"], 409);
    }
    const eliminada = await EscenaModel.delete(Number(id));
    if (!eliminada) return fail(res, "Escena no encontrada", [], 404);
    ok(res, "Escena eliminada");
  } catch (e) {
    fail(res, "Error al eliminar escena", e.message, 500);
  }
};
