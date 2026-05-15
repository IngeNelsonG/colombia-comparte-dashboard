# Arquitectura del Proyecto

## 🏗️ Diseño General

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                     │
│                    Port: localhost:5173                          │
│  - UI Components con TailwindCSS                                 │
│  - State Management con Zustand                                  │
│  - Gráficos con Recharts                                         │
│  - Animaciones con Framer Motion                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ REST API (JSON)
                 │ Axios HTTP Client
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                  Backend (FastAPI + Python)                      │
│                    Port: localhost:8000                          │
│  - 8 Endpoints REST API                                          │
│  - Motor Markov con Pandas/NumPy                                 │
│  - Validación con Pydantic                                       │
│  - Documentación OpenAPI automática                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura Backend

```
backend/
├── app/
│   ├── main.py
│   │   └── Aplicación FastAPI
│   │   └── Middleware CORS
│   │   └── Punto de entrada
│   │
│   ├── models/
│   │   └── schemas.py
│   │       ├── ResultadoEnum: Éxito, Abandono, Error, Seguimiento
│   │       ├── TipoEstadoEnum: 17 categorías
│   │       ├── Estado: código, nombre, tipo, descripción, is_final
│   │       ├── Recorrido: journey con pasos y resultado
│   │       ├── SimulacionRequest: parámetros de entrada
│   │       ├── MatrizTransicion: matriz + lista estados
│   │       └── DiagnosticoResponse: estado crítico + análisis
│   │
│   ├── services/
│   │   └── markov.py
│   │       ├── MarkovSimulator Class
│   │       │   ├── ESTADOS: array 38 códigos
│   │       │   ├── RECORRIDOS_DATOS: 60 journeys
│   │       │   ├── MAPA_RESULTADOS: mapeo final states
│   │       │   │
│   │       │   ├── __init__()
│   │       │   ├── _build_matrices(): construye matrices
│   │       │   ├── simular_usuario(): 1 usuario
│   │       │   ├── simular_usuarios(): N usuarios
│   │       │   ├── obtener_recorridos_frecuentes()
│   │       │   ├── identificar_estado_critico()
│   │       │   ├── calcular_diagnostico()
│   │       │   └── construir_matriz_mejorada()
│   │
│   └── routes/
│       └── simulator.py
│           ├── GET /api/estados
│           ├── GET /api/recorridos
│           ├── GET /api/matriz/conteos
│           ├── GET /api/matriz/probabilidades
│           ├── POST /api/simular
│           ├── POST /api/diagnostico
│           ├── POST /api/comparar-escenarios
│           ├── GET /api/metadata
│           └── GET /api/health
│
├── requirements.txt
├── .env
├── Dockerfile
└── main.py (entry point)
```

## 📁 Estructura Frontend

```
frontend/
├── src/
│   ├── App.jsx
│   │   └── Componente raíz
│   │   └── Router de páginas
│   │   └── Loading state
│   │
│   ├── main.jsx
│   │   └── Punto de entrada React
│   │
│   ├── index.css
│   │   └── Estilos globales TailwindCSS
│   │
│   ├── store.js
│   │   ├── useSimulationStore (Zustand)
│   │   │   ├── numUsuarios
│   │   │   ├── maxPasos
│   │   │   └── estado_inicial
│   │   └── useUIStore
│   │       ├── sidebarOpen
│   │       └── darkMode
│   │
│   ├── services/
│   │   └── api.js
│   │       ├── axios instance
│   │       └── apiService methods
│   │           ├── getEstados()
│   │           ├── getRecorridos()
│   │           ├── getMatrizConteos()
│   │           ├── getMatrizProbabilidades()
│   │           ├── simular()
│   │           ├── getDiagnostico()
│   │           └── compararEscenarios()
│   │
│   ├── components/
│   │   ├── Layout.jsx
│   │   │   └── Contenedor principal
│   │   ├── Sidebar.jsx
│   │   │   └── Navegación lateral
│   │   ├── Header.jsx
│   │   │   └── Barra superior
│   │   └── KPICard.jsx
│   │       └── Métrica individual
│   │
│   └── pages/
│       ├── Dashboard.jsx
│       │   └── Vista principal
│       ├── Estados.jsx
│       │   └── Tabla 38 estados
│       ├── Recorridos.jsx
│       │   └── Tabla 60 recorridos
│       ├── MatrizTransicion.jsx
│       │   └── Matriz 38x38
│       ├── Simulacion.jsx
│       │   └── Formulario + resultados
│       ├── Graficos.jsx
│       │   └── Recharts visualizations
│       ├── Diagnostico.jsx
│       │   └── Análisis estado crítico
│       └── ComparisonEscenarios.jsx
│           └── Actual vs mejorado
│
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .env.development
├── .env.production
├── netlify.toml
├── index.html
└── public/
```

## 🔄 Flujo de Datos

### Flujo 1: Listar Estados

```
Frontend (Page: Estados.jsx)
  ↓
  useEffect → apiService.getEstados()
  ↓
  Axios GET http://localhost:8000/api/estados
  ↓
Backend (routes/simulator.py)
  ↓
  MarkovSimulator.get_estados()
  ↓
  Retorna: Pydantic Estado[] objects
  ↓
JSON Response → setEstados(data)
  ↓
Render table con 38 estados
```

