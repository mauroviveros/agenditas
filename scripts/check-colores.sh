#!/bin/sh
# Falla si aparece un color fuera de los tokens de src/app/globals.css (ver docs/DESIGN.md).
# Cubre: hex, rgb()/hsl()/oklch(), clases de la paleta de Tailwind, valores arbitrarios
# (`bg-[red]`) y colores con nombre en estilos en línea (`color: "red"`).
# Excepción: src/app/dev/, la vitrina que muestra los hex de los tokens.
set -u

[ -d src ] || { echo "check-colores: no encuentro src/ (corré desde la raíz)"; exit 2; }

PALETA='(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)'
PREFIJOS='(bg|text|border|ring|ring-offset|inset-ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|placeholder|shadow|inset-shadow|drop-shadow)'
NOMBRES='(red|blue|green|black|white|gray|grey|yellow|orange|purple|pink|brown)'
PATRON="#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|\b${PREFIJOS}-${PALETA}\b|-\[${NOMBRES}\]|(color|[bB]ackground|[bB]ackgroundColor|borderColor|fill|stroke)\s*:\s*[\"']${NOMBRES}[\"']"

encontrados=$(grep -rnE "$PATRON" src \
  --include='*.ts' --include='*.tsx' --include='*.css' \
  --exclude='globals.css' --exclude-dir='dev')
estado=$?

# grep: 0 = encontró, 1 = no encontró, otro = falló (no dar verde en silencio).
if [ "$estado" -gt 1 ]; then
  echo "check-colores: grep falló (código $estado)"
  exit 2
fi
if [ -n "$encontrados" ]; then
  echo "Colores fuera de los tokens (usá las clases de docs/DESIGN.md):"
  echo "$encontrados"
  exit 1
fi
echo "Colores: todo desde los tokens."
