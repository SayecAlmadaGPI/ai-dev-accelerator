#!/usr/bin/env bash
# init.sh — Script de inicialización determinista del entorno
# -------------------------------------------------------------------
# GSD (M2) lo formula bien: la inicialización es una fase separada,
# repetible y determinista. El agente no "descubre" el entorno; corre un
# script que lo deja en un estado conocido. Ver M3 §3.5.
#
# Principio: si un paso puede fallar de forma silenciosa, haz que aborte.
# `set -euo pipefail` es la base; los checks explícitos son el refuerzo.
#
# Uso:
#   bash init.sh            # setup completo: instala deps y corre sensores
#   bash init.sh --check    # verificación pura de entorno: runtime presente
#                           # y node_modules (avisa si falta, no falla).
#                           # NO corre typecheck/tests: sin deps
#                           # instaladas fallarían siempre en frío. En CI,
#                           # el par canónico es: npm ci && bash init.sh --check

set -euo pipefail

# Colores para output legible (opcional, no dependas de que el terminal los soporte).
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { printf "${GREEN}[init]${NC} %s\n" "$1"; }
warn() { printf "${YELLOW}[init]${NC} %s\n" "$1"; }
die()  { printf "${RED}[init][ERROR]${NC} %s\n" "$1" >&2; exit 1; }

# -------------------------------------------------------------------
# 1. Versiones de runtime
# -------------------------------------------------------------------
# Reemplaza con las versiones reales del proyecto. Un entorno con la versión
# equivocada produce bugs que parecen del agente pero son del runtime.
check_runtime() {
  log "Verificando runtime..."

  command -v node >/dev/null 2>&1 || die "node no está instalado."
  command -v npm >/dev/null 2>&1 || die "npm no está instalado."

  # Ejemplo de pinneo de versión. Ajusta a tu stack real.
  local node_major
  node_major=$(node -p "process.versions.node.split('.')[0]")
  if [ "$node_major" -lt 20 ]; then
    die "Se requiere Node >= 20. Encontrado: $(node -v)"
  fi
  log "Node $(node -v) — OK"
}

# -------------------------------------------------------------------
# 2. Dependencias
# -------------------------------------------------------------------
install_deps() {
  log "Instalando dependencias..."
  # Un solo comando canónico. Si tu repo usa otro gestor (pnpm, yarn, bun),
  # reemplázalo y refleja el cambio en AGENTS.md §1.
  npm ci || die "npm ci falló. ¿Está package-lock.json commiteado?"
  log "Dependencias instaladas."
}

# -------------------------------------------------------------------
# 3. Verificación de integridad del entorno (los sensores del M1)
# -------------------------------------------------------------------
# Dos niveles distintos, no confundir:
# - verify_env: presencia de runtime y node_modules. Corre en frío y es
#   lo único que hace --check. Si node_modules falta, AVISA (no falla):
#   instalar no es trabajo del modo verificación.
# - verify: sensores (typecheck + tests). Requiere deps instaladas; lo
#   corre solo el setup completo, nunca --check.
verify_env() {
  if [ -d node_modules ]; then
    log "node_modules presente."
  else
    warn "node_modules ausente. Corre 'bash init.sh' (o 'npm ci') antes de usar el entorno."
  fi
}

verify() {
  log "Corriendo sensores (typecheck + tests)..."

  # Estos comandos deben coincidir con los de AGENTS.md §1. Si difieren,
  # el agente se confunde sobre cuál es la fuente de verdad.
  npm run typecheck || die "typecheck falló. No continues: el agente no ve los errores de tipos que sí ve el sensor."
  npm test          || die "tests fallaron. El entorno parte de rojo; arréglalo antes de invocar al agente."

  log "Sensores en verde. Entorno listo."
}

# -------------------------------------------------------------------
# 4. Estado de .planning (opcional — solo si usas GSD, ver M2)
# -------------------------------------------------------------------
check_planning() {
  if [ -d ".planning" ]; then
    log "Estado GSD presente en .planning/"
    # No validamos el contenido aquí; eso lo hace el agente al arrancar.
  else
    warn "No hay .planning/. Si vas a usar el loop GSD (M2), inicialízalo con templates/.planning/."
  fi
}

# -------------------------------------------------------------------
# Entry point
# -------------------------------------------------------------------
main() {
  local mode="${1:-full}"
  check_runtime
  check_planning

  if [ "$mode" = "--check" ]; then
    # Verificación pura de entorno: sin instalar, sin sensores. Los
    # sensores sin deps instaladas fallan siempre en frío (ese era el
    # bug); con deps, los corre CI con su orden de costo (M6 §6.8).
    verify_env
    log "Modo --check: entorno verificado. Sensores: 'bash init.sh' completo o CI."
    return
  fi

  install_deps
  verify
  log "Listo. Entorno en estado conocido."
}

main "$@"