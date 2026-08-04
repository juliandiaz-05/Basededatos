import { Router } from "express";
import {
  getAllPlanes,
  createPlan,
  updatePlan,
  deletePlan,
  cancelarPorClima,
  reprogramarPlan,
} from "../controllers/planRodaje.controller.js";

const router = Router();

router.get("/", getAllPlanes);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);
router.post("/:id/cancelar-clima", cancelarPorClima);
router.post("/:id/reprogramar", reprogramarPlan);

export default router;
