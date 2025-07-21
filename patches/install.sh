#!/bin/bash
set -euo pipefail

# List of patches (format: "package-dir:patch-file")
PATCHES=(
  "node_modules/@stellar/design-system:patches/@stellar+design-system+3.1.1.patch"
  "node_modules/tailwindcss:patches/tailwindcss+3.4.17.patch"
)

for entry in "${PATCHES[@]}"; do
  PACKAGE_DIR="${entry%%:*}"
  PATCH_FILE="${entry##*:}"

  echo ""
  echo "Checking patch for $PACKAGE_DIR using $PATCH_FILE"

  if [ ! -d "$PACKAGE_DIR" ]; then
    echo "⏩ Package $PACKAGE_DIR not found, skipping."
    continue
  fi

  # Check if the patch is already applied
  if patch -R -p1 --dry-run -i "$PATCH_FILE" > /dev/null 2>&1; then
    echo "✔️ Patch already applied, skipping."
  else
    echo "🔧 Applying patch: $PATCH_FILE"
    patch -p1 -i "$PATCH_FILE"
  fi
done

echo ""
echo "✅ Postinstall patching complete."
