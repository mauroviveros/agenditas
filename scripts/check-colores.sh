#!/bin/sh
# Falla si aparece un color fuera de los tokens de src/app/globals.css (ver docs/DESIGN.md).
# Excepción: src/app/dev/, la vitrina que muestra los hex de los tokens.
set -u

PALETA='(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)'
PATRON="#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|\b(bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow)-${PALETA}\b"

encontrados=$(grep -rnE "$PATRON" src \
  --include='*.ts' --include='*.tsx' --include='*.css' \
  --exclude='globals.css' --exclude-dir='dev')

if [ -n "$encontrados" ]; then
  echo "Colores fuera de los tokens (usá las clases de docs/DESIGN.md):"
  echo "$encontrados"
  exit 1
fi
echo "Colores: todo desde los tokens."
