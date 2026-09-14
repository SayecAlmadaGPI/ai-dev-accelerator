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