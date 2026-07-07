<!--
  mcp-primitives-cheatsheet.md — Cuándo usar Tool vs. Resource vs. Prompt vs. Sampling
  ----------------------------------------------------------------------------------
  Hoja de decisión rápida para diseñar un servidor MCP. Ver M5 §5.2.2 y §5.2.3.

  La distinción Tool vs. Resource es la que más se confunde. Recuérdala así:
  una Tool HACE algo (side effect); un Resource ES algo (dato). El resto
  fluye de ahí.

  Uso: mantenla abierta mientras diseñas un server. Cuando dudes entre dos
  primitivas, baja a la tabla de decisión y responde la pregunta de la
  columna izquierda.
-->

# Cheatsheet — Primitivas de MCP

> **Tesis:** la mitad de los servidores MCP mal diseñados lo están porque
> eligieron mal la primitiva. Un dato expuesto como Tool se invoca como
> acción; expuesto como Resource se referencia como dato. El modelo
> razona distinto según la primitiva.

## Tabla de decisión (una pregunta → una primitiva)

| Si quieres... | Entonces usa | Porque |
|---------------|--------------|--------|
| **Hacer** algo con side effect (escribir, crear, deployar, borrar). | **Tool** | Las Tools son acciones; el modelo las invoca cuando decide actuar. |
| **Exponer un dato** que el modelo debe leer referencialmente (schema, log, config). | **Resource** (URI) | Los Resources son datos; el modelo los referencia, no los "ejecuta". |
| **Encapsular un flujo de instrucciones** que el usuario dispara a propósito (triage, migración). | **Prompt** | Los Prompts los dispara el usuario, no el modelo solo; son recetas con slots. |
| **Que el server use un LLM** como sub-paso (resumir un log, clasificar un ticket). | **Sampling** | El server pide al host que complete un prompt; el host aprueba. |

## Anti-patrones comunes

| Antipatrón | Por qué está mal | Corrección |
|-----------|------------------|------------|
| Exponer `get_user_schema` como Tool. | El schema es un dato, no una acción. El modelo la invocará como "algo que hago" en lugar de "algo que consulto". | Exponlo como Resource: `db://schema/users`. |
| Exponer `read_file` como Resource cuando debe poder tomar argumentos dinámicos. | Los Resources son identificables por URI; los args dinámicos complejos no encajan. | Si necesita args complejos, es Tool. |
| Poner instrucciones de flujo dentro de la descripción de una Tool. | El modelo las obey a medias; las instrucciones largas diluyen la tool. | Saca el flujo a un Prompt; deja en la Tool solo su contrato. |
| Usar Sampling para lógica que podrías hacer en el server. | Sampling cuesta tokens y red; el server debería computar lo determinista. | Reserva Sampling para lo que sí necesita razonamiento. |

## Cuándo combinar (patrón sano)

Un flujo maduro a menudo usa las cuatro, en capas:

```
Prompt (el usuario dispara el flujo)
  └─> Tools (ejecutan las acciones con side effect)
        └─> Resources (exponen los datos que las Tools consumen/producen)
              └─> Sampling (un sub-paso que sí necesita razonamiento del LLM)
```

- **Ejemplo migración de DB:** Prompt `/migrate-steps` → Tool `run_migration` →
  Resource `db://schema/current` → Sampling "clasifica el warning de este
  log".

## Decisiones rápidas (preguntas frecuentes)

- **"¿Lectura de la DB es Tool o Resource?"** Resource para el schema
  (estático, referenciable). Tool para queries ad-hoc (argumentos dinámicos).
- **"¿Logs son Resources?"** Sí: `logs://today`, `logs://service/X`. El
  modelo los referencia y lee bajo demanda.
- **"¿Deploy es Tool o Prompt?"** La *acción* de deployar es Tool; el
  *flujo* "cómo decidir qué deployar" es Prompt.
- **"¿Necesito Sampling?"** Solo si un sub-paso del server requiere
  razonamiento de LLM. Si es lógica determinista, hazlo en el server.

## Referencia

- M5 §5.2 — arquitectura client-server y las cuatro primitivas.
- M5 §5.3 — skill libraries (cuándo Prompt encapsula un flujo).
- `templates/mcp-server-template/` — esqueleto con ejemplos de cada primitiva.