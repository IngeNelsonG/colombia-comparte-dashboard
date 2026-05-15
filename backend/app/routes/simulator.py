from fastapi import APIRouter, HTTPException, Query
from app.services.markov import (
    simulator, ESTADOS, NOMBRES_ESTADOS, TIPOS_ESTADOS, ESTADOS_FINALES,
    RECORRIDOS_DATOS, COLORES, MAPA_RESULTADOS
)
from app.models.schemas import (
    Estado, Recorrido, SimulacionRequest, SimulacionResponse,
    MatrizTransicion, DiagnosticoResponse, ComparisonRequest, ComparisonResponse
)
from typing import List, Dict

router = APIRouter(prefix="/api", tags=["simulador"])


@router.get("/estados", response_model=List[Estado])
async def get_estados():
    """Obtiene todos los estados del sistema"""
    return [
        Estado(
            codigo=codigo,
            nombre=NOMBRES_ESTADOS[codigo],
            descripcion=NOMBRES_ESTADOS[codigo],
            tipo=TIPOS_ESTADOS[codigo],
            es_final=codigo in ESTADOS_FINALES
        )
        for codigo in ESTADOS
    ]


@router.get("/recorridos", response_model=List[Dict])
async def get_recorridos():
    """Obtiene todos los recorridos base (60 recorridos del proyecto)"""
    recorridos = []
    for idx, datos in enumerate(RECORRIDOS_DATOS):
        recorridos.append({
            "id": f"R{idx+1:02d}",
            "perfil": datos["perfil"],
            "objetivo": datos["objetivo"],
            "recorrido": " → ".join(datos["recorrido"]),
            "estados": datos["recorrido"],
            "resultado": MAPA_RESULTADOS.get(datos["recorrido"][-1], "Desconocido"),
            "num_pasos": len(datos["recorrido"])
        })
    return recorridos


@router.get("/matriz/conteos", response_model=MatrizTransicion)
async def get_matriz_conteos():
    """Obtiene la matriz de conteos"""
    matriz, estados = simulator.get_matriz_conteos()
    return MatrizTransicion(
        matriz=matriz,
        estados=estados,
        tipo="conteos"
    )


@router.get("/matriz/probabilidades", response_model=MatrizTransicion)
async def get_matriz_probabilidades():
    """Obtiene la matriz de probabilidades"""
    matriz, estados = simulator.get_matriz_probabilidades()
    return MatrizTransicion(
        matriz=matriz,
        estados=estados,
        tipo="probabilidades"
    )


