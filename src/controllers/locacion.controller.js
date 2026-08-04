import { LocacionModel } from "../models/locacion.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllLocaciones = async (req, res) => {
  try {
    const rows = await LocacionModel.findAll();
    ok(res, "Locaciones obtenidas", rows);
  } catch (e) {
    fail(res, "Error al obtener locaciones", e.message, 500);
  }
};

export const createLocacion = async (req, res) => {
  try {
    const { nombre, pais } = req.body;
    if (!nombre || !pais) return fail(res, "nombre y país son obligatorios");
    const nueva = await LocacionModel.create(req.body);
    ok(res, "Locación creada", nueva, 201);
  } catch (e) {
    fail(res, "Error al crear locación", e.message, 500);
  }
};

export const updateLocacion = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await LocacionModel.update(Number(id), req.body);
    if (!actualizada) return fail(res, "Locación no encontrada", [], 404);
    ok(res, "Locación actualizada", actualizada);
  } catch (e) {
    fail(res, "Error al actualizar locación", e.message, 500);
  }
};

export const deleteLocacion = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await LocacionModel.delete(Number(id));
    if (!eliminada) return fail(res, "Locación no encontrada", [], 404);
    ok(res, "Locación eliminada");
  } catch (e) {
    fail(res, "Error al eliminar locación", e.message, 500);
  }
};
