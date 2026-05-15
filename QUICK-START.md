# Guía Paso a Paso - Instalación y Ejecución

Este documento te guía a través de cada paso para ejecutar Colombia Comparte Dashboard.

## ⏱️ Tiempo Estimado: 10-15 minutos

## 📋 Checklist Previo

- [ ] Python 3.8+ instalado (`python --version`)
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm 9+ instalado (`npm --version`)
- [ ] Git instalado (opcional)
- [ ] Editor de código (VS Code recomendado)
- [ ] Una terminal/cmd disponible

---

## PASO 1: Clonar o Descargar el Proyecto

```bash
# Opción 1: Clonar con Git
git clone <URL-DEL-REPOSITORIO>
cd colombia-comparte-dashboard

# Opción 2: Descargar ZIP y extraer
# Luego navegar a la carpeta del proyecto
```

---

## PASO 2: Preparar el Backend

### 2.1 - Abrir terminal en la carpeta backend

```bash
cd backend
```

### 2.2 - Crear entorno virtual

**En Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

**En macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

✅ Verifica que tengas `(venv)` al inicio de la línea en la terminal

### 2.3 - Instalar dependencias

```bash
pip install -r requirements.txt
```

Esto instalará:

- FastAPI
- Pandas
- NumPy
- Uvicorn
- Y otras librerías necesarias

⏱️ **Esto puede tomar 2-3 minutos**

---

## PASO 3: Preparar el Frontend

### 3.1 - Abrir nueva terminal en la carpeta frontend

```bash
cd frontend
```

### 3.2 - Instalar dependencias

```bash
npm install
```

Esto instalará:

- React
- Vite
- TailwindCSS
- Recharts
- Y otras librerías necesarias

⏱️ **Esto puede tomar 3-5 minutos**

---

## PASO 4: Ejecutar el Backend

### 4.1 - En la terminal del backend (con venv activado)

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Verás algo como:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
```

### 4.2 - Verificar que el backend funciona

Abre tu navegador y ve a:

- http://localhost:8000 - Bienvenida
- http://localhost:8000/docs - Documentación interactiva de API
- http://localhost:8000/redoc - Documentación alternativa

---

## PASO 5: Ejecutar el Frontend

### 5.1 - En la nueva terminal del frontend

```bash
npm run dev
```

✅ Verás algo como:

```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 5.2 - El navegador se abrirá automáticamente

Si no, abre manualmente: http://localhost:5173

---

## ✨ ¡Listo! Ahora puedes usar la aplicación

### 📊 Funcionalidades Disponibles:

1. **Dashboard** - Vista general del proyecto
2. **Estados** - Tabla de 38 estados
3. **Recorridos** - Lista de 60 recorridos base
4. **Matriz** - Matriz de transición
5. **Simulación** - Ejecutar simulaciones
6. **Gráficos** - Visualizaciones de datos
7. **Diagnóstico** - Análisis de estados críticos
8. **Escenarios** - Comparación de mejoras

---

## 🔧 Comandos Útiles

### Backend

```bash
# Detener servidor: CTRL + C

# Reiniciar servidor
# Presiona CTRL + C y vuelve a ejecutar

# Desactivar entorno virtual
deactivate

# Activar entorno virtual nuevamente
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### Frontend

```bash
# Detener servidor: CTRL + C

# Reconstruir node_modules
rm -rf node_modules package-lock.json
npm install

# Build para producción
npm run build

# Ver build localmente
npm run preview
```

---

## 📱 Accesos Principales

Mientras la app está corriendo:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

---

## ⚠️ Problemas Comunes y Soluciones

### ❌ Error: "Port 8000 already in use"

```bash
# Cambiar puerto del backend
python -m uvicorn app.main:app --reload --port 8001
```

### ❌ Error: "Module not found"

```bash
# Backend: Asegúrate que el venv está activado y reinstala
pip install -r requirements.txt

# Frontend: Reinstala node_modules
npm install
```

### ❌ Error: "CORS error"

- Asegúrate que el backend esté corriendo en el puerto 8000
- Verifica en http://localhost:8000/docs

### ❌ El navegador no abre automáticamente

- Abre manualmente: http://localhost:5173

### ❌ Error: "npm not found"

- Instala Node.js desde https://nodejs.org/

---

## 🎓 Próximos Pasos

Una vez que todo funcione:

1. **Explorar el Dashboard**
   - Visualiza los KPIs
   - Navega por las diferentes secciones

2. **Ejecutar una Simulación**
   - Ve a la sección "Simulación"
   - Cambia los parámetros
   - Ejecuta una simulación

3. **Ver un Diagnóstico**
   - Ve a "Diagnóstico"
   - Identifica estados críticos

4. **Comparar Escenarios**
   - Ve a "Escenarios"
   - Ve el impacto potencial de mejoras

---

## 🚀 Deployment (Opcional)

Cuando quieras desplegar a producción:

### Backend en Render

1. Pushea a GitHub
2. Crea cuenta en Render.com
3. Conecta el repositorio
4. Deploy automático

### Frontend en Netlify

1. Pushea a GitHub
2. Crea cuenta en Netlify.com
3. Conecta el repositorio
4. Deploy automático

Ver README.md para instrucciones detalladas.

---

## 📚 Documentación Completa

Para más información, ver:

- `README.md` - Documentación general
- `backend/requirements.txt` - Dependencias Python
- `frontend/package.json` - Dependencias Node

---

## 💡 Tips Útiles

- Mantén ambas terminales (backend y frontend) abiertas
- Los cambios en código se recargan automáticamente
- Usa las DevTools del navegador (F12) para debugging
- Revisa la consola de terminal para errores

---

¡Ahora estás listo para desarrollar y explorar Colombia Comparte Dashboard! 🎉
