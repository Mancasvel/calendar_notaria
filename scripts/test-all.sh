#!/bin/bash

# Script completo de testing para Vacation Management System

set -e

echo "🚀 Iniciando suite completa de testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error "Archivo .env.local no encontrado. Ejecuta primero: cp ENV_EXAMPLE.txt .env.local"
    exit 1
fi

print_status "Verificando dependencias..."
npm list --depth=0 > /dev/null 2>&1 || {
    print_error "Dependencias no instaladas. Ejecutando npm install..."
    npm install
}

# Run unit tests
print_status "Ejecutando tests unitarios..."
npm test -- --passWithNoTests --testPathPattern="unit" --coverage --coverageDirectory=coverage/unit

# Run integration tests
print_status "Ejecutando tests de integración..."
npm test -- --passWithNoTests --testPathPattern="integration" --coverage --coverageDirectory=coverage/integration

# Run component tests
print_status "Ejecutando tests de componentes..."
npm test -- --passWithNoTests --testPathPattern="components" --coverage --coverageDirectory=coverage/components

# Check if server is running for E2E tests
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Servidor detectado en puerto 3001, ejecutando tests E2E..."
    npx playwright test
else
    print_warning "Servidor no detectado en puerto 3001. Saltando tests E2E."
    print_warning "Para ejecutar tests E2E: npm run dev (en terminal separado) y luego npx playwright test"
fi

# Run load tests (if server is running)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Ejecutando tests de carga..."
    npx artillery run load-tests/vacaciones-load.yml --output reports/load-test.json
else
    print_warning "Servidor no detectado. Saltando tests de carga."
fi

# Generate coverage report
print_status "Generando reporte de cobertura..."
npm run test:coverage

# Lint check
print_status "Verificando código con ESLint..."
npm run lint

# Build check
print_status "Verificando build de producción..."
npm run build

print_success "✅ Suite completa de testing finalizada!"

# Generate summary report
echo "
📊 RESUMEN DE TESTING:
=======================
✅ Tests Unitarios: Completados
✅ Tests de Integración: Completados
✅ Tests de Componentes: Completados
✅ Tests E2E: $(lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 'Completados' || echo 'Saltados - servidor no ejecutándose')
✅ Tests de Carga: $(lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 'Completados' || echo 'Saltados - servidor no ejecutándose')
✅ ESLint: Completado
✅ Build: Completado

📁 Reportes generados:
- Cobertura: coverage/lcov-report/index.html
- Tests E2E: playwright-report/index.html
- Carga: reports/load-test.json (si ejecutado)

🎯 Cobertura objetivo: >80%
" > TEST_REPORT.md

print_success "Reporte generado: TEST_REPORT.md"
print_success "¡Testing completado exitosamente!"
