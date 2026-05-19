# Colombia Comparte - Dashboard Markov

Sistema profesional de simulación y análisis de cadenas de Márkov aplicadas al comportamiento de usuarios en la plataforma Colombia Comparte.

## 📋 Descripción General

Este proyecto moderniza un análisis académico de cadenas de Márkov convirtiéndolo en una aplicación web empresarial con:

- **38 Estados** modelando diferentes etapas del viaje del usuario
- **60 Recorridos Base** reales registrados del comportamiento de usuarios
- **Simulación Monte Carlo** para predecir patrones de navegación
- **Análisis Diagnóstico** identificando estados críticos
- **Comparación de Escenarios** evaluando mejoras propuestas

## 👥 Equipo Desarrollador

- **Daniel Esteban Alarcón Rojas**
- **Juan Esteban Silva Espejo**
- **Nelson Felipe González Gordillo**

Proyecto Integrador - Simulación Markov Colombia Comparte

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│  React 18 + Vite + TailwindCSS + Recharts + Framer Motion │
│          Corriendo en: http://localhost:5173             │
└────────────────┬────────────────────────────────────────┘
                 │ REST API (Axios)
┌────────────────▼────────────────────────────────────────┐
│                  Backend (FastAPI)                       │
│   FastAPI + Pandas + NumPy + Uvicorn                     │
│          Corriendo en: http://localhost:8000             │
└─────────────────────────────────────────────────────────┘
```

### Stack Backend

- **FastAPI** 0.104.1 - Framework ASGI moderno
- **Pandas** 2.1.3 - Manipulación de matrices y datos
- **NumPy** 1.26.2 - Computación numérica
- **Pydantic** 2.5.0 - Validación de datos
- **Uvicorn** 0.24.0 - Servidor ASGI

### Stack Frontend

- **React** 18+ - Interfaz de usuario
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** 3.3 - Estilos utility-first
- **Recharts** 2.10 - Gráficos interactivos
- **Framer Motion** 10.16 - Animaciones suaves
- **Zustand** 4.4 - State management
- **Axios** 1.6 - HTTP client

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos

- **Python** 3.8+ con `pip`
- **Node.js** 18+ con `npm`
- **Git** (opcional, para clonar el repositorio)

### 1️⃣ Instalación Backend

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2️⃣ Instalación Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install
```

### 3️⃣ Ejecutar la Aplicación

**Terminal 1 - Backend**

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**

```bash
cd frontend
npm run dev
```

### ✅ Verificación

- **Backend API**: http://localhost:8000
  - Documentación OpenAPI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

- **Frontend**: http://localhost:5173
  - Dashboard principal con todas las características

## 📊 Descripción de Características

### Dashboard Principal

- KPI Cards con métricas en tiempo real
- Información del proyecto y estadísticas generales
- Accesos rápidos a todas las secciones

### Estados

- Tabla interactiva de los 38 estados
- Búsqueda y filtrado por código/nombre
- Clasificación por tipos (Inicial, Exploración, Formulario, Pago, Final)
- Indicadores de estados finales

### Recorridos Base

- Visualización de 60 recorridos reales
- Información del perfil de usuario y objetivo
- Resultados (Éxito, Abandono, Error, Seguimiento)
- Secuencia de estados transitados

### Matriz de Transición

- Matriz de Conteos - número de transiciones
- Matriz de Probabilidades - probabilidades normalizadas
- Visualización con mapa de calor (heatmap)
- Navegación entre estados clara

### Simulación

- Parámetros personalizables:
  - Número de usuarios (default: 1000)
  - Máximo de pasos (default: 30)
  - Estado inicial (default: S0)
  - Seed para reproducibilidad
- Resultados detallados de simulaciones

### Gráficos de Análisis

- Distribución de resultados (Pie chart)
- Distribución de pasos (Bar chart)
- Estadísticas descriptivas
- Múltiples vistas interactivas

### Diagnóstico

- Identificación automática del estado crítico
- Tasa de abandono por estado
- Análisis de usuarios afectados
- Recomendaciones de mejora

### Comparación de Escenarios

- Escenario actual vs. escenario mejorado
- Comparación de métricas en gráficos
- Cuantificación de mejoras potenciales
- Impacto en la tasa de éxito

## 🔌 Documentación de API

### Endpoints Principales

#### Estados

```
GET /api/estados
Retorna: Lista de 38 estados con código, nombre, tipo, descripción
```

#### Recorridos

```
GET /api/recorridos
Retorna: Lista de 60 recorridos base con perfil, objetivo, resultado
```

#### Matrices

```
GET /api/matriz/conteos
Retorna: Matriz 38x38 con conteos de transiciones

GET /api/matriz/probabilidades
Retorna: Matriz 38x38 con probabilidades normalizadas
```

