import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional


# ===== DATOS REALES DEL PROYECTO =====

ESTADOS = [
    'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9',
    'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19',
    'S20', 'S21', 'S22', 'S23', 'S24', 'S25', 'S26', 'S27', 'S28', 'S29',
    'S30', 'S31', 'S32', 'S33', 'S34', 'S35', 'S36', 'S37'
]

NOMBRES_ESTADOS = {
    'S0': 'Ingreso al portal principal de Colombia Comparte',
    'S1': 'Observa propuesta de valor, impacto y menú principal',
    'S2': 'Lee misión, historia y propósito de la fundación',
    'S3': 'Consulta cifras de impacto y población beneficiaria',
    'S4': 'Abre sección Sobre nosotros',
    'S5': 'Revisa equipo, mentores, coaches y conferencistas',
    'S6': 'Abre menú Programas',
    'S7': 'Ingresa a Programa EDIFICA',
    'S8': 'Lee enfoque, beneficios y módulos de EDIFICA',
    'S9': 'Revisa testimonios e invitación a emprender',
    'S10': 'Hace clic en Inscríbete o formulario de interés',
    'S11': 'Completa datos personales de inscripción',
    'S12': 'Completa información del emprendimiento o necesidad',
    'S13': 'Envía solicitud de inscripción EDIFICA',
    'S14': 'Recibe confirmación o instrucción de contacto',
    'S15': 'Ingresa a Shows y Conferencias / Top Speakers',
    'S16': 'Revisa portafolio de conferencistas y servicios empresariales',
    'S17': 'Selecciona tipo de servicio: conferencia o show',
    'S18': 'Consulta información para empresas aliadas',
    'S19': 'Rellena el formulario de contacto empresarial',
    'S20': 'Envía solicitud de conferencia o alianza',
    'S21': 'Entra a Noticias / Blog / Actualidad',
    'S22': 'Lee una noticia, historia o testimonio',
    'S23': 'Regresa a Inicio o al menú principal',
    'S24': 'Abre directorio o portafolio de emprendedores',
    'S25': 'Consulta emprendimientos y casos destacados',
    'S26': 'Ingresa a Donaciones',
    'S27': 'Lee causa y opciones de apoyo',
    'S28': 'Intenta realizar donación a través de los medios de pago de Bold',
    'S29': 'Ingresa a Solicitudes DIAN',
    'S30': 'Consulta o descarga documentos legales',
    'S31': 'Ingresa a Tu Aula / aula.colombiacomparte.com',
    'S32': 'Intenta acceso a aula o recursos de estudiante',
    'S33': 'Elige canal externo: WhatsApp, correo o red social',
    'S34': 'Seguimiento pendiente fuera de la página',
    'S35': 'Abandona la navegación sin completar objetivo',
    'S36': 'Error, bloqueo técnico o formulario incompleto',
    'S37': 'Éxito: solicitud, contacto o acción completada'
}

TIPOS_ESTADOS = {
    'S0': 'Inicial',
    'S1': 'Exploración', 'S2': 'Exploración', 'S3': 'Exploración',
    'S4': 'Exploración', 'S5': 'Exploración',
    'S6': 'Decisión',
    'S7': 'Programa', 'S8': 'Programa', 'S9': 'Programa',
    'S10': 'Formulario', 'S11': 'Formulario', 'S12': 'Formulario',
    'S13': 'Formulario',
    'S14': 'Confirmación',
    'S15': 'Servicio empresarial', 'S16': 'Servicio empresarial',
    'S17': 'Servicio empresarial', 'S18': 'Servicio empresarial',
    'S19': 'Formulario', 'S20': 'Formulario',
    'S21': 'Contenido', 'S22': 'Contenido',
    'S23': 'Retorno',
    'S24': 'Contenido', 'S25': 'Contenido',
    'S26': 'Donación', 'S27': 'Donación', 'S28': 'Donación',
    'S29': 'Transparencia', 'S30': 'Transparencia',
    'S31': 'Aula', 'S32': 'Aula',
    'S33': 'Canal externo',
    'S34': 'Final pendiente', 'S35': 'Final abandono',
    'S36': 'Final error', 'S37': 'Final éxito'
}

ESTADOS_FINALES = ['S34', 'S35', 'S36', 'S37']

MAPA_RESULTADOS = {
    'S37': 'Éxito',
    'S35': 'Abandono',
    'S36': 'Error',
    'S34': 'Seguimiento pendiente'
}

