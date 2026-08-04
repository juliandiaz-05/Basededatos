import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import produccionRouter from "./routes/produccion.routes.js";
import personalRouter from "./routes/personal.routes.js";
import locacionRouter from "./routes/locacion.routes.js";
import escenaRouter from "./routes/escena.routes.js";
import planRodajeRouter from "./routes/planRodaje.routes.js";
import alertaRouter from "./routes/alerta.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { ok, fail } from "./utils/http.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api", (req, res) => {
  ok(res, "API del Sistema de Control de Producción Cinematográfica");
});

app.use("/api/producciones", produccionRouter);
app.use("/api/personal", personalRouter);
app.use("/api/locaciones", locacionRouter);
app.use("/api/escenas", escenaRouter);
app.use("/api/plan-rodaje", planRodajeRouter);
app.use("/api/alertas", alertaRouter);
app.use("/api/dashboard", dashboardRouter);

/* Cualquier ruta que no sea de la API -> página principal */
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return fail(res, "Ruta no encontrada", [], 404);
  }
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
