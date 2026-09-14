#!/usr/bin/env bash
# init.sh — verifica el entorno del Lab 04 y corre la suite.
# Node puro, sin dependencias: solo necesita node >= 18 (node:test nativo).

set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "error: node no está en el PATH" >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "error: este lab necesita node >= 18 (node:test nativo); encontré $(node --version)" >&2
  exit 1
fi

echo "node $(node --version) — entorno listo"
# Descubrimiento automático (tests/*.test.js); funciona de node 18 en
# adelante. En node >= 22 un directorio como argumento posicional ya no
# se recorre, así que no pasamos ruta: dejamos que el runner descubra.
node --test