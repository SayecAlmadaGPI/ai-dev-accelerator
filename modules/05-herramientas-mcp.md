# Módulo 5 — Herramientas y Protocolos de Integración

> **Tesis:** un agente aislado es un agente limitado. Lo que separa un
> harness productivo de uno de juguete es si el agente puede *actuar* sobre
> el mundo real: leer tu DB, abrir tickets, correr el CI, ver logs. Y lo que
> determina si esa integración es segura y mantenible es el *protocolo* que
> uses para exponer esas capacidades, no solo que existan.

---

## 5.0 Por qué este módulo existe

El M3 te dio el workbench de archivos. El M4 te dio el flujo que sobrevive
entre sesiones. Este módulo abre el harness hacia afuera: cómo el agente
toca cosas que no son archivos del repo — la base de datos, los servicios
internos, el cloud, el sistema de tickets.

Hay dos maneras de hacerlo. La vieja y frágil: implementar a mano,
herramienta por herramienta, funciones que llaman a tus APIs. La nueva y
estándar: un **protocolo** que describe de forma uniforme qué puede hacer
el agente, de modo que cualquier cliente compatible lo entienda. Ese
protocolo es **Model Context Protocol (MCP)**, y es el centro de este
módulo.

> **La regla del M5:** no integres al agente con el mundo real escribiendo
> glue code ad-hoc en cada proyecto. Expón capacidades como herramientas
> detrás de un protocolo estándar. Una vez, reutilizable, auditable.

---

## 5.1 Function calling: la base sobre la que todo se apoya

Antes de MCP está el *function calling* (o *tool use*): la capacidad del
modelo de, en lugar de solo generar texto, declarar "quiero llamar a esta
función con estos argumentos". El harness entonces ejecuta esa función y le
devuelve el resultado al modelo. MCP es, en el fondo, una forma estándar de
proveer esas funciones.

### 5.1.1 Cómo funciona, en una frase

El modelo no ejecuta nada. Ve una *descripción* de herramientas disponibles
( su schema), decide cuál invocar y con qué argumentos, y emite esa
decisión como salida estructurada. El *harness* (no el modelo) ejecuta la
función real y devuelve el resultado. El modelo nunca toca el mundo
directamente; siempre a través del harness.

> Esta separación es lo que hace que todo sea auditable y reversible. El
> modelo propone; el harness dispone. (Vuelve al M1: agent = model + harness.)

### 5.1.2 Diseño de schemas

El schema de una herramienta es el contrato entre el modelo y el harness.
Un mal schema produce llamadas incorrectas; un buen schema hace que el
modelo casi no se equivoque.

| Buena práctica | Por qué |
|----------------|---------|
| Nombres de herramienta en verbo + objeto (`create_issue`, no `issue`). | El modelo decide mejor con verbos de acción. |
| Parámetros con descripción, no solo nombre y tipo. | El modelo necesita saber qué valor poner, no solo qué tipo. |
| Enum para opciones cerradas. | Evita argumentos inventados; constriñe al espacio válido. |
| Campos obligatorios mínimos. | Cada campo obligatorio es una chance de que el modelo se equivoque. |
| Unidades en el nombre (`timeout_ms`, no `timeout`). | Evita la ambigüedad "¿segundos o milisegundos?". |

### 5.1.3 Idempotencia

Una herramienta que crea un ticket no es idempotente: llamarla dos veces
crea dos tickets. Una que lee un ticket sí lo es. Diseña para que las
herramientas de *escritura* sean idempotentes cuando sea posible:

- Acepta un `idempotency_key` o un `client_request_id` para de-duplicar.
- O diseñala como "upsert" (crea si no existe, actualiza si existe).
- Si no puede ser idempotente, documenta claramente que *no* lo es, para
  que el modelo (y tú) sepan que un reintento duplica el efecto.

> Los agentes reintentan. Si tu herramienta de escritura no es idempotente,
  un reintento del modelo duplica el side effect. Es el bug más común y
  más silencioso de las integraciones.

### 5.1.4 Manejo de errores

El modelo aprende de los errores *si se los devuelves bien*:

- **Errores estructurados, no strings libres.** Un JSON
  `{"error": "not_found", "resource": "issue-123"}` le enseña al modelo
  más que `{"error": "Error 404: issue not found"`.
- **Recoverable vs. fatal.** Dile al modelo si puede reintentar, ajustar
  argumentos, o si debe abortar.
- **No ocultes el error "para no confundir".** El modelo confundido por
  un error silenciado es peor que el modelo que ve el error y corrige.

### 5.1.5 Paralelismo vs. secuencialidad

