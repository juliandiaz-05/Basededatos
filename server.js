import app from "./src/app.js";
import { verifyConnection } from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const dbOk = await verifyConnection();
  if (!dbOk) {
    console.error("No se pudo conectar a la base de datos. Verifica la configuracion en src/config/db.js");
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor encendido en el puerto ${PORT}`);
    console.log(`Abre la pagina en: http://localhost:${PORT}`);
    console.log(`Desde otro computador: http://<tu-ip>:${PORT}`);
  });
};

startServer();
