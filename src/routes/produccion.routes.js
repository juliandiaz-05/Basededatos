import { Router } from "express";
import {
  getAllProducciones,
  getProduccionById,
  createProduccion,
  updateProduccion,
  deleteProduccion,
} from "../controllers/produccion.controller.js";

const router = Router();

router.get("/", getAllProducciones);
router.get("/:id", getProduccionById);
router.post("/", createProduccion);
router.put("/:id", updateProduccion);
router.delete("/:id", deleteProduccion);

export default router;
