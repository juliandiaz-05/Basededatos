# 📽️ Sistema de Control de Producción Cinematográfica

**Proyecto 9 · SENA Análisis y Desarrollo de Software** — Evidencia de las fases 3.1 a 3.4

Aplicación web completa (frontend + backend + base de datos) para gestionar la producción de una película: producciones, personal, locaciones, escenas, plan de rodaje y alertas automáticas.

---

## 1. Cómo ejecutar el proyecto

Requisitos:
- Node.js instalado
- MySQL Server 8.0 corriendo en el puerto 3306
- Base de datos creada (ver sección 3)

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Crear la base de datos
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u julian --password="1097102856" < database/control_cinematografico.sql

# 3. Encender el servidor (modo desarrollo, con reinicio automático)
npm run dev
```

Abrir en el navegador: **http://localhost:3000**

> En la barra lateral inferior aparece "● Base de datos conectada" cuando el servidor logra conectarse a MySQL.

---

## 2. Arquitectura del sistema

```
┌───────────────────────────────────────────────┐
│  FRONTEND (navegador)  — vanilla JS/CSS/HTML   │
│  public/                                       │
│    index.html   → shell con barra lateral      │
│    pages/       → 8 páginas (SPA dinámica)     │
│    css/         → 10 hojas de estilos          │
│    js/          → 13 módulos ES                │
└──────────────────────┬────────────────────────┘
                       │ fetch (JSON)
┌──────────────────────▼────────────────────────┐
│  BACKEND (Node.js + Express, puerto 3000)      │
│  server.js           → punto de entrada        │
│  src/app.js          → configuración y rutas   │
│  src/routes/         → 7 archivos de rutas     │
│  src/controllers/    → 7 controladores         │
│  src/models/         → 7 modelos (consultas)   │
│  src/config/db.js    → conexión a MySQL (pool) │
│  src/utils/http.js   → respuestas uniformes    │
└──────────────────────┬────────────────────────┘
                       │ mysql2 (SQL con parámetros)
┌──────────────────────▼────────────────────────┐
│  BASE DE DATOS  MySQL: control_cinematografico │
│  6 tablas + 1 vista + datos de ejemplo         │
└───────────────────────────────────────────────┘
```

**Ventaja de la arquitectura en capas** (argumento para la exposición):
- Cada entidad tiene su propio archivo de ruta → controlador → modelo: cambios aislados, fácil de mantener y de explicar.
- El frontend se comunica solo con la API REST, nunca con SQL directo (separación de responsabilidades).

**Respuesta uniforme de la API** (lo que siempre devuelve el servidor):

```json
{ "success": true, "message": "Producción creada", "data": {...}, "errors": [] }
```

---

## 3. Base de datos: `control_cinematografico`

Script completo: `database/control_cinematografico.sql` (crea BD, tablas, datos de ejemplo y la vista).

### 3.1 Tablas y relaciones

```
Produccion (id_produccion, titulo, estado, presupuesto_total, fecha_inicio, fecha_fin_estimada)
   │
   ├──< Personal (id_personal, nombre, rol, email, telefono, pais_origen)   [FK id_produccion]
   │
   ├──< Escena (id_escena, numero_escena, descripcion, tipo_ambiente, clima_requerido)
   │        │
   │        └──< Locacion (id_locacion, nombre, direccion, pais, costo_diario) [FK id_locacion]
   │
   ├──< Plan_Rodaje (id_plan, fecha_rodaje, estado_rodaje)                 [FK id_escena]
   │
   └──< Alerta (id_alerta, tipo, mensaje, fecha_registro)                  [FK id_produccion]
```

- **Personal** y **Escena** cuelgan directamente de **Produccion**.
- **Escena** puede tener una **Locacion** (si se borra la locación, la escena queda sin locación → `SET NULL`).
- **Plan_Rodaje** referencia a una **Escena** (se prohíbe borrar una escena que tenga plan → integridad referencial).
- **Alerta** se genera automáticamente (ver reglas de negocio).

### 3.2 Elementos SQL importantes (mencionarlos en la exposición)

1. **`ALTER TABLE Personal ADD COLUMN telefono ...`** — campo agregado posteriormente (requisito de la guía).
2. **`CREATE INDEX idx_tipo_ambiente ON Escena(tipo_ambiente)`** — optimiza la búsqueda por tipo de ambiente.
3. **Vista `v_resumen_produccion`** — resume cada producción con: presupuesto, costo acumulado en locaciones, total de escenas, planes y alertas:

```sql
CREATE OR REPLACE VIEW v_resumen_produccion AS
SELECT p.id_produccion, p.titulo, p.estado, p.presupuesto_total,
       p.fecha_inicio, p.fecha_fin_estimada,
       COALESCE(SUM(l.costo_diario), 0) AS costo_locaciones,
       (SELECT COUNT(*) FROM Escena e WHERE e.id_produccion = p.id_produccion) AS total_escenas,
       ...
