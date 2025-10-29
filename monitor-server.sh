#!/bin/bash

# Script para monitorear y reiniciar el servidor de Next.js si se cae

while true; do
    echo "🚀 Starting Next.js development server..."
    npm run dev
    
    # Si el servidor se detiene, esperar 2 segundos antes de reiniciar
    echo "❌ Server stopped. Restarting in 2 seconds..."
    sleep 2
    
    # Limpiar el puerto por si acaso
    lsof -ti:3000 | xargs kill -9 2>/dev/null
done