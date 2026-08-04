import { Router } from "express";
import {
  getAllEscenas,
  createEscena,
  updateEscena,
  deleteEscena,
} from "../controllers/escena.controller.js";

const router = Router();

router.get("/", getAllEscenas);
router.post("/", createEscena);
router.put("/:id", updateEscena);
router.delete("/:id", deleteEscena);

export default router;