### Flujo 2: Ejecutar Simulación

```
Frontend (Page: Simulacion.jsx)
  ↓
User selecciona parámetros:
  - num_usuarios: 1000
  - max_pasos: 30
  - estado_inicial: S0
  - seed: 2026
  ↓
handleSimular() → apiService.simular(params)
  ↓
POST /api/simular
Body: {
  "num_usuarios": 1000,
  "max_pasos": 30,
  "estado_inicial": "S0",
  "seed": 2026
}
  ↓
Backend: MarkovSimulator.simular_usuarios()
  ↓
  For i in range(1000):
    - Generar journey aleatorio
    - Contar resultados
  ↓
Retorna: SimulacionResponse
  {
    "usuarios_exitosos": 658,
    "usuarios_abandono": 242,
    "num_recorridos": 1000,
    "promedio_pasos": 8.5
  }
  ↓
setResultado(data)
  ↓
Mostrar resultados en cards
```

### Flujo 3: Análisis Diagnóstico

```
Frontend (Page: Diagnostico.jsx)
  ↓
handleAnalizar() → apiService.getDiagnostico(params)
  ↓
POST /api/diagnostico
  ↓
Backend: MarkovSimulator.calcular_diagnostico()
  ↓
  1. Simular usuarios
  2. Identificar estado crítico
  3. Calcular prob. abandono
  4. Generar recomendaciones
  ↓
Retorna: DiagnosticoResponse
  {
    "estado_critico": "S15",
    "nombre_estado": "Confirmación Pago",
    "prob_abandono": 0.435,
    "usuarios_afectados": 435,
    "causa": "...",
    "mejora": "..."
  }
  ↓
setDiagnostico(data)
  ↓
Render state crítico con análisis
```

## 🎨 Componentes React - Jerarquía

```
<App>
  ├── <Layout>
  │   ├── <Sidebar>
  │   │   └── [Menu Items]
  │   ├── <Header>
  │   └── <main>
  │       └── <CurrentPage>
  │
  ├── <Dashboard>
  │   ├── <KPICard> x4
  │   └── [Info Cards]
  │
  ├── <Estados>
  │   ├── [Search]
  │   ├── [Table]
  │   └── [Stats]
  │
  ├── <Simulacion>
  │   ├── [Input Form]
  │   └── [Results Cards]
  │
  ├── <Graficos>
  │   ├── <PieChart>
  │   ├── <BarChart>
  │   └── [Stats]
  │
  └── [Other Pages...]
```

## 📊 Datos Principales

### Estados (38 total)

```
S0: Inicial (Entrada)
S1-S13: Exploración (Navegación inicial)
S14-S20: Formularios (Datos de usuario)
S21-S33: Flujos específicos (Búsqueda, Compra, etc.)
S34: Final - Éxito
S35: Final - Abandono
S36: Final - Error
S37: Final - Seguimiento
```

### Recorridos Base (60 journeys)

```
Cada recorrido contiene:
- ID: Identificador único
- Profile: Tipo de usuario
- Objective: Objetivo del usuario
- States: Secuencia de estados [S0, S1, S2, ...]
- Result: Resultado final (Éxito/Abandono/Error)
- num_pasos: Número de transiciones
```

### Matriz de Transición (38x38)

```
[i][j] = Número de transiciones de estado i → estado j

Ejemplo:
  S0  S1  S2  ...
S0 [0, 100, 0, ...]
S1 [0,  0, 95, ...]
...

Usada para:
1. Calcular probabilidades
2. Simular journeys aleatorios
3. Análisis de patrones
```

## 🔌 API Endpoints

```
GET  /api/estados                 → Estado[]
GET  /api/recorridos              → Recorrido[]
GET  /api/matriz/conteos          → MatrizTransicion
GET  /api/matriz/probabilidades   → MatrizTransicion
POST /api/simular                 → SimulacionResponse
POST /api/diagnostico             → DiagnosticoResponse
POST /api/comparar-escenarios     → ComparisonResponse
GET  /api/metadata                → Metadata
GET  /api/health                  → {"status": "ok"}
```

## 🔐 Seguridad

- **CORS**: Configurado para dominios específicos
- **Validación**: Todas las entradas validadas con Pydantic
- **Tipos**: TypeScript-like typing en Python
- **Sanitización**: Inputs filtrados antes de procesar

## ⚡ Performance

- **Frontend**:
  - Code splitting con Vite
  - Lazy loading de páginas
  - Memoization en componentes
- **Backend**:
  - Matrices pre-calculadas
  - Simulación vectorizada con NumPy
  - Caching de datos estáticos

## 📈 Escalabilidad

### Futuras Mejoras:

1. Base de datos para histórico de simulaciones
2. Autenticación de usuarios
3. Exportación a PDF/Excel
4. Gráficos interactivos avanzados
5. WebSockets para actualizaciones en tiempo real
6. CI/CD pipelines
7. Tests unitarios e integración