```

4. **Datos de ejemplo**: 8 producciones, 12 integrantes de personal, 8 locaciones, 14 escenas, 10 planes de rodaje y 6 alertas.

### 3.3 Conexión a la base de datos

`src/config/db.js` usa un **pool de conexiones** de `mysql2` con:
- Usuario `julian` (con permisos GRANT ALL)
- `dateStrings: true` → las fechas llegan como `YYYY-MM-DD` (evita problemas de zona horaria)

```js
const pool = mysql.createPool({
  host: "localhost",
  user: "julian",
  password: "1097102856",
  database: "control_cinematografico",
  dateStrings: true,
});
```

> 🔒 **Seguridad:** todas las consultas usan **parámetros `?`** en vez de concatenar texto → previene inyección SQL.

---

## 4. API REST (backend)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api` | Verifica conexión con la BD |
| GET | `/api/dashboard` | Datos resumidos para el panel (KPIs, gráficos, riesgo) |
| GET/POST | `/api/producciones` | Listar / crear producción |
| GET/PUT/DELETE | `/api/producciones/:id` | Ver / actualizar / eliminar |
| GET/POST | `/api/personal` | Listar / crear integrante |
| GET/PUT/DELETE | `/api/personal/:id` | Ver / actualizar / eliminar |
| GET/POST | `/api/locaciones` | Listar / crear locación |
| GET/PUT/DELETE | `/api/locaciones/:id` | Ver / actualizar / eliminar |
| GET/POST | `/api/escenas` | Listar (con `?idProduccion=`) / crear escena |
| GET/PUT/DELETE | `/api/escenas/:id` | Ver / actualizar / eliminar |
| GET/POST | `/api/plan-rodaje` | Listar / programar rodaje |
| GET/PUT/DELETE | `/api/plan-rodaje/:id` | Ver / actualizar / eliminar |
| POST | `/api/plan-rodaje/:id/cancelar-clima` | Cancelar rodaje por clima adverso |
| POST | `/api/plan-rodaje/:id/reprogramar` | Reprogramar rodaje |
| GET/POST | `/api/alertas` | Listar / crear alerta |
| GET/PUT/DELETE | `/api/alertas/:id` | Ver / actualizar / eliminar |

**Códigos de estado usados:** `200` éxito · `201` creado · `400` validación · `404` no encontrado · `409` conflicto (no se puede borrar escena con plan de rodaje) · `500` error del servidor.

**Joins importantes (mencionarlos):**
- `Plan_Rodaje` se lista con `JOIN Escena`, `JOIN Produccion` y `LEFT JOIN Locacion` → la tabla del cronograma muestra producción, escena, clima requerido y locación en una sola consulta.
- `Escena` se lista con `JOIN Produccion` (muestra el título) y `LEFT JOIN Locacion`.
- `Alerta` se lista con `JOIN Produccion` (muestra el título).

---

## 5. Frontend (navegador)

### 5.1 Estructura de carpetas

```
public/
├── index.html          → página principal (barra lateral + contenedor + modal)
├── pages/              → 8 páginas que se cargan dinámicamente (SPA):
│     dashboard.html        Panel de control
│     documentacion.html    Documentación del proyecto
│     producciones.html     CRUD de producciones
│     personal.html         CRUD de personal
│     locaciones.html       CRUD de locaciones
│     escenas.html          CRUD de escenas + filtro por producción
│     planRodaje.html       CRUD del cronograma + acciones clima/reprogramar
│     alertas.html          Listado de alertas
├── css/                → 10 hojas separadas por responsabilidad:
│     variables.css  (paleta de colores)   base.css   (reset y tipografía)
│     layout.css    (estructura)           sidebar.css (menú lateral)
│     components.css (tarjetas, botones, KPIs, badges)  charts.css (gráficos)
│     tables.css    forms.css    modal.css    responsive.css
└── js/                 → 13 módulos ES (import/export):
      main.js        (entrada: navegación + verificación de BD)
      router.js      (carga páginas y conecta cada módulo)
      api.js         (fetch a la API)   utils.js   (ayudas de formato)
      ui.js          (modal, formularios, toasts, confirmaciones)
      dashboard.js / documentacion.js / producciones.js / personal.js /
      locaciones.js / escenas.js / planRodaje.js / alertas.js
```

### 5.2 Cómo funciona la navegación (SPA sin recargar)

1. `main.js` escucha los clics del menú lateral.
2. `router.js` (`showView`) carga el HTML correspondiente de `pages/` dentro de `#page-container`.
3. Luego ejecuta la función `initXxx()` del módulo de esa vista, que pide los datos a la API y dibuja la tabla/gráficos.
4. Botones de "Nuevo" y de fila (editar/eliminar) se conectan en el momento en que se cargan.

### 5.3 Diseño (tema naranja/negro)

