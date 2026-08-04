import { ProduccionModel } from "../models/produccion.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllProducciones = async (req, res) => {
  try {
    const rows = await ProduccionModel.findAll();
    ok(res, "Producciones obtenidas", rows);
  } catch (e) {
    fail(res, "Error al obtener producciones", e.message, 500);
  }
};

export const getProduccionById = async (req, res) => {
  try {
    const { id } = req.params;
    const produccion = await ProduccionModel.findById(Number(id));
    if (!produccion) return fail(res, "Producción no encontrada", [], 404);
    ok(res, "Producción encontrada", produccion);
  } catch (e) {
    fail(res, "Error al buscar producción", e.message, 500);
  }
};

export const createProduccion = async (req, res) => {
  try {
    const { titulo, presupuesto_total } = req.body;
    if (!titulo) return fail(res, "El título es obligatorio");
    if (presupuesto_total === undefined || presupuesto_total === null) {
      return fail(res, "El presupuesto total es obligatorio");
    }
    const nueva = await ProduccionModel.create(req.body);
    ok(res, "Producción creada", nueva, 201);
  } catch (e) {
    fail(res, "Error al crear producción", e.message, 500);
  }
};

export const updateProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await ProduccionModel.update(Number(id), req.body);
    if (!actualizada) return fail(res, "Producción no encontrada", [], 404);
    ok(res, "Producción actualizada", actualizada);
  } catch (e) {
    fail(res, "Error al actualizar producción", e.message, 500);
  }
};

export const deleteProduccion = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await ProduccionModel.delete(Number(id));
    if (!eliminada) return fail(res, "Producción no encontrada", [], 404);
    ok(res, "Producción eliminada");
  } catch (e) {
    fail(res, "No se pudo eliminar la producción (tiene recursos vinculados)", e.message, 409);
  }
};
