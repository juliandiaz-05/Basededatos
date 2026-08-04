import { PlanRodajeModel } from "../models/planRodaje.model.js";
import { ok, fail } from "../utils/http.js";

export const getAllPlanes = async (req, res) => {
  try {
    const rows = await PlanRodajeModel.findAll();
    ok(res, "Plan de rodaje obtenido", rows);
  } catch (e) {
    fail(res, "Error al obtener plan de rodaje", e.message, 500);
  }
};

export const createPlan = async (req, res) => {
  try {
    const { id_escena, fecha_rodaje } = req.body;
    if (!id_escena || !fecha_rodaje) return fail(res, "id_escena y fecha_rodaje son obligatorios");
    const nuevo = await PlanRodajeModel.create(req.body);
    ok(res, "Plan de rodaje creado", nuevo, 201);
  } catch (e) {
    fail(res, "Error al crear plan de rodaje", e.message, 500);
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await PlanRodajeModel.update(Number(id), req.body);
    if (!actualizado) return fail(res, "Plan de rodaje no encontrado", [], 404);
    ok(res, "Plan de rodaje actualizado", actualizado);
  } catch (e) {
    fail(res, "Error al actualizar plan de rodaje", e.message, 500);
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await PlanRodajeModel.delete(Number(id));
    if (!eliminado) return fail(res, "Plan de rodaje no encontrado", [], 404);
    ok(res, "Plan de rodaje eliminado");
  } catch (e) {
    fail(res, "Error al eliminar plan de rodaje", e.message, 500);
  }
};

/* Regla de negocio: clima adverso -> alerta automática */
export const cancelarPorClima = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const plan = await PlanRodajeModel.cancelarClima(Number(id), motivo);
    if (!plan) return fail(res, "Plan de rodaje no encontrado", [], 404);
    ok(res, "Rodaje cancelado por clima adverso y alerta generada", plan);
  } catch (e) {
    fail(res, "Error al cancelar rodaje", e.message, 500);
  }
};

/* Regla de negocio: reprogramación -> alerta automática */
export const reprogramarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_fecha } = req.body;
    if (!nueva_fecha) return fail(res, "Debe indicar la nueva fecha de rodaje");
    const plan = await PlanRodajeModel.reprogramar(Number(id), nueva_fecha);
    if (!plan) return fail(res, "Plan de rodaje no encontrado", [], 404);
    ok(res, "Rodaje reprogramado y alerta generada", plan);
  } catch (e) {
    fail(res, "Error al reprogramar rodaje", e.message, 500);
  }
};