# 60 recorridos base del proyecto real
RECORRIDOS_DATOS = [
    {'perfil': 'Emprendedor', 'objetivo': 'Inscribirse a EDIFICA', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Conocer EDIFICA e inscribirse', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S14', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Validar testimonios antes de aplicar', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S9', 'S23', 'S7', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Aplicar desde la página del programa', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Inscripción luego de leer historia', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S23', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Resolver dudas por contacto antes de aplicar', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S10', 'S11', 'S33', 'S34']},
    {'perfil': 'Emprendedor', 'objetivo': 'Duda en formulario de inscripción', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S10', 'S11', 'S35']},
    {'perfil': 'Emprendedor', 'objetivo': 'Formulario incompleto al aplicar', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S10', 'S11', 'S12', 'S36']},
    {'perfil': 'Emprendedor', 'objetivo': 'Explora EDIFICA pero no aplica', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S9', 'S35']},
    {'perfil': 'Emprendedor', 'objetivo': 'Lee testimonios y abandona', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S9', 'S22', 'S23', 'S7', 'S8', 'S10', 'S35']},
    {'perfil': 'Emprendedor', 'objetivo': 'Entra desde noticia de EDIFICA', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Busca portafolio y luego EDIFICA', 'recorrido': ['S0', 'S1', 'S24', 'S25', 'S23', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Consulta emprendedores y pide información', 'recorrido': ['S0', 'S1', 'S24', 'S25', 'S33', 'S34']},
    {'perfil': 'Emprendedor', 'objetivo': 'No encuentra formulario rápidamente', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S23', 'S7', 'S8', 'S10', 'S35']},
    {'perfil': 'Emprendedor', 'objetivo': 'Error al enviar inscripción', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S36']},
    {'perfil': 'Emprendedor', 'objetivo': 'Aplica desde menú Programas', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S14', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Pasa por sobre nosotros antes de aplicar', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S23', 'S6', 'S7', 'S8', 'S10', 'S11', 'S12', 'S13', 'S37']},
    {'perfil': 'Emprendedor', 'objetivo': 'Salta a WhatsApp antes de terminar', 'recorrido': ['S0', 'S1', 'S7', 'S8', 'S10', 'S33', 'S34']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Solicitar conferencia para empresa', 'recorrido': ['S0', 'S1', 'S6', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S37']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Explorar speakers y contactar', 'recorrido': ['S0', 'S1', 'S15', 'S16', 'S17', 'S19', 'S20', 'S37']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Validar equipo antes de solicitar taller', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S23', 'S15', 'S16', 'S17', 'S19', 'S20', 'S37']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Consultar propósito y pedir alianza', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S23', 'S15', 'S16', 'S18', 'S19', 'S20', 'S37']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Duda sobre servicios empresariales', 'recorrido': ['S0', 'S1', 'S15', 'S16', 'S18', 'S33', 'S34']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Abandono al revisar portafolio de speakers', 'recorrido': ['S0', 'S1', 'S15', 'S16', 'S35']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Error en formulario empresarial', 'recorrido': ['S0', 'S1', 'S15', 'S16', 'S17', 'S19', 'S36']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Va de noticias a conferencias', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S15', 'S16', 'S17', 'S19', 'S20', 'S37']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Solicita contacto por correo externo', 'recorrido': ['S0', 'S1', 'S15', 'S16', 'S17', 'S33', 'S34']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Busca información pero sale sin contactar', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S15', 'S16', 'S35']},
    {'perfil': 'Aliado empresarial', 'objetivo': 'Formulario enviado con éxito desde contacto', 'recorrido': ['S0', 'S1', 'S18', 'S19', 'S20', 'S37']},
    {'perfil': 'Mentor', 'objetivo': 'Conocer equipo y ofrecer mentoría', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S23', 'S7', 'S8', 'S33', 'S34']},
    {'perfil': 'Mentor', 'objetivo': 'Contactar para ser voluntario', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S33', 'S34']},
    {'perfil': 'Mentor', 'objetivo': 'Explorar EDIFICA y enviar contacto', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S9', 'S33', 'S34']},
    {'perfil': 'Mentor', 'objetivo': 'Abandona al revisar equipo', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S35']},
    {'perfil': 'Mentor', 'objetivo': 'Consulta programa y no encuentra ruta de mentor', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S8', 'S23', 'S4', 'S5', 'S35']},
    {'perfil': 'Mentor', 'objetivo': 'Error al intentar contactar', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S33', 'S36']},
    {'perfil': 'Mentor', 'objetivo': 'Contacto exitoso como conferencista', 'recorrido': ['S0', 'S1', 'S4', 'S5', 'S23', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S37']},
    {'perfil': 'Visitante general', 'objetivo': 'Conocer fundación y salir satisfecho', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S37']},
    {'perfil': 'Visitante general', 'objetivo': 'Leer historia y noticias', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S21', 'S22', 'S37']},
    {'perfil': 'Visitante general', 'objetivo': 'Leer noticias y abandonar', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S7', 'S8', 'S10', 'S35']},
    {'perfil': 'Visitante general', 'objetivo': 'Navegar noticias y volver a inicio', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S2', 'S3', 'S35']},
    {'perfil': 'Periodista', 'objetivo': 'Consultar impacto y contacto externo', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S21', 'S22', 'S33', 'S34']},
    {'perfil': 'Visitante general', 'objetivo': 'Consulta rápida del impacto', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S37']},
    {'perfil': 'Visitante general', 'objetivo': 'No encuentra información específica', 'recorrido': ['S0', 'S1', 'S23', 'S21', 'S22', 'S23', 'S7', 'S8', 'S10', 'S35']},
    {'perfil': 'Visitante general', 'objetivo': 'Error o enlace roto desde noticia', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S7', 'S8', 'S10', 'S11', 'S36']},
    {'perfil': 'Donante', 'objetivo': 'Revisar causa y donar', 'recorrido': ['S0', 'S1', 'S26', 'S27', 'S28', 'S37']},
    {'perfil': 'Donante', 'objetivo': 'Validar misión antes de donar', 'recorrido': ['S0', 'S1', 'S2', 'S3', 'S23', 'S26', 'S27', 'S28', 'S37']},
    {'perfil': 'Donante', 'objetivo': 'Donación con contacto pendiente', 'recorrido': ['S0', 'S1', 'S26', 'S27', 'S33', 'S34']},
    {'perfil': 'Donante', 'objetivo': 'Abandona al no entender donación', 'recorrido': ['S0', 'S1', 'S26', 'S27', 'S35']},
    {'perfil': 'Donante', 'objetivo': 'Error en flujo de donación', 'recorrido': ['S0', 'S1', 'S26', 'S27', 'S28', 'S36']},
    {'perfil': 'Donante', 'objetivo': 'Consulta DIAN antes de donar', 'recorrido': ['S0', 'S1', 'S29', 'S30', 'S23', 'S26', 'S27', 'S28', 'S37']},
    {'perfil': 'Donante', 'objetivo': 'Consulta legal y abandona', 'recorrido': ['S0', 'S1', 'S29', 'S30', 'S35']},
    {'perfil': 'Estudiante EDIFICA', 'objetivo': 'Ingresar a Tu Aula', 'recorrido': ['S0', 'S1', 'S31', 'S32', 'S37']},
    {'perfil': 'Estudiante EDIFICA', 'objetivo': 'Buscar aula desde programa', 'recorrido': ['S0', 'S1', 'S6', 'S7', 'S31', 'S32', 'S37']},
    {'perfil': 'Estudiante EDIFICA', 'objetivo': 'Problema de acceso al aula', 'recorrido': ['S0', 'S1', 'S31', 'S32', 'S36']},
    {'perfil': 'Estudiante EDIFICA', 'objetivo': 'No recuerda credenciales y pide ayuda', 'recorrido': ['S0', 'S1', 'S31', 'S32', 'S33', 'S34']},
    {'perfil': 'Estudiante EDIFICA', 'objetivo': 'Abandona en login de aula', 'recorrido': ['S0', 'S1', 'S31', 'S32', 'S35']},
    {'perfil': 'Usuario institucional', 'objetivo': 'Consultar solicitudes DIAN', 'recorrido': ['S0', 'S1', 'S29', 'S30', 'S37']},
    {'perfil': 'Usuario institucional', 'objetivo': 'Descargar documentos y contactar', 'recorrido': ['S0', 'S1', 'S29', 'S30', 'S33', 'S34']},
    {'perfil': 'Usuario institucional', 'objetivo': 'Error al descargar documento', 'recorrido': ['S0', 'S1', 'S29', 'S30', 'S36']},
    {'perfil': 'Emprendedor', 'objetivo': 'Comparar noticias y aplicar EDIFICA', 'recorrido': ['S0', 'S1', 'S21', 'S22', 'S23', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S37']}
]

COLORES = {
    'Éxito': '#2A9D8F',
    'Abandono': '#E76F51',
    'Error': '#F4A261',
    'Seguimiento pendiente': '#457B9D'
}


class MarkovSimulator:
    """Simulador de cadenas de Markov para Colombia Comparte"""
    
    def __init__(self):
        self.matriz_conteos = None
        self.matriz_probabilidades = None
        self._build_matrices()
    
    def _build_matrices(self):
        """Construye las matrices de conteos y probabilidades desde los recorridos base"""
        self.matriz_conteos = pd.DataFrame(0, index=ESTADOS, columns=ESTADOS, dtype=int)
        
        for registro in RECORRIDOS_DATOS:
            recorrido = registro['recorrido']
            for i in range(len(recorrido) - 1):
                estado_actual = recorrido[i]
                estado_siguiente = recorrido[i + 1]
                self.matriz_conteos.loc[estado_actual, estado_siguiente] += 1
        
        self.matriz_probabilidades = self.matriz_conteos.div(
            self.matriz_conteos.sum(axis=1),
            axis=0
        ).fillna(0)
    
    def simular_usuario(self, estado_inicial: str = "S0", max_pasos: int = 30, rng: np.random.Generator = None) -> List[str]:
        """Simula un usuario individual hasta alcanzar un estado final"""
        if rng is None:
            rng = np.random.default_rng()
        
        estado_actual = estado_inicial
        recorrido = [estado_actual]
        
        for _ in range(max_pasos):
            if estado_actual in ESTADOS_FINALES:
                break
            
            probabilidades = self.matriz_probabilidades.loc[estado_actual].values.astype(float)
            if probabilidades.sum() <= 0:
                break
            
            estado_actual = rng.choice(ESTADOS, p=probabilidades)
            recorrido.append(estado_actual)
        
        return recorrido
    
    def simular_usuarios(self, n: int = 1000, seed: int = 2026, estado_inicial: str = "S0", max_pasos: int = 30) -> Tuple[List[List[str]], Dict]:
        """Simula N usuarios y retorna sus recorridos con estadísticas"""
        rng = np.random.default_rng(seed)
        recorridos_simulados = []
        resultados = {'Éxito': 0, 'Abandono': 0, 'Error': 0, 'Seguimiento pendiente': 0}
        num_pasos_total = 0
        
        for _ in range(n):
            recorrido = self.simular_usuario(estado_inicial, max_pasos, rng)
            recorridos_simulados.append(recorrido)
            
            estado_final = recorrido[-1]
            resultado = MAPA_RESULTADOS.get(estado_final, 'Desconocido')
            if resultado in resultados:
                resultados[resultado] += 1
            
            num_pasos_total += len(recorrido)
        
        stats = {
            'resultados_count': resultados,
            'resultados_porcentaje': {k: (v / n * 100) for k, v in resultados.items()},
            'promedio_pasos': num_pasos_total / n
        }
        
        return recorridos_simulados, stats
    
    def obtener_recorridos_frecuentes(self, recorridos: List[List[str]], top_n: int = 10) -> List[Dict]:
        """Obtiene los recorridos más frecuentes"""
        from collections import Counter
        recorridos_str = ['→'.join(r) for r in recorridos]
        contador = Counter(recorridos_str)
        return [
            {'recorrido': rec, 'frecuencia': freq}
            for rec, freq in contador.most_common(top_n)
        ]
    
    def get_matriz_conteos(self) -> Tuple[List[List[int]], List[str]]:
        """Retorna la matriz de conteos"""
        return self.matriz_conteos.values.tolist(), ESTADOS
    
    def get_matriz_probabilidades(self) -> Tuple[List[List[float]], List[str]]:
        """Retorna la matriz de probabilidades"""
        return self.matriz_probabilidades.values.tolist(), ESTADOS
    
    def identificar_estado_critico(self) -> Tuple[str, float]:
        """Identifica el estado más asociado con abandono (S35)"""
        if 'S35' not in self.matriz_probabilidades.columns:
            return None, 0.0
        
        probabilidades_abandono = self.matriz_probabilidades['S35'].drop(ESTADOS_FINALES, errors='ignore')
        
        if probabilidades_abandono.empty:
            return None, 0.0
        
        estado_critico = probabilidades_abandono.idxmax()
        valor = probabilidades_abandono.max()
        
        return estado_critico, float(valor)
    
    def identificar_estado_previo_abandono(self, recorridos_simulados: List[List[str]]) -> Optional[str]:
        """Identifica el estado previo más frecuente antes del abandono"""
        estados_previos = []
        
        for recorrido in recorridos_simulados:
            if recorrido[-1] == 'S35' and len(recorrido) >= 2:
                estados_previos.append(recorrido[-2])
        
        if not estados_previos:
            return None
        
        from collections import Counter
        contador = Counter(estados_previos)
        return contador.most_common(1)[0][0]
    
    def calcular_diagnostico(self, recorridos_simulados: List[List[str]]) -> Dict:
        """Calcula diagnóstico del estado crítico"""
        estado_critico = self.identificar_estado_previo_abandono(recorridos_simulados)
        if not estado_critico:
            estado_critico, _ = self.identificar_estado_critico()
        
        if not estado_critico:
            return None
        
        # Contar abandonos después de este estado
        abandonos_totales = sum(1 for r in recorridos_simulados if r[-1] == 'S35')
        abandonos_desde_estado = sum(1 for r in recorridos_simulados if len(r) >= 2 and r[-2] == estado_critico and r[-1] == 'S35')
        
        return {
            'estado_critico': estado_critico,
            'nombre_estado': NOMBRES_ESTADOS.get(estado_critico, 'Desconocido'),
            'prob_abandono': float(self.matriz_probabilidades.loc[estado_critico, 'S35']) if estado_critico in self.matriz_probabilidades.index else 0.0,
            'cantidad_abandonos': abandonos_desde_estado,
            'porcentaje_abandono': (abandonos_desde_estado / max(abandonos_totales, 1)) * 100 if abandonos_totales > 0 else 0.0,
            'total_usuarios': len(recorridos_simulados)
        }
    
    def construir_matriz_mejorada(self, estado_critico: str, reduccion_abandono: float = 0.20) -> pd.DataFrame:
        """Construye una matriz mejorada con reducción de abandono"""
        matriz_mejorada = self.matriz_probabilidades.copy()
        
        if estado_critico not in matriz_mejorada.index or 'S35' not in matriz_mejorada.columns:
            return matriz_mejorada
        
        prob_actual_abandono = matriz_mejorada.loc[estado_critico, 'S35']
        reduccion_real = min(reduccion_abandono, prob_actual_abandono)
        
        if reduccion_real <= 0:
            return matriz_mejorada
        
        matriz_mejorada.loc[estado_critico, 'S35'] = prob_actual_abandono - reduccion_real
        
        otras_transiciones = matriz_mejorada.loc[estado_critico].drop('S35')
        destinos_validos = otras_transiciones[otras_transiciones > 0].index.tolist()
        
        if len(destinos_validos) == 0:
            if 'S37' in matriz_mejorada.columns:
                matriz_mejorada.loc[estado_critico, 'S37'] += reduccion_real
        else:
            suma_destinos = matriz_mejorada.loc[estado_critico, destinos_validos].sum()
            for destino in destinos_validos:
                proporcion = matriz_mejorada.loc[estado_critico, destino] / suma_destinos
                matriz_mejorada.loc[estado_critico, destino] += reduccion_real * proporcion
        
        suma_fila = matriz_mejorada.loc[estado_critico].sum()
        if suma_fila > 0:
            matriz_mejorada.loc[estado_critico] = matriz_mejorada.loc[estado_critico] / suma_fila
        
        return matriz_mejorada
    
    def simular_con_matriz_mejorada(self, matriz_mejorada: pd.DataFrame, n: int = 1000, seed: int = 2026) -> Tuple[List[List[str]], Dict]:
        """Simula usuarios con una matriz de probabilidades mejorada"""
        rng = np.random.default_rng(seed)
        recorridos_simulados = []
        resultados = {'Éxito': 0, 'Abandono': 0, 'Error': 0, 'Seguimiento pendiente': 0}
        num_pasos_total = 0
        
        for _ in range(n):
            estado_actual = 'S0'
            recorrido = [estado_actual]
            
            for _ in range(30):
                if estado_actual in ESTADOS_FINALES:
                    break
                
                probabilidades = matriz_mejorada.loc[estado_actual].values.astype(float)
                if probabilidades.sum() <= 0:
                    break
                
                estado_actual = rng.choice(ESTADOS, p=probabilidades)
                recorrido.append(estado_actual)
            
            recorridos_simulados.append(recorrido)
            
            estado_final = recorrido[-1]
            resultado = MAPA_RESULTADOS.get(estado_final, 'Desconocido')
            if resultado in resultados:
                resultados[resultado] += 1
            
            num_pasos_total += len(recorrido)
        
        stats = {
            'resultados_count': resultados,
            'resultados_porcentaje': {k: (v / n * 100) for k, v in resultados.items()},
            'promedio_pasos': num_pasos_total / n
        }
        
        return recorridos_simulados, stats


# Instancia global del simulador
simulator = MarkovSimulator()
