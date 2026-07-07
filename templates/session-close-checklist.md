<!--
  session-close-checklist.md — Cierre de sesión en 7 pasos
  --------------------------------------------------------
  Checklist para dejar el estado limpio al cerrar una sesión de trabajo
  con un agente. Ver M4 §4.6 y §4.3.

  Principio: una sesión termina en un commit verde + handoff. No "cuando
  termine"; al cerrar. Si no llegaste a verde, documéntalo en el handoff
  y deja el commit igual (marcado como WIP si tu convención lo permite),
  pero no cierres sin un punto reproducible.

  Cómo usar: recórrelo de arriba a abajo. No lo dejes "para mañana": la
  próxima sesión depende de que esto esté hecho.
-->

# Checklist de cierre de sesión

> **Proyecto:** [nombre]
> **Sesión:** [fecha / identificador]
> **Spec activa:** [`docs/specs/<nombre>.md`](ruta)

- [ ] **1. Verificación mecánica en verde.**
  Tests + typecheck + lint pasan. No es "el agente dice que terminó"; es
  el sensor computacional el que lo dice. Si algo está rojo, no es cierre
  todavía.

- [ ] **2. Commit por unidad coherente.**
  No un mega-commit con 8 features; no un commit por línea. Un commit por
  feature de la lista o grupo coherente de tests. Cada commit en verde.

- [ ] **3. Mensaje de commit útil.**
  Qué hizo, qué verificó, qué NO hizo (si quedó a medias). El mensaje es
  parte del system of record: `git log` se lee para reconstruir estado.

- [ ] **4. `claude-progress.md` actualizado.**
  La bitácora refleja el último estado. La última entrada es la verdad.

- [ ] **5. `handoff.md` escrito con las 5 partes.**
  - [ ] Spec activa (referencia)
  - [ ] Progreso real (DONE / en progreso / sin tocar)
  - [ ] **Bloqueantes** (lo más valioso; lo que más se omite)
  - [ ] Decisiones tomadas (por qué el camino A y no el B)
  - [ ] SHA del último commit verde + comando para verificar

- [ ] **6. `state.json` / `.planning/` consistente con el handoff.**
  Si contradicen, gana el archivo. El handoff debe apuntar al archivo, no
  duplicarlo.

- [ ] **7. `git status` limpio (o explícitamente WIP).**
  No dejes cambios sin commitear "para después". Si son WIP intencionales,
  commitea con un commit marcado como tal y documéntalo en el handoff.

---

## Resultado del cierre

- **Último SHA verde:** [hash]
- **Próximo paso para la siguiente sesión:** [una línea]
- **Bloqueantes heredados:** [lista corta o "ninguno"]

<!--
  Si llegaste acá y el paso 1 está en rojo, NO marques el checklist como
  hecho. Vuelve al paso 1. Un handoff sobre rojo le dice a la próxima
  sesión que arranque debuggeando, no construyendo.
-->