#!/bin/bash

echo "🚀 Actualizando backend en producción..."

# 1. Copiar main.py al VPS
echo "📤 Copiando main.py al servidor..."
scp /home/neuro/lions-cars-tienda/backend/main.py root@lionscars.cl:/root/lions-cars-tienda/backend/main.py

if [ $? -eq 0 ]; then
    echo "✅ Archivo copiado exitosamente"
    
    # 2. Reiniciar el backend en el VPS
    echo "🔄 Reiniciando backend en el servidor..."
    ssh root@lionscars.cl << 'ENDSSH'
cd /root/lions-cars-tienda/backend
pkill -f "python main.py"
sleep 2
nohup python main.py > backend.log 2>&1 &
echo "✅ Backend reiniciado"
ENDSSH
    
    echo "🎉 ¡Actualización completada!"
    echo "Los nuevos endpoints están disponibles en https://lionscars.cl"
else
    echo "❌ Error al copiar el archivo"
    exit 1
fi
