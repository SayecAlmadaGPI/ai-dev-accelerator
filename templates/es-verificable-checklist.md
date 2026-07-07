<!--
  es-verificable-checklist.md — 10 preguntas antes de aceptar el output
  ----------------------------------------------------------------------
  Checklist de verificación rápida: antes de aceptar "terminé" del
  agente, responde estas 10 preguntas. Ver M6 §6.5.

  Principio: la verificación que cuenta no es la que hace el agente sobre
  sí mismo. Si la respuesta a la mayoría de estas preguntas es "porque el
  agente lo dice", el output NO está verificado.

  Cómo usar: recórrelo antes de dar por buena una tarea del agente. Si
  fallan las preguntas 1-4 (los cimientos), lo demás no importa.
-->

# ¿Es verificable? — 10 preguntas antes de aceptar el output del agente

> **Tarea:** [referencia]
> **Evaluador:** [tú / el revisor humano]

## Cimientos (si fallan, lo demás no importa)

- [ ] **1. ¿Un sensor computacional independiente confirmó los tests?**
  No "el agente dice que pasan"; un comando que tú o el CI corrieron,
  con output textual y numérico. Si no, es phantom verification (M6 §6.1.1).

- [ ] **2. ¿El reporte tiene números y nombres, no marcas de check?**
  "47 passed, 0 failed, coverage 82%" es verificable; "tests OK ✓" es
  hollow report (M6 §6.1.2).

- [ ] **3. ¿Los tests prueban lo que la spec pide?**
  ¿Corresponden a los AC de la spec, o son tests genéricos que el agente
  inventó? Si no mapean a AC, no verifican la intención. (M6 §6.1.3.)

- [ ] **4. ¿El agente NO modificó los tests para que pasen?**
  Compara el diff de `tests/` contra `src/`. Si cambió mucho test y poco
  código en un "fix", sospecha test gaming. (M6 §6.6.)

## Alcance honesto

- [ ] **5. ¿El reporte dice qué NO se verificó?**
  Sin esto, "todo verde" es hueco. La parte 2 del schema DONE/VERIFIED
  debe listar lo que quedó fuera. (M6 §6.5.)

- [ ] **6. ¿Los supuestos del agente están declarados?**
  Lo que el agente asumió sin confirmar debe estar en el reporte, para
  que el revisor pueda validarlos o rechazarlos. (M6 §6.5.)

## Reproducibilidad

- [ ] **7. ¿El entorno se reproduce desde cero con init.sh?**
  Si "a mí me funciona" pero el CI falla, hay environment mismatch. El
  remedio es reproducibilidad, no más tests. (M6 §6.7.)

- [ ] **8. ¿Las dependencias nuevas están en el lockfile?**
  El agente que usó una lib no declarada produce verde local y rojo en
  CI. Verifica que el diff incluye el lockfile actualizado.

## Juicio humano

- [ ] **9. ¿La parte 4 del reporte prioriza qué revisar?**
  El top-1 a top-3 de riesgo que merece tus ojos. Si el agente no
  priorizó, no te ayudó a decidir dónde mirar. (M6 §6.5.)

- [ ] **10. ¿Lo irreducible pasó por decisión humana?**
  Trade-offs de dominio, cambios de invariante, decisiones de producto:
  esas no las decide el agente ni el sensor. ¿Las marcó como pendientes de
  tu revisión o las asumió solo?

---

## Veredicto

- **8-10 "sí":** output verificado. Acepta.
- **5-7 "sí":** parcial. Verifica lo que falló antes de aceptar.
- **<5 "sí":** NO aceptes. El output NO está verificado, solo declarado.

<!--
  Recordatorio: este checklist no reemplaza al pipeline de CI (M6 §6.8).
  Es lo que TÚ aplicas antes de confiar, encima del gate mecánico. Si el CI
  ya bloquea las preguntas 1-4, concéntrate en las 5-10 (las que requieren
  juicio humano).
-->