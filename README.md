# 🎬 Sistema de Control de Producción Cinematográfica

**Proyecto 9 · SENA — Análisis y Desarrollo de Software**

Aplicación web completa (frontend + API + base de datos MySQL) para gestionar la producción de una película: producciones, personal, locaciones, escenas, plan de rodaje y alertas automáticas.

## 🚀 Cómo ejecutar

```bash
npm install

# Crear la base de datos (MySQL 8.0)
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u TU_USUARIO --password="TU_CONTRASEÑA" < database/control_cinematografico.sql

# Encender el servidor
npm run dev
```

Abrir en el navegador: **http://localhost:3000**

> La conexión a MySQL se configura en `src/config/db.js`.

## 🗄️ Base de datos

- **6 tablas**: `Produccion`, `Personal`, `Locacion`, `Escena`, `Plan_Rodaje`, `Alerta`
- **Vista**: `v_resumen_produccion` (resumen de cada producción)
- Script completo con datos de ejemplo: `database/control_cinematografico.sql`

## ⚙️ Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | JavaScript (ES Modules), CSS, HTML — sin frameworks |
| Backend | Node.js + Express |
| Base de datos | MySQL 8.0 (conexión con pool `mysql2`, consultas parametrizadas) |

## ✨ Funcionalidades destacadas

- **CRUD completo** de las 6 entidades (crear, listar, editar, eliminar)
- **Panel de control** con KPIs, gráficos (CSS puro) y detección de riesgo de presupuesto (>80% en locaciones)
- **Reglas de negocio automáticas**:
  - Cancelar rodaje por clima adverso → genera alerta automática
  - Reprogramar rodaje → genera alerta automática
  - Integridad referencial: no se borra una escena que tenga plan de rodaje (HTTP 409)
- **Documentación** del proyecto integrada en la propia aplicación

## 📁 Estructura

```
├── server.js          → arranque del servidor
├── src/               → backend en capas (routes, controllers, models)
│   ├── config/db.js   → conexión MySQL
│   └── ...
├── database/          → script SQL completo
├── public/            → frontend
│   ├── pages/         → 8 vistas (SPA)
│   ├── css/           → 10 hojas de estilos
│   └── js/            → 13 módulos
└── DOCUMENTACION.md   → documentación completa para exposición
```

## 👤 Autor

Julian Diaz — SENA ADSO
