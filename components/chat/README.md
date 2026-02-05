# Chat de Calibración - MVP

Asistente de chat con IA para ayudar a managers en la preparación y ejecución de mesas de calibración de desempeño.

---

## Concepto

El manager interactúa con un **agente de chat** que puede:
- Consultar datos de su equipo
- Mostrar **cards de empleados** directamente en el chat
- Comparar múltiples colaboradores
- Agregar comentarios a evaluaciones

La interfaz tiene 3 zonas:
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (30%)  │  Chat (40%)  │  Mesa de Trabajo   │
│                 │              │      (30%)         │
│  - Contexto     │  - Mensajes  │  - Cards en        │
│  - Alertas      │  - Cards     │    detalle         │
│  - Top performers│  inline     │  - Comparaciones   │
└─────────────────────────────────────────────────────┘
```

---

## Archivos Actuales

| Archivo | Descripción |
|---------|-------------|
| `chat-panel.tsx` | Panel principal del chat con mensajes y cards inline |
| `context-sidebar.tsx` | Sidebar izquierdo con contexto del equipo |
| `employee-card.tsx` | Card de empleado individual + `ComparisonCard` para comparaciones |
| `employee-detail-panel.tsx` | Panel de detalle expandido |
| `../app/api/chat/route.ts` | API proxy para LM Studio |
| `../app/protected/chat/page.tsx` | Página principal (layout Option C) |

---

## Cómo Correr

### Sin LM Studio (respuestas mock)
```bash
npm run dev
# Ir a http://localhost:3000/protected/chat
# El chat responde con datos mock de los 4 empleados
```

### Con LM Studio (LLM real)
1. Descargar [LM Studio](https://lmstudio.ai)
2. Instalar modelo: `Llama 3 8B Instruct`
3. Iniciar servidor local en puerto `1234`
4. El chat usará el LLM para respuestas inteligentes

---

## Cards

Las cards muestran información de empleados y pueden aparecer:
- **Inline en el chat**: Cuando el usuario pregunta por alguien
- **En la mesa de trabajo**: Para comparación detallada

### Tipos de Cards

| Card | Uso |
|------|-----|
| `EmployeeCard` | Vista individual de un empleado (potencial, competencias, alertas) |
| `ComparisonCard` | Tabla comparativa de 2-4 empleados |

### Datos Mock

4 empleados sincronizados con Supabase seed:
- Paula Roa (3.75 competencias, mejor evaluada)
- Angeles Zuñiga (3.0 potencial, Medio+)
- Anibal Retamal (2.5 potencial, alerta cliente bajo)
- Alvaro Marquez (2.4 potencial bajo, requiere plan desarrollo)

---

## Features Clave para Demo

Estas son las consultas que el manager debe poder hacer en el demo:

### 1. Fuente Evaluadora
**Pregunta**: "¿Cómo evaluaron a Angeles y quién la evaluó?"

**Respuesta esperada**:
```
Angeles Zuñiga fue evaluada por:
- Jefe Directo: 3.38 (Sobresaliente)
- Colaboradores: 3.14 (promedio)
- Autoevaluación: X.XX

Desglose por evaluador:
| Evaluador | Relación | Nota |
|-----------|----------|------|
| María López | Jefe Directo | 3.38 |
| Juan Pérez | Par | 3.20 |
| ... | ... | ... |
```

### 2. Histórico de Evaluaciones
**Pregunta**: "¿Hubo cambios en las evaluaciones de Angeles respecto al año pasado?"

**Respuesta esperada**:
```
Evolución de Angeles Zuñiga:

| Año | Potencial | Competencias | Cambio |
|-----|-----------|--------------|--------|
| 2023 | 2.8 | 3.00 | - |
| 2024 | 3.0 | 3.14 | ↑ +0.2 / +0.14 |

Nota: Mejoró en potencial, mantiene competencias estables.
```

### 3. Comparar Personas
**Pregunta**: "Compara a Paula con Alvaro"

**Respuesta esperada**: ComparisonCard con ambos + análisis textual de diferencias.

### 4. Comentarios
**Pregunta**: "¿Qué comentarios tiene Anibal?" / "Agrega comentario a Paula"

**Respuesta esperada**: Mostrar comentarios existentes o confirmar nuevo comentario guardado.

---

## Pendiente por Implementar

### 1. Layout de 3 zonas
**Estado**: No implementado

Reorganizar visualmente:
- **Sidebar** (izquierda): Contexto, alertas, accesos rápidos
- **Chat** (centro): Conversación con cards inline
- **Mesa de trabajo** (derecha): Cards en detalle para comparación

### 2. Cards arbitrarias en el chat
**Estado**: No implementado

- El chat puede mostrar N cards simultáneas (1, 2, 5, 10...)
- Las cards se ajustan en tamaño según cantidad
- Clic en una card → se mueve a la mesa de trabajo

### 3. Mesa de trabajo con contexto
**Estado**: No implementado

- Zona visual para tener múltiples cards abiertas
- El usuario puede escribir: "compara las 4 cards que tengo en la mesa"
- El chat entiende el contexto de lo que está visible
- **Importante**: La mesa es solo visualización. No mantiene tracking interno. Todo lo relevante va en el texto del chat.

### 4. Guardar conversaciones
**Estado**: No implementado

- Persistir historial de chat
- Poder retomar conversaciones anteriores
- Ver histórico de mesas de calibración pasadas

### 5. Manejo de contexto largo (futuro)
**Estado**: Por evaluar

- ¿Qué pasa cuando la conversación es muy larga?
- ¿Vertex ADK maneja ventanas de contexto automáticamente?
- ¿Necesitamos summarization manual?
- Definir estrategia antes de producción

### 6. Comentarios a evaluaciones
**Estado**: No implementado

- Agregar comentarios a la performance de cada trabajador
- Desde el chat: "agrega el comentario 'excelente liderazgo' a Paula"
- Requiere:
  - **Frontend**: UI para ver/agregar comentarios en cards
  - **Backend**: Endpoint para guardar comentarios
  - **Function call**: Tool específico para el agente AI

---

## Flujo de Uso Esperado

```
1. Manager abre el chat
2. Pregunta: "¿Quién tiene alertas?"
3. Chat responde con texto + cards inline de Alvaro y Anibal
4. Manager hace clic en card de Alvaro → va a mesa de trabajo
5. Pregunta: "¿Cómo se compara con Paula?"
6. Chat muestra ComparisonCard inline
7. Manager hace clic → ComparisonCard va a mesa de trabajo
8. Pregunta: "Agrega comentario 'necesita coaching' a Alvaro"
9. Chat confirma y guarda el comentario
10. Al final, la conversación queda guardada para la reunión
```

---

## Stack Técnico

- **Frontend**: Next.js 15, React, shadcn/ui, Tailwind
- **LLM (dev)**: LM Studio + Llama 3 8B
- **LLM (prod)**: Vertex AI + Gemini (por implementar)
- **Data (dev)**: Supabase con datos seed
- **Data (prod)**: Cloud SQL con pgcrypto (por implementar)

---

## Decisiones de Diseño

| Decisión | Razón |
|----------|-------|
| Chat-first (Option C) | Validar si managers prefieren conversación vs dashboard tradicional |
| Cards inline en chat | Contexto visual sin salir de la conversación |
| Mesa de trabajo separada | Comparar múltiples personas sin perder el chat |
| Mock fallback | Poder hacer demos sin LLM corriendo |
| No tracking en mesa | Simplicidad - el chat es la fuente de verdad |
