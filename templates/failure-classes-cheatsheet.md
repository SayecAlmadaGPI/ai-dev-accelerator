<!--
  failure-classes-cheatsheet.md — 12 clases de falla + síntoma + respuesta
  --------------------------------------------------------------------
  Versión tabular del árbol de decisión de M7 §7.9. Tenla a mano
  durante una sesión; cuando el agente se equivoca, identifica la clase
  por el síntoma y aplica la respuesta correcta.

  Principio: la clase de falla determina la respuesta. Reintentar sin
  clasificar es apostar a que el modelo, en el mismo contexto, produzca
  algo distinto — y a veces empeora.

  Las 5 clases macro (M7 §7.1) se desglosan aquí en 12 modos concretos
  observados en producción. La columna "¿reintentar?" es la regla más
  importante de la tabla.
-->

# Cheatsheet — 12 clases de falla + síntoma + respuesta

> **Tesis:** ante una falla, primero clasifícala. La clase determina la
> respuesta. Reintentar en ciego no es estrategia, es apuesta.

## Tabla de decisión

| # | Clase (macro) | Modo concreto | Síntoma | Respuesta correcta | ¿Reintentar? |
|---|---------------|---------------|--------|--------------------|--------------|
| 1 | Contexto | Context window exhaustion | El agente pierde acceso a info temprana; omite pasos que antes hacía. | Compacta (M4 §4.2) o cierra sesión con handoff. | No |
| 2 | Contexto | Compaction amnesia | Tras compactar, olvida decisiones o reglas que importaban. | Relectura forzada de spec/AGENTS.md; mover lo crítico a archivos. | No |
| 3 | Contexto | Stale file cache | Asume estado de un archivo que ya cambió. | Forzar relectura del archivo antes de decidir. | Solo tras relectura |
| 4 | Tools | Hallucinated tool call | "Llama" a una tool inexistente o con nombre inventado. | Error estructurado de vuelta; revisar schema. | Tras corregir schema |
| 5 | Tools | Argument fabrication | Rellena argumentos con valores plausibles pero inventados. | Validar args en el harness antes de ejecutar. | A veces |
| 6 | Tools | Wrong tool selection | Usa tool de lectura para escribir, o viceversa. | Error estructurado; revisar naming de tools. | A veces |
| 7 | Trayectoria | Infinite loop | Repite el mismo paso sin avanzar. | Corta el loop; cierra o reespecifica. | No |
| 8 | Trayectoria | Yak-shaving / scope creep | Deriva a tareas no pedidas ("mientras tanto..."). | Reespecifica con no-objetivos; worktree aislado. | No |
| 9 | Acción | Phantom verification | Afirma verificar sin ejecutar el comando. | Exige output textual del comando (M6 §6.1.1). | Solo con sensor |
| 10 | Acción | Hollow report | Reporte sin números ni nombres; "todo OK ✓". | Exige schema DONE/VERIFIED con datos (M6 §6.5). | Solo con sensor |
| 11 | Sandbox | Prompt injection via repo | Obedece instrucciones halladas en un archivo del repo. | Aísla; audita; endurece (M10). Es incidente. | No |
| 12 | Sandbox | Credential leakage | Filtra `.env`/tokens en output o a tools externas. | Aísla; revoca; saca secretos del árbol indexado. | No |

## Reglas de oro

1. **~40% son de contexto.** La primera pregunta ante cualquier falla:
   ¿el contexto está saturado (>60%) o el agente pierde reglas que antes
   respetaba? Si sí, la solución casi nunca es más prompt; es gestionar
   el contexto.

2. **Determinístico > probabilístico.** Toda mitigación que depende de
   "pedirle al modelo" es frágil. Toda mitigación que depende de un
   mecanismo independiente (hook, sensor, worktree) es robusta.

3. **Sandbox y seguridad no se reintentan.** Son incidentes. Se aíslan,
   se auditan, se endurecen. Reintentar un leak de credenciales es
   reproducir el leak.

4. **Acción sin sensor no se reintenta.** Si el agente hizo phantom
   verification, reintentar en el mismo contexto produce otro phantom.
   Primero el sensor; después el reintento.

## Referencia

- M7 §7.1 — taxonomía de 5 clases.
- M7 §7.9 — árbol de decisión.
- M6 §6.1 — phantom verification, hollow report, test gaming.
- M10 — tratamiento sistemático de sandbox y seguridad.