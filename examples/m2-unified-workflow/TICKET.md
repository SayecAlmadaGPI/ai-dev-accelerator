# Ticket de origen

> **ID:** PROJ-142
> **Título:** Filtrar lista de proyectos por estado y fecha
> **Reportado por:** [PM]
> **Prioridad:** Media
> **Fecha:** 2026-07-02

---

## Descripción (tal como llegó)

> "Como gestor de proyectos, quiero poder filtrar la lista de proyectos por
> estado y por rango de fechas, para encontrar más rápido los que me
> interesan. Hoy la lista muestra todo junto y es inmanejable cuando hay
> más de 50 proyectos."

## Cómo llegó (materia prima)

Esta es la entrada típica: **vaga, ambigua y con supuestos ocultos**. Si le
pasas esto directo a un agente, va a adivinar:
- ¿"Fecha" es de creación, de última actualización, o de deadline?
- ¿El rango es inclusivo en ambos extremos?
- ¿El filtro va en la URL de un endpoint existente o en uno nuevo?
- ¿Qué pasa si no se pasa ningún filtro? ¿Devuelve todo o error?
- ¿Los estados son un enum fijo o vienen de DB?

Sin spec, cada una de esas decisiones se toma en silencio, dentro del
contexto del agente, y nadie las revisa. Esa es la receta para el
scope creep y para los AC que "pasan" pero testean la cosa equivocada.

## Qué hace SDD con esto

Lo transforma en **`spec.md`** (el contrato), que luego alimenta:
- **GSD** para planearlo en milestones/phases/tasks, y
- **Superpowers** para ejecutarlo con TDD y subagentes.

Los archivos siguientes muestran cada artefacto del pipeline.