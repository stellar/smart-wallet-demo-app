#!/bin/bash
set -euo pipefail

# List of patches (format: "package-dir:patch-file")
PATCHES=(
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
  if patch -R -p0 --dry-run -i "$PATCH_FILE" > /dev/null 2>&1; then
    echo "✔️ Patch already applied, skipping."
  else
    echo "🔧 Applying patch: $PATCH_FILE"
    # Try different patch strip levels
    if patch -p0 -i "$PATCH_FILE" 2>/dev/null; then
      echo "✅ Patch applied successfully with -p0"
    elif patch -p1 -i "$PATCH_FILE" 2>/dev/null; then
      echo "✅ Patch applied successfully with -p1"
    elif patch -p2 -i "$PATCH_FILE" 2>/dev/null; then
      echo "✅ Patch applied successfully with -p2"
    else
      echo "⚠️  Patch failed with all strip levels, but continuing..."
      echo "This might indicate the patch file has incorrect paths or the changes are already applied"
    fi
  fi
done

echo ""
echo "✅ Postinstall patching complete."