@router.post("/simular", response_model=SimulacionResponse)
async def simular_usuarios(request: SimulacionRequest = SimulacionRequest()):
    """Simula N usuarios navegando por la plataforma"""
    try:
        recorridos, stats = simulator.simular_usuarios(
            n=request.num_usuarios,
            seed=request.seed,
            estado_inicial=request.estado_inicial,
            max_pasos=request.max_pasos
        )
        
        # Convertir a strings para serialización
        recorridos_str = [['→'.join(r) for r in [recorrido]][0] for recorrido in recorridos]
        recorridos_list = [[str(e) for e in r] for r in recorridos]
        
        # Obtener recorridos frecuentes
        recorridos_frecuentes = simulator.obtener_recorridos_frecuentes(recorridos, top_n=10)

        return SimulacionResponse(
            usuarios=request.num_usuarios,
            recorridos=recorridos_list,
            resultados_count=stats['resultados_count'],
            resultados_porcentaje=stats['resultados_porcentaje'],
            promedio_pasos=stats['promedio_pasos'],
            recorridos_frecuentes=recorridos_frecuentes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en simulación: {str(e)}")


@router.post("/diagnostico", response_model=DiagnosticoResponse)
async def get_diagnostico(request: SimulacionRequest = SimulacionRequest()):
    """Calcula el diagnóstico del estado crítico basado en simulación"""
    try:
        recorridos, _ = simulator.simular_usuarios(
            n=request.num_usuarios,
            seed=request.seed,
            estado_inicial=request.estado_inicial,
            max_pasos=request.max_pasos
        )
        
        diagnostico = simulator.calcular_diagnostico(recorridos)
        
        if not diagnostico:
            raise HTTPException(status_code=400, detail="No se pudo calcular el diagnóstico")
        
        # Generar recomendación basada en el estado
        estado = diagnostico['estado_critico']
        causa = _generar_causa(estado)
        mejora = _generar_mejora(estado)
        
        return DiagnosticoResponse(
            estado_critico=diagnostico['estado_critico'],
            nombre_estado=diagnostico['nombre_estado'],
            probabilidad_abandono=diagnostico['prob_abandono'],
            cantidad_abandonos=diagnostico['cantidad_abandonos'],
            porcentaje_abandono=diagnostico['porcentaje_abandono'],
            causa=causa,
            mejora=mejora,
            indicador=f"Tasa de avance desde {estado}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en diagnóstico: {str(e)}")


@router.post("/comparar-escenarios", response_model=ComparisonResponse)
async def comparar_escenarios(request: ComparisonRequest):
    """Compara simulación actual vs mejorada"""
    try:
        # Simulación actual
        recorridos_actual, stats_actual = simulator.simular_usuarios(n=1000, seed=2026)
        
        # Matriz mejorada
        matriz_mejorada = simulator.construir_matriz_mejorada(
            request.estado_critico,
            request.reduccion_abandono
        )
        
        # Simulación con matriz mejorada
        recorridos_mejorado, stats_mejorado = simulator.simular_con_matriz_mejorada(
            matriz_mejorada,
            n=1000,
            seed=2026
        )
        
        cambios = {
            resultado: (stats_mejorado['resultados_porcentaje'].get(resultado, 0) - 
                        stats_actual['resultados_porcentaje'].get(resultado, 0))
            for resultado in ['Éxito', 'Abandono', 'Error', 'Seguimiento pendiente']
        }
        
        return ComparisonResponse(
            simulacion_actual=stats_actual['resultados_porcentaje'],
            simulacion_mejorada=stats_mejorado['resultados_porcentaje'],
            cambios=cambios,
            promedio_pasos_actual=stats_actual['promedio_pasos'],
            promedio_pasos_mejorado=stats_mejorado['promedio_pasos']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en comparación: {str(e)}")


@router.get("/metadata")
async def get_metadata():
    """Obtiene metadatos del proyecto"""
    return {
        "nombre_proyecto": "Colombia Comparte - Simulación Markov",
        "total_estados": len(ESTADOS),
        "total_recorridos": len(RECORRIDOS_DATOS),
        "estados_finales": ESTADOS_FINALES,
        "mapa_resultados": MAPA_RESULTADOS,
        "colores": COLORES,
        "autores": "Daniel Esteban Alarcón Rojas, Juan Esteban Silva Espejo, Nelson Felipe González Gordillo"
    }


@router.get("/health")
async def health():
    """Health check del servidor"""
    return {"status": "ok", "version": "1.0.0"}


def _generar_causa(estado: str) -> str:
    """Genera causa de abandono según el estado"""
    texto_estado = NOMBRES_ESTADOS.get(estado, "").lower()
    
    if "formulario" in texto_estado:
        return "El usuario podría estar encontrando un formulario largo, confuso o con demasiados campos."
    elif "pago" in texto_estado:
        return "El usuario podría desconfiar del proceso de pago o encontrar errores técnicos."
    elif "sesión" in texto_estado or "login" in texto_estado:
        return "El inicio de sesión o registro puede estar agregando fricción al recorrido."
    elif "información" in texto_estado:
        return "El usuario revisa información pero no encuentra una acción clara para continuar."
    elif "horario" in texto_estado or "opción" in texto_estado:
        return "El usuario podría no encontrar opciones convenientes o la información no es clara."
    else:
        return "El usuario podría estar encontrando fricción o falta de claridad en este punto del recorrido."


def _generar_mejora(estado: str) -> str:
    """Genera mejora recomendada según el estado"""
    texto_estado = NOMBRES_ESTADOS.get(estado, "").lower()
    
    if "formulario" in texto_estado:
        return "Simplificar el formulario, reducir campos innecesarios, mostrar ayuda contextual y dividir en pasos cortos."
    elif "pago" in texto_estado:
        return "Mejorar claridad del pago, ofrecer varios métodos, mostrar confirmación visual y reducir errores técnicos."
    elif "sesión" in texto_estado or "login" in texto_estado:
        return "Permitir registro rápido, inicio con cuenta externa, recuperación sencilla o continuidad como invitado."
    elif "información" in texto_estado:
        return "Agregar llamados a la acción visibles, rutas diferenciadas y jerarquía visual más clara."
    elif "horario" in texto_estado or "opción" in texto_estado:
        return "Mostrar opciones destacadas, filtros, disponibilidad clara y recomendaciones automáticas."
    else:
        return "Revisar contenido, mejorar instrucciones, reducir pasos y agregar llamada a la acción clara."
