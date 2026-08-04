-- ============================================================
-- PROYECTO 9: SISTEMA DE CONTROL DE PRODUCCIÓN CINEMATOGRÁFICA
-- Base de datos: control_cinematografico
-- Autor: Aprendiz Análisis y Desarrollo de Software - SENA
-- ============================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS control_cinematografico
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE control_cinematografico;

-- ============================================================
-- OPCIONAL: USUARIO DE CONEXIÓN PARA LA APLICACIÓN
-- (Ejecutar solo si el usuario no existe todavía)
-- ============================================================
-- CREATE USER IF NOT EXISTS 'julian'@'localhost' IDENTIFIED BY '1097102856';
-- GRANT ALL PRIVILEGES ON control_cinematografico.* TO 'julian'@'localhost';
-- FLUSH PRIVILEGES;

-- 2. TABLA: Produccion
CREATE TABLE IF NOT EXISTS Produccion (
    id_produccion INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Preproduccion',
    presupuesto_total DECIMAL(12,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin_estimada DATE
) ENGINE=InnoDB;

-- 3. TABLA: Personal
CREATE TABLE IF NOT EXISTS Personal (
    id_personal INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pais_origen VARCHAR(50)
) ENGINE=InnoDB;

-- 4. TABLA: Locacion
CREATE TABLE IF NOT EXISTS Locacion (
    id_locacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    pais VARCHAR(50) NOT NULL,
    costo_diario DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB;

-- 5. TABLA: Escena
CREATE TABLE IF NOT EXISTS Escena (
    id_escena INT AUTO_INCREMENT PRIMARY KEY,
    id_produccion INT NOT NULL,
    id_locacion INT,
    numero_escena INT NOT NULL,
    descripcion TEXT,
    tipo_ambiente ENUM('Interior', 'Exterior') NOT NULL,
    clima_requerido VARCHAR(50) DEFAULT 'Indiferente',
    CONSTRAINT fk_escena_produccion FOREIGN KEY (id_produccion)
        REFERENCES Produccion(id_produccion) ON DELETE CASCADE,
    CONSTRAINT fk_escena_locacion FOREIGN KEY (id_locacion)
        REFERENCES Locacion(id_locacion) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. TABLA: Plan_Rodaje (Cronograma)
CREATE TABLE IF NOT EXISTS Plan_Rodaje (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    id_escena INT NOT NULL,
    fecha_rodaje DATE NOT NULL,
    estado_rodaje ENUM('Programado', 'Completado', 'Cancelado_Clima', 'Reprogramado') DEFAULT 'Programado',
    CONSTRAINT fk_plan_escena FOREIGN KEY (id_escena)
        REFERENCES Escena(id_escena) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TABLA: Alerta
CREATE TABLE IF NOT EXISTS Alerta (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    id_produccion INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_produccion FOREIGN KEY (id_produccion)
        REFERENCES Produccion(id_produccion) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- USO DE ALTER TABLE (Requisito de la guía)
-- ============================================================

-- Agregar campo de teléfono de emergencia al personal
ALTER TABLE Personal
    ADD COLUMN telefono VARCHAR(20) AFTER email;

-- Agregar un índice de rendimiento para acelerar búsquedas de escenas por tipo de ambiente
CREATE INDEX idx_tipo_ambiente ON Escena (tipo_ambiente);

-- ============================================================
-- INSERCIÓN DE REGISTROS DE PRUEBA (INSERT INTO)
-- ============================================================

-- Producciones
INSERT INTO Produccion (titulo, estado, presupuesto_total, fecha_inicio, fecha_fin_estimada) VALUES
('El Misterio de los Andes',     'Rodaje',        1500000.00, '2026-03-01', '2026-11-30'),
('Ciudad de Niebla',             'Preproduccion', 2200000.00, '2026-05-15', '2027-03-10'),
('El Último Faro',               'Postproduccion',1800000.00, '2025-10-01', '2026-06-30'),
('Ritmos del Caribe',            'Preproduccion',  950000.00, '2026-07-01', '2026-12-20'),
('La Sombra del Volcán',         'Rodaje',        3100000.00, '2026-02-10', '2027-01-15'),
('Vientos de Patagonia',         'Distribucion',  1200000.00, '2025-08-15', '2026-05-30'),
('Luces de Medianoche',          'Preproduccion',  600000.00, '2026-09-01', '2027-02-28'),
('Medianoche en el Estudio',     'Preproduccion',    2500.00, '2026-11-01', '2026-12-15');

-- Personal (equipos artístico y técnico)
INSERT INTO Personal (nombre, rol, email, telefono, pais_origen) VALUES
('Guillermo del Toro',   'Director',               'guillermo@cine.com',  '+525551234567',  'México'),
('Isabel Valverde',      'Productora',             'isabel@cine.com',     '+34912345678',   'España'),
('Marco Riquelme',       'Guionista',              'marco@cine.com',      '+56223456789',   'Chile'),
('Aiko Tanaka',          'Directora de Fotografía','aiko@cine.com',       '+81312345678',   'Japón'),
('Carlos Mendoza',       'Director de Sonido',     'carlos@cine.com',     '+573001234567',  'Colombia'),
('Lucía Fernández',      'Editora',                'lucia@cine.com',      '+541123456789',  'Argentina'),
('Diego Ramírez',        'Productor Ejecutivo',    'diego@cine.com',      '+525598765432',  'México'),
('Camila Rojas',         'Asistente de Dirección', 'camila@cine.com',     '+56987654321',   'Chile'),
('Mateo Cruz',           'Actor Principal',        'mateo@cine.com',      '+571234567890',  'Colombia'),
('Valentina Paz',        'Actriz Principal',       'valentina@cine.com',  '+51123456789',   'Perú'),
('Samuel Ocampo',        'Técnico de Cámara',      'samuel@cine.com',     '+573019876543',  'Colombia'),
('Elena Giraldo',        'Maquillaje',             'elena@cine.com',      '+57512345678',   'Colombia');

-- Locaciones
INSERT INTO Locacion (nombre, direccion, pais, costo_diario) VALUES
('Valle Nevado',            'Sector Cordillera Km 12',        'Chile',     2500.00),
('Centro Histórico',        'Plaza Mayor, Zona Colonial',     'México',    1800.00),
('Faro de Punta Brava',     'Calle del Faro s/n',             'España',    3200.00),
('Playa Bocagrande',        'Av. Primera, Cartagena',         'Colombia',  1500.00),
('Volcán de Fuego',         'Ruta al cráter, Antigua',        'Guatemala', 2000.00),
('Glaciar Perito Moreno',   'Parque Nacional, Santa Cruz',    'Argentina', 2800.00),
('Estudio del Sur',         'Avenida 68 No. 12-34',           'Colombia',  1200.00),
('Callejón de las Artes',   'Barrio La Merced',               'Perú',       900.00);

-- Escenas
INSERT INTO Escena (id_produccion, id_locacion, numero_escena, descripcion, tipo_ambiente, clima_requerido) VALUES
(1, 1, 12, 'Encuentro en la cumbre nevada',             'Exterior', 'Despejado'),
(1, 1, 13, 'Tormenta de nieve sobre el refugio',        'Exterior', 'Nevada'),
(1, 7,  5, 'Diálogo en la sala de edición',             'Interior', 'Indiferente'),
(2, 2,  1, 'Persecución por la plaza mayor',            'Exterior', 'Lluvia'),
(2, 7,  2, 'Reunión del equipo de preproducción',       'Interior', 'Indiferente'),
(3, 3,  8, 'El guardafaros en la tormenta',             'Exterior', 'Tormenta'),
(4, 4,  3, 'Baile tradicional en la playa',             'Exterior', 'Soleado'),
(5, 5,  7, 'Escalada hacia la cima',                    'Exterior', 'Despejado'),
(5, 7,  9, 'Interrogatorio en el laboratorio',          'Interior', 'Indiferente'),
(6, 6,  2, 'Exploración del glaciar',                   'Exterior', 'Despejado'),
(7, 8,  4, 'Encuentro nocturno en el callejón',         'Exterior', 'Nublado'),
(7, 7,  1, 'Escena de apertura en estudio',             'Interior', 'Indiferente'),
(8, 7,  1, 'Prueba de luces en estudio',                'Interior', 'Indiferente'),
(8, 8,  2, 'Persecución por el callejón',               'Exterior', 'Nublado');

-- Plan de Rodaje (Cronograma)
INSERT INTO Plan_Rodaje (id_escena, fecha_rodaje, estado_rodaje) VALUES
(1,  '2026-08-15', 'Programado'),
(2,  '2026-08-18', 'Cancelado_Clima'),
(3,  '2026-07-20', 'Completado'),
(4,  '2026-09-02', 'Programado'),
(5,  '2026-06-10', 'Completado'),
(6,  '2026-04-05', 'Reprogramado'),
(7,  '2026-08-22', 'Programado'),
(8,  '2026-06-15', 'Cancelado_Clima'),
(10, '2026-03-12', 'Completado'),
(11, '2026-10-01', 'Programado');

-- Alertas
INSERT INTO Alerta (id_produccion, tipo, mensaje) VALUES
(1, 'Clima Adverso',   'Alerta de nevada intensa para la fecha de rodaje de la Escena 12.'),
(1, 'Clima Adverso',   'Nevada intensa: rodaje de la Escena 13 cancelado. Se recomienda reprogramar.'),
(5, 'Clima Adverso',   'Vientos fuertes en el volcán impidieron el rodaje de la Escena 7.'),
(3, 'Reprogramacion',  'La Escena 8 se reprogramó por tormenta eléctrica.'),
(6, 'Presupuesto',     'El costo de locaciones de Vientos de Patagonia supera el 85% del presupuesto.'),
(2, 'Plan de Rodaje',  'Se aprobó el cronograma de rodaje de Ciudad de Niebla.');

-- ============================================================
-- VISTA: Resumen de producciones con indicadores
-- ============================================================
CREATE OR REPLACE VIEW v_resumen_produccion AS
SELECT
    p.id_produccion,
    p.titulo,
    p.estado,
    p.presupuesto_total,
    p.fecha_inicio,
    p.fecha_fin_estimada,
    COUNT(DISTINCT e.id_escena) AS total_escenas,
    COUNT(DISTINCT pr.id_plan)   AS total_planes,
    COUNT(DISTINCT a.id_alerta)  AS total_alertas,
    COALESCE(SUM(DISTINCT l.costo_diario), 0) AS costo_locaciones
FROM Produccion p
LEFT JOIN Escena e  ON e.id_produccion = p.id_produccion
LEFT JOIN Plan_Rodaje pr ON pr.id_escena = e.id_escena
LEFT JOIN Alerta a ON a.id_produccion = p.id_produccion
LEFT JOIN Locacion l ON l.id_locacion = e.id_locacion
GROUP BY p.id_produccion;
