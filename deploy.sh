#!/bin/bash
cd /Users/alejandrosatlla/Documents/manualphi/apps/web
git add .
git commit -m "Fix login endpoint with proper error handling and email verification"
git push
echo "Deploy completed!"