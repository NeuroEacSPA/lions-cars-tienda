#!/bin/bash

# 🚗 Lions Cars - Script de Inicio

echo "================================"
echo "🚗 LIONS CARS - Sistema Completo"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Python
echo -e "${YELLOW}✓ Verificando Python...${NC}"
python3 --version

# Instalar dependencias backend
echo -e "\n${YELLOW}✓ Instalando dependencias del backend...${NC}"
cd backend
pip install -r requirements.txt > /dev/null 2>&1
cd ..

# Verificar Node
echo -e "${YELLOW}✓ Verificando Node.js...${NC}"
node --version

# Instalar dependencias frontend
echo -e "\n${YELLOW}✓ Instalando dependencias del frontend...${NC}"
npm install > /dev/null 2>&1

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Dependencias instaladas!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${YELLOW}📝 Para iniciar el proyecto:${NC}\n"

echo -e "${GREEN}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  python main.py"
echo ""

echo -e "${GREEN}Terminal 2 - Frontend:${NC}"
echo "  npm run dev"
echo ""

echo -e "${YELLOW}📍 URLs:${NC}"
echo "  Backend: http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:8000/docs"
echo ""

echo -e "${YELLOW}👤 Credenciales de Admin (por defecto):${NC}"
echo "  Usuario: admin"
echo "  Contraseña: Admin123"
echo ""

echo -e "${YELLOW}🔒 Sistema de Seguridad:${NC}"
echo "  ✓ JWT Tokens (24 horas de expiración)"
echo "  ✓ Hashing con bcrypt"
echo "  ✓ Validación de contraseñas fuerte"
echo "  ✓ Sistema de roles (Admin/Vendedor)"
echo ""

echo -e "${YELLOW}📚 Documentación completa:${NC}"
echo "  Ver: AUTENTICACION.md"
echo ""
