# 🏋️‍♂️ Aurum Fitness - Backend API (Express + TypeScript)

API RESTful para la plataforma Aurum Fitness, desarrollada con Express y TypeScript bajo una arquitectura modular por capas.

## 🚀 Tecnologías
- **Node.js** & **Express**
- **TypeScript** (Strict mode)
- **Helmet** & **CORS** (Seguridad)
- **Morgan** (Logging)
- **Zod** (Validación de esquemas)
- **TSX** (Ejecución y Hot reload en desarrollo)

## 📁 Estructura
```text
src/
├── config/         # Variables de entorno y ajustes
├── controllers/    # Controladores HTTP
├── middlewares/    # Manejo global de errores y seguridad
├── models/         # Modelos de datos
├── routes/         # Definición de rutas REST
├── services/       # Lógica de negocio desacoplada
├── types/          # Tipos e interfaces de dominio
├── utils/          # Formateador uniforme de respuestas API
├── app.ts          # Configuración de Express
└── server.ts       # Punto de entrada HTTP
```

## 🛠️ Instalación y Uso
```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar bundle de producción
npm start
```

## 📡 Endpoints Principales
- `GET /api/health` - Estado del servicio
- `GET /api/workouts` - Catálogo de rutinas
- `GET /api/workouts/:id` - Detalle de rutina
- `POST /api/workouts` - Crear nueva rutina
