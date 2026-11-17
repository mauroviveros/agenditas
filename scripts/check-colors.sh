#!/usr/bin/env bash
# Los colores y los radios viven solo en packages/ui/src/styles/tokens.css (ver
# docs/ARQUITECTURA.md). Falla si encuentra un hex, un color literal o una clase de
# color de la paleta de Tailwind en cualquier otro archivo.
# Sin \b: no existe en las regex extendidas de macOS, y esto corre en macOS y en Linux.
set -euo pipefail
cd "$(dirname "$0")/.."

palette='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
utilities='bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow|placeholder'
before='(^|[^a-zA-Z0-9_-])'
after='([^a-zA-Z0-9_-]|$)'
patterns="#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})([^0-9a-zA-Z_]|\$)"
patterns="$patterns|${before}(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\\("
patterns="$patterns|${before}($utilities)-($palette)-[0-9]{2,3}${after}"
patterns="$patterns|${before}(bg|text|border)-(white|black)${after}"

if git grep --untracked -n -E "$patterns" -- apps packages \
  ':(exclude)packages/ui/src/styles/tokens.css' \
  ':(exclude)packages/db/src/types.ts' \
  ':(exclude)apps/panel/src/routeTree.gen.ts' \
  ':(exclude)*.md' ':(exclude)*.json' ':(exclude)*.jsonc'; then
  echo >&2
  echo "Hay colores fuera de los tokens. Usá las utilidades de packages/ui/src/styles/tokens.css." >&2
  exit 1
fi
echo "Colores: sin violaciones."
