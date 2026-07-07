<!--
  arbol-diagnostico-fallas.md — Árbol de decisión: qué hacer cuando el agente falla
  ----------------------------------------------------------------------------------
  Árbol de decisión (Apéndice C). Versión standalone del árbol inline en M7 §7.9.
  Mismo contenido; pensado para imprimir o tener a mano durante la sesión.
-->

# Árbol de diagnóstico de fallas

> **Regla del M7:** ante una falla, primero **clasifícala**. La clase
> determina la respuesta. No reintentes en ciego: la mayoría de las
> clases no se arreglan reintentando.

```
El agente falló. ¿De qué clase es?
│
├─ ¿El contexto está saturado (>60%) o el agente pierde reglas que
│  antes respetaba?
│  └─ SÍ → CORRUPCIÓN DE CONTEXTO (~40%).
│          No reintentes. Compacta (M4 §4.2) o cierra sesión con
│          handoff (M4 §4.3) y arranca limpio.
│
├─ ¿Llamó a una tool inexistente, fabricó argumentos, o usó la tool
│  equivocada?
│  └─ SÍ → MAL USO DE TOOLS (~25%).
│          Devuelve error estructurado al modelo; revisa el schema
│          (M5 §5.1.2). No reintentes en ciego.
│
├─ ¿Está repitiendo pasos, derivando a tareas no pedidas, o
│  oscilando entre dos soluciones?
│  └─ SÍ → TRAYECTORIA / DEGENERACIÓN (~15%).
│          Corta el loop. Reespecifica con no-objetivos. Usa worktree
│          aislado para que la deriva no contamine.
│
├─ ¿Afirmó verificar sin ejecutar, o su reporte es hueco / sin
│  números?
│  └─ SÍ → ACCIÓN / REALIZACIÓN (~10%).
│          Exige evidencia mecánica (M6 §6.5). El sensor, no el
│          modelo, debe confirmar. No reintentes sin sensor.
│
└─ ¿Accedió a paths fuera de scope, obedeció instrucciones de un
   archivo del repo, o filtró credenciales?
   └─ SÍ → SANDBOX Y SEGURIDAD (~10%).
           Esto es incidente. Aísla, audita, endurece. Ver M10.
           NO reintentes.
```

## Notas de uso

- **Determinístico > probabilístico:** cuando una clase se repite, no
  caigas en "probemos de nuevo a ver si pasa". Instala la mitigación que
  la previene (un hook, un gate, un spec corregido).
- **El postmortem convierte el incidente en harness:** cada falla
  clasificada que se repite debe producir una mitigación instalada, no
  solo entendida (M7 §7.10, `templates/incident-postmortem-agent.md`).
- **Versión tabular** (12 modos concretos): `templates/failure-classes-cheatsheet.md`.

**Fondo:** M7 §7.1 (taxonomía de 5 clases), §7.9 (este árbol inline),
§7.10 (postmortem).