- Paleta centralizada en `css/variables.css` → cambiar colores del sitio completo se hace en un solo archivo.
- Títulos en naranja `#ff7a00`, fondos negros, texto cálido.
- Tipografías de Google Fonts: **Inter** (texto) y **Poppins** (títulos).
- Gráficos hechos 100% con CSS (barras con `flex` y dona con `conic-gradient`) — sin librerías externas.

---

## 6. Reglas de negocio implementadas (¡lo más importante para la demo!)

### 6.1 Cancelación por clima adverso 🌧️
Botón "🌧" en un rodaje **Programado** → el sistema:
1. Cambia el estado a `Cancelado_Clima`
2. **Genera automáticamente** una alerta de tipo `Clima Adverso` con el motivo y los datos del rodaje
3. Recomienda reprogramar

### 6.2 Reprogramación 🔁
Botón "↻" en cualquier rodaje → pide la nueva fecha → el sistema:
1. Cambia el estado a `Reprogramado` y actualiza la fecha
2. **Genera automáticamente** una alerta de tipo `Reprogramacion` que registra fecha anterior y nueva

### 6.3 Integridad referencial (código 409) 🛡️
Intentar borrar una **escena que tiene un plan de rodaje** → el servidor lo rechaza con `409` y lo explica. (Consulta `COUNT(*)` en `Plan_Rodaje` antes de borrar.)

### 6.4 Riesgo de presupuesto 💸
El panel detecta producciones cuyo costo en locaciones supera el **80 % del presupuesto total** y las lista en "Producciones en riesgo" (ej.: "Medianoche en el Estudio").

### 6.5 KPIs del panel
- Total de producciones y cuántas están activas (Preproducción o Rodaje)
- Presupuesto total y % gastado en locaciones
- Escenas, personal, locaciones y alertas
- Gráfico de barras por estado de producción, por tipo de alerta y por ambiente (interior/exterior)
- Dona de estados del plan de rodaje y próximos rodajes

---

## 7. Detalles técnicos y correcciones hechas (buenas para responder preguntas)

1. **Bug del menú que no respondía**: un módulo ejecutaba una búsqueda en el DOM antes de que existiera la página (`null`) → rompía toda la cadena de módulos. Se movió la conexión del evento al momento en que la página ya está cargada.
2. **Bug de edición**: el frontend recibía un objeto (producción) y lo destructuraba como si fuera un array → al editar títulos no cargaba el formulario. Se corrigió la forma de leer la respuesta.
3. **Campo `telefono` duplicado** en el script SQL original (estaba en el `CREATE TABLE` y en el `ALTER TABLE`) → se dejó solo en el `ALTER TABLE`.
4. **Fechas en MySQL**: con `dateStrings: true` las fechas llegan como texto `YYYY-MM-DD` sin desfases de zona horaria.
5. **Script SQL reproducible**: se puede borrar la BD y volver a crearla con un solo comando (ideal para probar la entrega).

---

## 8. Guía de exposición (5–7 minutos)

1. **Introducción**: "Sistema web para controlar la producción cinematográfica: quién trabaja, dónde se filma, qué escenas hay, cuándo se rueda y qué alertas se generan".
2. **Base de datos**: mostrar en MySQL las 6 tablas, las llaves foráneas, la vista `v_resumen_produccion` y los datos de ejemplo.
3. **Panel de control**: mostrar KPIs, gráficos y la producción en riesgo de presupuesto.
4. **CRUD completo**: crear una producción, editar su título, eliminarla (y mostrar que el borrado de una escena con plan falla con 409).
5. **Reglas de negocio (lo más vistoso)**:
   - Programar un rodaje → cancelarlo por clima → **mostrar la alerta automática** que apareció.
   - Reprogramar otro rodaje → mostrar la alerta de reprogramación.
6. **Documentación**: abrir la pestaña "Documentación" del sitio, que contiene la teoría del proyecto (fases, requisitos, casos de uso, glosario).
7. **Cierre técnico**: mencionar arquitectura en capas, consultas parametrizadas (seguridad anti-SQL injection) y que todo es JavaScript puro sin frameworks.

---

## 9. Estructura final de archivos

```
basededatos/
├── package.json                    (scripts: npm start / npm run dev)
├── server.js                       (arranque del servidor, puerto 3000)
├── database/control_cinematografico.sql  (script completo de la BD)
├── src/
│   ├── app.js                      (Express + archivos estáticos + rutas)
│   ├── config/db.js                (pool MySQL)
│   ├── utils/http.js               (respuestas ok/fail)
│   ├── routes/   (7 archivos)      ─ rutas REST
│   ├── controllers/ (7 archivos)   ─ lógica y validaciones
│   └── models/   (7 archivos)      ─ consultas SQL
└── public/
    ├── index.html
    ├── pages/    (8 páginas)
    ├── css/      (10 hojas de estilos)
    └── js/       (13 módulos)
```