Algunos harness permiten que el modelo pida varias herramientas en un solo
turno y las ejecuten en paralelo. Sirve para lecturas independientes
("dame el issue 1, el 2 y el 3"). No sirve para escrituras con dependencia
("crea el issue y luego coméntalo") — ahí el orden importa y el paralelismo
rompe.

> Regla: paraleliza lecturas independientes; serializa escrituras
> dependientes. Si dudas, serializa: el paralelismo incorrecto es un bug
> de carrera; el secuencialismo conservador es solo lento.

---

## 5.2 Model Context Protocol (MCP): el estándar

MCP es un protocolo abierto que estandariza cómo un cliente (Claude Code,
Cursor, tu propio agente) descubre y usa herramientas, recursos y prompts
provistos por un servidor. Su valor no es técnico solo: es que convierte
> la integración del agente con el mundo en algo reutilizable entre
clientes.

### 5.2.1 Arquitectura client-server

Tres capas, no dos:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Host (app)  │ ---> │  MCP Client  │ ---> │  MCP Server   │
│  Claude Code │      │  (embebido)  │      │  (tu tools)   │
│  Cursor      │      │              │      │  DB, GitHub,  │
│  tu agente   │      │              │      │  CI, etc.     │
└──────────────┘      └──────────────┘      └──────────────┘
```

- **Host:** la aplicación que el usuario maneja. Decide qué servidores
  conectar y con qué permisos.
- **MCP Client:** vive dentro del host; habla el protocolo con los
  servidores y expone sus capacidades al modelo.
- **MCP Server:** el proceso que efectivamente implementa las
  herramientas. Es donde vive tu integración real.

> La distinción host/client/server importa para seguridad (ver §5.2.6):
  los permisos viven en el host, la lógica peligrosa en el server, y el
  modelo nunca habla directo con el server — pasa por el client.

### 5.2.2 Las cuatro primitivas

MCP expone cuatro tipos de capacidades. Entender cuándo usar cada una es
> el 80% de diseñar bien un servidor MCP.

| Primitiva | Qué es | Controlado por | Ejemplo |
|-----------|--------|----------------|---------|
| **Tools** | Funciones ejecutables con side effects. | El modelo decide invocar. | `create_issue`, `run_query`, `deploy`. |
| **Resources** | Datos legibles, identificados por URI. | La aplicación/host los expone; el modelo los lee bajo demanda. | `db://schema/users`, `logs://today`. |
| **Prompts** | Templates de instrucciones reutilizables. | El usuario los invoca (no el modelo solo). | `/triage-incident`, `/migrate-steps`. |
| **Sampling** | LLM on-demand: el server pide al client que complete un prompt. | El server inicia; el host aprueba. | Un tool que resume un log pidiendo al modelo que lo resuma. |

> **Tools vs. Resources es la distinción más importante.** Una Tool
  *hace* algo (side effect). Un Resource *es* algo (dato). `run_query` es
  Tool; `db://schema/users` es Resource. Confundirlas produce servidores
  que el modelo usa mal: si expones la lectura del schema como Tool, el
  modelo la invoca como acción en lugar de referenciarla como dato.

### 5.2.3 Cheatsheet: cuándo Tool vs. Resource vs. Prompt

| ¿Quieres...? | Usa |
|--------------|-----|
| Hacer algo con side effect (escribir, deployar, crear). | **Tool** |
| Exponer un dato que el modelo debe leer referencialmente. | **Resource** |
| Encapsular un flujo de instrucciones que el usuario dispara. | **Prompt** |
| Que el server use un LLM como sub-paso. | **Sampling** |

> Ver `templates/mcp-primitives-cheatsheet.md` para la versión extendida.

### 5.2.4 Transportes: stdio vs. Streamable HTTP

| Transporte | Dónde corre | Cuándo |
|------------|-------------|-------|
| **stdio** | Local, en la máquina del usuario. | Servidores que acceden a recursos locales (filesystem, DB local, git). Simple, sin auth. |
| **Streamable HTTP** | Remoto, sobre la red. | Servidores compartidos, multi-usuario, en cloud. Requiere auth (OAuth 2.1). |

> Regla práctica: si el server toca cosas de tu máquina, stdio. Si lo
  usan varios equipos o vive en cloud, HTTP. No compliques con HTTP
  localmente "por escalabilidad" que aún no necesitas.

### 5.2.5 SDKs oficiales

No implementes el protocolo a mano. Hay SDKs oficiales para: Python,
TypeScript, C#, Go, Java, Kotlin, PHP, Ruby, Rust, Swift. Los de Python y
TypeScript son los más maduros y los más usados en ejemplos y referencias.