#### Simulación

```
POST /api/simular
Body: {
  "num_usuarios": 1000,
  "max_pasos": 30,
  "estado_inicial": "S0",
  "seed": 2026
}
Retorna: Resultados de simulación con conteos y estadísticas
```

#### Diagnóstico

```
POST /api/diagnostico
Body: {
  "num_usuarios": 1000,
  "max_pasos": 30
}
Retorna: Estado crítico, causas, recomendaciones
```

#### Comparación

```
POST /api/comparar-escenarios
Body: {
  "num_usuarios": 1000,
  "max_pasos": 30
}
Retorna: Comparativa de escenarios actual vs mejorado
```

#### Metadata

```
GET /api/metadata
Retorna: Información del proyecto, versión, configuración
```

## 📦 Variables de Entorno

### Backend (.env)

```
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:5173", "https://colombia-comparte.netlify.app"]
```

### Frontend (.env.development)

```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Colombia Comparte Dashboard
```

### Frontend (.env.production)

```
VITE_API_URL=https://colombia-comparte-api.onrender.com
VITE_APP_NAME=Colombia Comparte Dashboard
```

## 🚢 Deployment

### Backend - Render

1. **Crear cuenta en Render** https://render.com

2. **Crear nuevo Web Service**
   - Conectar repositorio GitHub
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

3. **Variables de Entorno**

   ```
   CORS_ORIGINS=["https://colombia-comparte.netlify.app"]
   ```

4. **Deploy** - Render desplegará automáticamente en push

### Frontend - Netlify

1. **Crear cuenta en Netlify** https://netlify.com

2. **Conectar GitHub**
   - New Site from Git
   - Seleccionar repositorio

3. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Environment Variables**

   ```
   VITE_API_URL=https://colombia-comparte-api.onrender.com
   ```

5. **Deploy** - Netlify desplegará automáticamente

### URLs Finales

- **Frontend**: https://colombia-comparte.netlify.app
- **Backend API**: https://colombia-comparte-api.onrender.com
- **Docs API**: https://colombia-comparte-api.onrender.com/docs

## 📁 Estructura del Proyecto

```
colombia-comparte-dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Aplicación FastAPI
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py          # Pydantic models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── markov.py           # Motor de simulación
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── simulator.py        # Endpoints
│   ├── requirements.txt            # Dependencias Python
│   ├── .env                        # Variables de entorno
│   └── Dockerfile                  # Configuración Docker
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Componente principal
│   │   ├── main.jsx                # Punto de entrada
│   │   ├── index.css               # Estilos globales
│   │   ├── store.js                # Zustand state management
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── KPICard.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Estados.jsx
│   │       ├── Recorridos.jsx
│   │       ├── MatrizTransicion.jsx
│   │       ├── Simulacion.jsx
│   │       ├── Graficos.jsx
│   │       ├── Diagnostico.jsx
│   │       └── ComparisonEscenarios.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── netlify.toml
│   └── index.html
│
├── .gitignore
└── README.md
```

## 🔐 Características de Seguridad

- CORS configurado para dominios específicos en producción
- Validación con Pydantic en todas las entradas
- Separación de concerns entre frontend y backend
- Variables sensibles en archivos .env no versionados

## 📈 Métricas y KPIs

El dashboard monitorea:

- **Total de Estados**: 38
- **Total de Recorridos Base**: 60
- **Estados Finales**: 4 (S34, S35, S36, S37)
- **Tasa de Éxito**: Calculada en tiempo real
- **Abandono por Estado**: Identificación automática
- **Comparación de Escenarios**: Mejora potencial

## 🐛 Troubleshooting

### El backend no conecta

```
Error: Connection refused
Solución: Verificar que el backend esté corriendo en terminal separada
```

### CORS errors

```
Error: Access to XMLHttpRequest blocked
Solución: Verificar CORS_ORIGINS en backend/.env
```

### Puerto ya en uso

```
Error: Port 8000 already in use
Solución: Cambiar puerto: uvicorn app.main:app --port 8001
```

### Dependencias faltantes

```
Error: ModuleNotFoundError
Solución: pip install -r requirements.txt (con entorno virtual activado)
```

## 📚 Recursos Adicionales

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Render Deployment](https://render.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

## 📝 Licencia

Proyecto Integrador - Universidad Santo Tomas

## 📞 Soporte

Para preguntas o problemas, contactar a los desarrolladores del proyecto:

- Daniel Esteban Alarcón Rojas
- Juan Esteban Silva Espejo
- Nelson Felipe González Gordillo

---

**Versión**: 1.0.0  
**Última actualización**: 2026  
**Estado**: Producción
