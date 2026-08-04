import { AlertaModel } from "../models/alerta.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllAlertas = async (req, res) => {
  try {
    const rows = await AlertaModel.findAll();
    ok(res, "Alertas obtenidas", rows);
  } catch (e) {
    fail(res, "Error al obtener alertas", e.message, 500);
  }
};

export const createAlerta = async (req, res) => {
  try {
    const { id_produccion, tipo, mensaje } = req.body;
    if (!id_produccion || !tipo || !mensaje) return fail(res, "id_produccion, tipo y mensaje son obligatorios");
    const nueva = await AlertaModel.create(req.body);
    ok(res, "Alerta creada", nueva, 201);
  } catch (e) {
    fail(res, "Error al crear alerta", e.message, 500);
  }
};

export const deleteAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await AlertaModel.delete(Number(id));
    if (!eliminada) return fail(res, "Alerta no encontrada", [], 404);
    ok(res, "Alerta eliminada");
  } catch (e) {
    fail(res, "Error al eliminar alerta", e.message, 500);
  }
};