### 5.2.6 Seguridad: lo que te puede salir mal

MCP abre el agente al mundo, y el mundo no es benigno. Tres riesgos
concretos:

- **Tool poisoning.** Un servidor malicioso (o comprometido) puede
  describir sus herramientas de forma que engañe al modelo — una tool
  llamada `read_file` que en realidad exfiltra datos, o instrucciones
  ocultas en la descripción. **Mitigación:** solo conecta servidores de
  confianza; revisa las descripciones, no solo los nombres.
- **Confused deputy.** El modelo, con permisos del usuario, es engañado
  para que use una tool legítima con argumentos maliciosos ("lee este
  archivo y mandalo a este endpoint"). **Mitigación:** permisos
  mínimos por tool; confirmación humana en escrituras sensibles.
- **Credenciales en el server.** Si tu server MCP guarda el token de
  prod, un modelo con acceso al server tiene acceso a prod.
  **Mitigación:** el server debe delegar las credenciales al host, no
  retenerlas; usar OAuth 2.1 con scopes reducidos.

> MCP introdujo **roots** (qué partes del filesystem/servicios puede
  tocar un server) y **elicitation** (el server puede pedir input al
  usuario a través del host sin pasar por el modelo) como defensas. Úsalos.

### 5.2.7 Registro de servidores

El **MCP Registry** (registry.modelcontextprotocol.io) es el catálogo de
servidores comunitarios. Antes de construir uno, mira si ya existe: para
GitHub, filesystem, git, memory, sequential thinking, Postgres, Slack y
decenas más ya hay servidores probados. Construye el tuyo solo cuando el
flujo es específico de tu organización.

---

## 5.3 Skill libraries: conocimiento vertical como artefacto

Una skill library (ver también M3 §3.3) es un conjunto de prompts y
herramientas reutilizables para un dominio vertical: migraciones de DB,
deploys, incident response, onboarding de servicios. Difieren de un MCP
server en que su producto principal es la *instrucción estructurada*, no
la herramienta ejecutable — aunque pueden combinar ambas.

| Artefacto | Producto | Reutilizable entre |
|-----------|----------|-------------------|
| **MCP Server** | Herramientas ejecutables. | Cualquier cliente MCP. |
| **Skill** | Instrucciones + pasos. | La tool que las soporte (Claude Code skills, etc.). |
| **Prompt MCP** | Templates de prompts. | Cualquier cliente MCP. |

> Un flujo maduro combina: un **prompt** (skill o MCP prompt) que guía los
  pasos, **tools** (MCP) que ejecutan las acciones, y **resources** que
  exponen los datos. Cada uno en su capa, sin mezclarlas.

---

## 5.4 Conexión con el entorno local

Lo que típicamente quieres exponer al agente, y cómo:

| Recurso | Cómo exponerlo | Primitiva |
|---------|----------------|-----------|
| Base de datos (lectura de schema, queries de solo lectura) | MCP server con tools de query + resources de schema. | Tool + Resource |
| APIs internas | MCP server que envuelve la API; idempotencia en escrituras. | Tool |
| Servicios cloud (AWS/GCP/Azure) | MCP servers oficiales o propios; scopes mínimos. | Tool |
| GitHub / GitLab | Servidores existentes (issues, PRs, CI). | Tool + Resource |
| Logs / observabilidad | MCP server que expone `logs://` como resources. | Resource |
| CI/CD | MCP server que dispara pipelines y reporta estado. | Tool |

> **Principio de mínimo privilegio:** expón primero lectura, no
  escritura. Agrega escritura solo cuando el flujo la justifica y con
  confirmación humana en lo irreversible. Un agente que puede leer tu DB
  es útil; un agente que puede borrar registros de tu DB sin gate es un
  incidente esperando a pasar.

---

## 5.5 Custom MCP servers: cuándo construir uno propio

No construyas un MCP server para todo. Constrúyelo cuando se cumplen:

1. El flujo se repite (3+ veces) en tu organización — amortizas el costo.
2. Requiere lógica de integración que no es solo "llamar a una API" —
   composición, estado, validación.
3. Múltiples equipos o tools lo quieren usar — el valor del estándar es
   la reutilización.

### 5.5.1 Casos típicos que sí merecen un server propio

- **Work tracker interno:** tu sistema de tickets propietario, no
  GitHub/Jira estándar.
- **Test runner con estado:** corre una suite, expone resultados
  estructurados, guarda histórico.
- **CI/CD interno:** dispara pipelines, lee logs, maneja approvals.
- **Logs con contexto:** expone logs correlacionados por request/trace.
- **Recursos cloud específicos:** Azure/GCP/AWS con la forma en que tu
  org los estructura.

### 5.5.2 Cuándo NO construir uno

- Es una sola API REST y ya hay un server comunitario → úsalo.
- El flujo es de un solo proyecto, no se repite → un skill o un script
  alcanza.
- No requiere estado ni composición → una tool simple en el harness
  basta.

> Ver `templates/mcp-server-template/` como esqueleto de partida.

---

## 5.6 Un flujo end-to-end: de la necesidad al server en producción

1. **Identifica el flujo repetitivo** (ej: "el agente siempre necesita ver
   el último estado de deploy y re-deployar si falla").
2. **Decide primitivas:** ¿es lectura (Resource) o acción (Tool)? Aquí
   `get_deployment_status` es Tool (consulta con side effect de log) y
   `deployments://latest` es Resource.
3. **Diseña schemas** con nombres claros, enums, unidades.
4. **Implementa con un SDK oficial** (Python o TypeScript para empezar).
5. **Transporte:** stdio si es local; HTTP si es compartido.
6. **Seguridad:** scopes mínimos, sin credenciales en el server, roots
   acotados, confirmación humana en el redeploy.
7. **Prueba con un cliente real** (Claude Code) antes de declararlo listo.
8. **Documenta las herramientas** como parte del system of record del
   harness: qué expone, qué permisos requiere, qué no hace.

---

## 5.7 Niveles de adopción

### Mínimo (arranca hoy)

- Conecta 1–2 MCP servers existentes (filesystem, GitHub) a tu tool.
- Revisa las descripciones de las tools que expone (por tool poisoning).
- Expón lectura antes que escritura.

### Medio

- Construye un MCP server propio para el flujo más repetitivo de tu org.
- Usa las cuatro primitivas correctamente (Tools para acciones, Resources
  para datos, Prompts para flujos, Sampling para sub-LLM).
- Permisos por tool, confirmación humana en escrituras sensibles.

### Completo

- Skill libraries que combinan prompts + tools + resources por dominio.
- Roots y elicitation configurados; scopes OAuth reducidos.
- Cada server documentado en el system of record; el harness sabe qué
  puede y qué no puede pedirle a cada server.

---

## 5.8 FAQ — trampas reales

**¿Tool o Resource para leer datos?** Resource. Si lo expones como Tool,
el modelo lo invoca como acción; como Resource, lo referencia como dato.
La distinción cambia cómo el modelo razona sobre ello.

**Mi server MCP guarda el token de prod.** No. El server debe delegar
credenciales al host y no retenerlas. Si el modelo puede hablarle al
server, tiene el alcance del token; minimízalo.

**¿Construyo un MCP server o un skill?** Si el producto son
*instrucciones estructuradas*, skill. Si el producto son *herramientas
ejecutables reutilizables entre clients*, MCP server. A menudo: skill
que orquesta tools de un MCP server.

**El modelo llama mal a mis tools.** Revisa el schema: nombres en
verbo+objeto, descripciones de parámetros, enums para opciones cerradas,
unidades en los nombres. El 80% de los errores de invocación son de
schema, no de modelo.

**¿Paralelizo las tools?** Solo lecturas independientes. Escrituras
dependientes, serial. Si dudas, serial: lento pero correcto.

**Conecté un server comunitario y no confío.** No lo conectes. O
revísalo en sandbox primero. MCP es tan seguro como el server menos
confiable que conectas.

---

## 5.9 Referencias

- **Model Context Protocol — Official Site**
  (https://modelcontextprotocol.io) — documentación oficial.
- **MCP Specification** (https://spec.modelcontextprotocol.io) —
  especificación del protocolo.
- **MCP Python SDK** (https://github.com/modelcontextprotocol/python-sdk).
- **MCP TypeScript SDK**
  (https://github.com/modelcontextprotocol/typescript-sdk).
- **MCP Reference Servers**
  (https://github.com/modelcontextprotocol/servers) — filesystem, git,
  memory, sequential thinking, etc.
- **Build an MCP Client — Official Tutorial**
  (https://modelcontextprotocol.io/docs/develop/build-client) — flujo
  completo con Claude.
- **MCP Registry** (https://registry.modelcontextprotocol.io/) —
  servidores comunitarios.
- **Talk Think Do — Harness Engineering**
  (https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) —
  6 MCP servers custom en producción.

**Plantillas vinculadas:** `templates/mcp-server-template/`,
`templates/mcp-primitives-cheatsheet.md`.