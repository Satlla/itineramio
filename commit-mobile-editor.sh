#!/bin/bash

# Navegar al directorio de itineramio
cd /Users/alejandrosatlla/Documents/itineramio

echo "=== Git Status ==="
git status

echo "=== Añadiendo archivos específicos ==="
git add src/components/ui/MobileStepEditor.tsx
git add src/components/ui/StepEditor.tsx  
git add src/components/ui/index.ts

echo "=== Archivos preparados para commit ==="
git status --short

# Verificar si hay cambios para commit
if [[ -n $(git status --porcelain) ]]; then
  echo "=== Creando commit ==="
  git commit -m "Improve mobile zone creation UX with new step editor

- Create MobileStepEditor component with intuitive mobile-first design
- Add 'Añade Fotos/video' button without background (Airbnb-style)
- Fix mobile container to use full screen width
- Prevent background scrolling when modal is open
- Implement smooth step-by-step navigation with transitions
- Add bottom sheet modal for media selection
- Include visual progress indicators
- Optimize touch targets for mobile devices

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
  
  echo "=== Pushing to remote ==="
  git push
  
  echo "=== ¡Listo! Cambios enviados correctamente ==="
else
  echo "=== No hay cambios para commit ==="
  echo "Verificando último commit..."
  git log --oneline -1
fi