#!/bin/bash

# ==========================
# WDM Radix → Shadcn Migration
# ==========================

# 1️⃣ Ensure shadcn is installed
echo "Installing shadcn-ui CLI..."
npm install shadcn@latest -D

# 2️⃣ Initialize shadcn UI folder (ui/)
echo "Initializing shadcn UI folder..."
npx shadcn init

# 3️⃣ List of Radix components detected from your ui-radix folder
COMPONENTS=(
  accordion alert-dialog alert aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input-otp input label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle-group toggle tooltip
)

# 4️⃣ Install each component via shadcn CLI
echo "Installing shadcn components..."
for comp in "${COMPONENTS[@]}"; do
  echo "Adding shadcn component: $comp"
  npx shadcn add "$comp" --yes
done

# 5️⃣ Optional: Preserve styling
# We'll merge className from ui-radix files with shadcn defaults in a later Node.js step.

# 6️⃣ Update imports in codebase
echo "Updating imports from ui-radix → ui..."
# Use Node.js script for safe automated refactor
node << 'EOF'
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIRS = ['./components'];
const RADIX_FOLDER = 'ui-radix';
const SHADCN_FOLDER = 'ui';

function updateImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      updateImports(fullPath);
    } else if (/\.(tsx|ts|jsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes(RADIX_FOLDER)) {
        content = content.replace(new RegExp(RADIX_FOLDER, 'g'), SHADCN_FOLDER);
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  });
}

COMPONENTS_DIRS.forEach(dir => updateImports(dir));
EOF

echo "✅ Migration prep complete! Now manually verify styling and component behavior."
