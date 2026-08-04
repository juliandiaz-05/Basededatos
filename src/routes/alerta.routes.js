import { Router } from "express";
import {
  getAllAlertas,
  createAlerta,
  deleteAlerta,
} from "../controllers/alerta.controller.js";

const router = Router();

router.get("/", getAllAlertas);
router.post("/", createAlerta);
router.delete("/:id", deleteAlerta);

export default router;
