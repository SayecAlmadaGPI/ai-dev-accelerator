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
  1. Copia este directorio y renómbralo.
  2. Reemplaza <work-tracker> por el nombre de tu integración.
  3. Decide primitivas con templates/mcp-primitives-cheatsheet.md.
  4. Implementa, prueba con un cliente real (Claude Code) antes de declararlo listo.

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
pip install "mcp[cli]"
```

## `server.py` — esqueleto

```python
"""
MCP server: <work-tracker>
Ver M5 §5.5 y templates/mcp-primitives-cheatsheet.md para la decisión de
primitivas.
"""
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("<work-tracker>")

# --- Tool: acción con side effect ---
@mcp.tool()
def get_deployment_status(service: str) -> dict:
    """Devuelve el estado del último deploy del servicio indicado.

    Args:
        service: nombre del servicio, ej "billing-api".
    """
    # TODO: reemplazar por la llamada real a tu sistema de deploys.
    return {"service": service, "status": "healthy", "version": "1.4.2"}

# --- Tool: escritura sensible (idempotente + gate humano en el host) ---
@mcp.tool()
def redeploy(service: str, idempotency_key: str) -> dict:
    """Re-lanza el deploy de un servicio. Idempotente por idempotency_key.

    Requiere confirmación humana en el host antes de ejecutarse.
    Args:
        service: servicio a re-deployar.
        idempotency_key: clave para de-duplicar reintentos (UUID por intento).
    """
    # TODO: llamar a tu pipeline. Usar idempotency_key para de-duplicar.
    return {"service": service, "redeployed": True, "key": idempotency_key}

# --- Resource: dato referenciable ---
@mcp.resource("deployments://latest/{service}")
def latest_deployment(service: str) -> str:
    """Expone el estado del último deploy como Resource (dato, no acción)."""
    # TODO: devolver el payload crudo referenciable.
    return f"latest deployment of {service}: healthy@1.4.2"

# --- Prompt: flujo que el usuario dispara ---
@mcp.prompt()
def triage_deploy_failure(service: str) -> str:
    """Flujo de diagnóstico cuando un deploy de `service` falló."""
    return f"""
Estás diagnosticando un deploy fallido de {service}.
Pasos:
1. Lee deployments://latest/{service} para el estado actual.
2. Usa get_deployment_status para el detalle.
3. Propón un fix con base en el error; NO redeploy sin confirmación.
"""

if __name__ == "__main__":
    # stdio para uso local. Para remoto, cambia a HTTP transport del SDK.
    mcp.run(transport="stdio")
```

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

- **Credenciales:** el server NO retiene tokens. Delega credenciales al
  host (env vars inyectadas, OAuth vía el host). Ver M5 §5.2.6.
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
- [ ] Sin credenciales retenidas; scopes mínimos; roots acotados.
- [ ] Probado con un cliente real (Claude Code): el modelo invoca bien.
- [ ] Documentado en el system of record del harness (qué expone, permisos, qué NO hace).

## Referencias

- M5 §5.2 — MCP, arquitectura y primitivas.
- M5 §5.5 — cuándo construir un server propio.
- `templates/mcp-primitives-cheatsheet.md` — decisión Tool/Resource/Prompt/Sampling.
- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk