#!/usr/bin/env bash
# pre-commit-agent-checks.sh — Hooks esenciales para trabajo con agentes
# --------------------------------------------------------------------------
# La capa 1 de enforcement (M6 §6.2): mecánico, determinista. Bloquea el
# commit antes de que llegue al repo. Lo que vive acá no depende de que
# el modelo recuerde o respete reglas; simplemente no se puede commitear.
#
# Instalación: enlaza este script como hook pre-commit (o llama a sus
# funciones desde tu hook). Con husky/pre-commit, basta apuntar a este
# archivo.
#
# Principio: cada check es barato (segundos). Si alguno es lento, no lo
# pongas en pre-commit; ponlo en el push (pre-push) o en CI.
# --------------------------------------------------------------------------

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

fail()  { printf "${RED}[pre-commit] FAIL:${NC} %s\n" "$1"; exit 1; }
warn()  { printf "${YELLOW}[pre-commit] WARN:${NC} %s\n" "$1"; }
ok()    { printf "${GREEN}[pre-commit] OK:${NC} %s\n" "$1"; }

# --------------------------------------------------------------------------
# 1. Typecheck — el sensor más barato. Falla aquí, no en CI.
# --------------------------------------------------------------------------
check_typecheck() {
  if [ -f package.json ] && grep -q '"typecheck"' package.json; then
    npm run typecheck --silent || fail "typecheck falló. Arregla antes de commitear."
    ok "typecheck"
  fi
}

# --------------------------------------------------------------------------
# 2. Lint
# --------------------------------------------------------------------------
check_lint() {
  if [ -f package.json ] && grep -q '"lint"' package.json; then
    npm run lint --silent || fail "lint falló."
    ok "lint"
  fi
}

# --------------------------------------------------------------------------
# 3. Tests rápidos (unitarios) — los lentos van en CI, no acá.
# --------------------------------------------------------------------------
check_unit_tests() {
  if [ -f package.json ] && grep -q '"test:unit"' package.json; then
    npm run test:unit --silent || fail "tests unitarios fallan. No commitees rojo."
    ok "tests unitarios"
  fi
}

# --------------------------------------------------------------------------
# 4. No commitear secretos
# --------------------------------------------------------------------------
check_secrets() {
  # Heurística básica: busca patrones de clave/token en el diff staged.
  # Para serio, usa una tool dedicada (gitleaks, trufflehog) en CI.
  local staged
  staged=$(git diff --cached --name-only)
  if echo "$staged" | grep -qiE '\.env(\.|$)'; then
    fail "Archivo .env en el commit. Probablemente contiene secretos."
  fi
  if git diff --cached | grep -qiE '(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36})'; then
    fail "Posible secreto (AWS key / OpenAI / GitHub token) en el diff staged."
  fi
  ok "sin secretos aparentes"
}

# --------------------------------------------------------------------------
# 5. Paths críticas: avisar si se tocan (no bloquear; el bloqueo va en CI)
# --------------------------------------------------------------------------
check_critical_paths() {
  local critical
  critical=$(git diff --cached --name-only | grep -E 'db/migrations/.*_applied|infra/prod/' || true)
  if [ -n "$critical" ]; then
    warn "Se tocan paths críticas: $critical. Requiere aprobación humana."
  fi
}

# --------------------------------------------------------------------------
# 6. Reporte DONE/VERIFIED: aviso si no hay (el gate estricto va en CI)
# --------------------------------------------------------------------------
check_done_verified() {
  if [ -f DONE_VERIFIED.md ]; then
    for SEC in "Qué se verificó" "Qué NO se verificó" "Supuestos" "revisa el humano"; do
      if ! grep -q "$SEC" DONE_VERIFIED.md; then
        warn "DONE_VERIFIED.md incompleto: falta '$SEC'. El CI lo bloqueará."
        return
      fi
    done
    ok "DONE/VERIFIED presente y completo"
  fi
}

# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------
main() {
  check_secrets          # primero: el más crítico, el más barato.
  check_typecheck
  check_lint
  check_unit_tests
  check_critical_paths
  check_done_verified
  ok "todos los checks pasaron."
}

main "$@"