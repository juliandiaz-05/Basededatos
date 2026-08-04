import { Router } from "express";
import {
  getAllLocaciones,
  createLocacion,
  updateLocacion,
  deleteLocacion,
} from "../controllers/locacion.controller.js";

const router = Router();

router.get("/", getAllLocaciones);
router.post("/", createLocacion);
router.put("/:id", updateLocacion);
router.delete("/:id", deleteLocacion);

export default router;
