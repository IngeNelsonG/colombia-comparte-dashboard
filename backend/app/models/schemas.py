from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum


class ResultadoEnum(str, Enum):
    EXITO = "Éxito"
    ABANDONO = "Abandono"
    ERROR = "Error"
    SEGUIMIENTO_PENDIENTE = "Seguimiento pendiente"


class TipoEstadoEnum(str, Enum):
    INICIAL = "Inicial"
    EXPLORACION = "Exploración"
    DECISION = "Decisión"
    PROGRAMA = "Programa"
    FORMULARIO = "Formulario"
    CONFIRMACION = "Confirmación"
    SERVICIO_EMPRESARIAL = "Servicio empresarial"
    CONTENIDO = "Contenido"
    RETORNO = "Retorno"
    DONACION = "Donación"
    TRANSPARENCIA = "Transparencia"
    AULA = "Aula"
    CANAL_EXTERNO = "Canal externo"
    FINAL_PENDIENTE = "Final pendiente"
    FINAL_ABANDONO = "Final abandono"
    FINAL_ERROR = "Final error"
    FINAL_EXITO = "Final éxito"


class Estado(BaseModel):
    codigo: str
    nombre: str
    descripcion: str
    tipo: TipoEstadoEnum
    es_final: bool


class Recorrido(BaseModel):
    id: str
    perfil: str
    objetivo: str
    estados: List[str]
    resultado: ResultadoEnum
    num_pasos: int


class SimulacionRequest(BaseModel):
    num_usuarios: int = 1000
    max_pasos: int = 30
    estado_inicial: str = "S0"
    seed: int = 2026


class RecorridoFrecuente(BaseModel):
    recorrido: str
    frecuencia: int


class SimulacionResponse(BaseModel):
    usuarios: int
    recorridos: List[List[str]]
    resultados_count: Dict[str, int]
    resultados_porcentaje: Dict[str, float]
    promedio_pasos: float
    recorridos_frecuentes: List[RecorridoFrecuente]


class MatrizTransicion(BaseModel):
    matriz: List[List[float]]
    estados: List[str]
    tipo: str  # "conteos" o "probabilidades"


class DiagnosticoResponse(BaseModel):
    estado_critico: str
    nombre_estado: str
    probabilidad_abandono: float
    cantidad_abandonos: int
    porcentaje_abandono: float
    causa: str
    mejora: str
    indicador: str


class ComparisonRequest(BaseModel):
    reduccion_abandono: float = 0.20
    estado_critico: str = "S10"


class ComparisonResponse(BaseModel):
    simulacion_actual: Dict[str, float]
    simulacion_mejorada: Dict[str, float]
    cambios: Dict[str, float]
    promedio_pasos_actual: float
    promedio_pasos_mejorado: float
