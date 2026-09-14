<!--
  mcp-server-template/ — Esqueleto de un servidor MCP (Python, vía SDK oficial)
  --------------------------------------------------------------------------------
  Punto de partida para construir un servidor MCP propio. Ver M5 §5.5.

  Cuándo construir uno propio (los tres deben cumplirse):
  1. El flujo se repite 3+ veces en tu organización (amortizas el costo).
  2. Requiere lógica de integración (composición, estado, validación), no
     solo "llamar a una API".
  3. Múltiples equipos/tools lo quieren (el estándar vale por reutilización).

  Cómo usar este esqueleto:
  1. Copia este directorio completo (README, `server.py`, `pyproject.toml`)
     y renómbralo.
  2. Reemplaza `<work-tracker>` por el nombre de tu integración (en
     `server.py` y en `pyproject.toml`).
  3. Decide primitivas con templates/mcp-primitives-cheatsheet.md.
  4. Instala con `pip install -e .`, implementa, y prueba con un cliente
     real (Claude Code) antes de declararlo listo.
  Stack: Python + MCP Python SDK (mcp). Es el más maduro y documentado.
-->

# MCP Server Template — <work-tracker>

> **Qué expone:** [una línea: qué capacidades da este server. Ej:
> "Lectura de estado de deploys y re-deploy controlado del servicio X."]
> **Transporte:** [stdio (local) | Streamable HTTP (remoto)]
> **Cliente objetivo:** cualquier cliente MCP-compatible (Claude Code, etc.)

## Primitivas que expone (decídelas antes de programar)

| Primitiva | Nombre | Descripción | Por qué esta primitiva |
|-----------|--------|-------------|------------------------|
| Tool | `get_deployment_status` | Devuelve el estado del último deploy. | Acción con side effect (loguea la consulta). |
| Tool | `redeploy` | Re-lanza un deploy (con confirmación humana). | Escritura sensible; requiere gate. |
| Resource | `deployments://latest` | Estado del último deploy referenciable. | Dato, no acción. |
| Prompt | `/triage-deploy-failure` | Flujo: diagnostica y propone fix. | Flujo que el usuario dispara. |

> Revisa la decisión con `templates/mcp-primitives-cheatsheet.md`. Si pusiste
> todo como Tool, casi seguro alguna debería ser Resource.

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .            # instala deps (mcp) desde pyproject.toml
```

`pyproject.toml` declara la dependencia `mcp` (SDK oficial de Python),
que a su vez trae `pydantic`. Ejecuta el server con:

```bash
python server.py
```

## `server.py`

El esqueleto es código real en este directorio: [`server.py`](server.py).
No lo dupliques aquí; ábrelo y edítalo directamente. Contiene, con el
patrón de cada primitiva:

- **Tool de lectura con side effect** — `get_deployment_status`.
- **Tool de escritura sensible** — `redeploy` (idempotente por
  `idempotency_key`, con confirmación humana en el host).
- **Resource** — `deployments://latest/{service}` (dato, no acción).
- **Prompt** — `/triage-deploy-failure` (flujo que el usuario dispara).

Cada función es un TODO marcado con la llamada real a tu integración;
las descripciones (docstrings) son lo que el modelo lee para decidir
cuándo invocar: escríbelas para el modelo, no para ti. Corre con
`python server.py` (stdio para uso local; para remoto, cambia al
transporte HTTP del SDK).

## Conectar a Claude Code (ejemplo de config)

Agrega a `.claude/settings.json` (o el mecanismo equivalente de tu tool):

```json
{
  "mcpServers": {
    "work-tracker": {
      "command": "python",
      "args": ["server.py"],
      "cwd": "<ruta-absoluta-a-este-directorio>"
    }
  }
}
```

## Seguridad (no opcional)

- **Credenciales:** las credenciales de los servicios *upstream* viven en
  el server (env vars), pero nunca se exponen al modelo ni se devuelven
  en tool results. Las credenciales del usuario final las maneja el host
  (OAuth 2.1 en transportes remotos), con scopes reducidos. Ver M5 §5.2.6.
- **Scopes mínimos:** si el server toca prod, el token debe tener el
  alcance más chico que permita el flujo. No "admin" si basta "read+deploy".
- **Roots:** acota qué servicios/rutas puede tocar el server.
- **Escrituras sensibles (redeploy, delete):** requieren confirmación
  humana en el host. No delegues esa decisión al modelo solo.
- **Tool poisoning:** revisa que las descripciones digan lo que la tool
  hace, sin instrucciones ocultas. Si consumes servers de terceros,
  revísalos antes de conectar.

## Checklist antes de declarar listo

- [ ] Cada primitiva es la correcta (Tool para acciones, Resource para datos).
- [ ] Schemas con nombres verbo+objeto, descripciones, enums, unidades.
- [ ] Escrituras idempotentes o marcadas explícitamente como no idempotentes.
- [ ] Errores estructurados (JSON), no strings libres.
- [ ] Credenciales upstream solo en el server, nunca en tool results; usuario final vía host (OAuth); scopes mínimos; roots acotados.
- [ ] Probado con un cliente real (Claude Code): el modelo invoca bien.
- [ ] Documentado en el system of record del harness (qué expone, permisos, qué NO hace).

## Referencias

- M5 §5.2 — MCP, arquitectura y primitivas.
- M5 §5.5 — cuándo construir un server propio.
- `templates/mcp-primitives-cheatsheet.md` — decisión Tool/Resource/Prompt/Sampling.
- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk