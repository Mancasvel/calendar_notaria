# 🧪 Guía de Testing - Vacation Management System

## 📋 Tipos de Tests Implementados

### 1. **Tests Unitarios** (`__tests__/unit/`)
- **Funciones Helper**: `datesOverlap`, `calculateCalendarDays`, `checkRoleAvailability`
- **Lógica de negocio**: Validaciones de roles, cálculos de fechas
- **Cobertura**: Funciones puras y algoritmos

### 2. **Tests de Integración** (`__tests__/integration/`)
- **APIs REST**: Endpoints de vacaciones, autenticación
- **Base de datos**: MongoDB Memory Server para aislamiento
- **Autenticación**: Flujos completos de login y autorización

### 3. **Tests de Componentes** (`__tests__/components/`)
- **React Components**: Login, formularios de vacaciones
- **Interacciones**: Eventos de usuario, estados de loading
- **Validaciones**: Formularios y feedback visual

### 4. **Tests End-to-End** (`e2e/`)
- **Flujos completos**: Login → Solicitar vacaciones → Dashboard
- **Navegación**: Redirecciones y rutas protegidas
- **UX**: Experiencia completa del usuario

### 5. **Tests de Carga** (`load-tests/`)
- **Rendimiento**: Respuesta bajo carga
- **Escalabilidad**: Múltiples usuarios concurrentes
- **Estabilidad**: Uso de memoria y CPU

---

## 🚀 Ejecutar Tests

### **Suite Completa de Testing**
```bash
# Ejecuta TODOS los tests automáticamente
./scripts/test-all.sh
```

### **Tests Individuales**

#### Unit Tests
```bash
npm test -- --testPathPattern="unit"
```

#### Integration Tests
```bash
npm test -- --testPathPattern="integration"
```

#### Component Tests
```bash
npm test -- --testPathPattern="components"
```

#### E2E Tests (requiere servidor corriendo)
```bash
npm run dev  # Terminal 1
npx playwright test  # Terminal 2
```

#### Load Tests (requiere servidor corriendo)
```bash
npm run dev  # Terminal 1
npx artillery run load-tests/vacaciones-load.yml  # Terminal 2
```

---

## 📊 Reportes de Cobertura

### **Ver Reportes**
```bash
npm run test:coverage
```

Los reportes se generan en:
- `coverage/lcov-report/index.html` - Cobertura completa
- `coverage/unit/` - Tests unitarios
- `coverage/integration/` - Tests de integración
- `coverage/components/` - Tests de componentes

### **Objetivos de Cobertura**
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >85%
- **Lines**: >80%

---

## 🛠️ Configuración de Testing

### **Jest Configuration** (`jest.config.js`)
```javascript
- Entorno: jsdom para componentes React
- Cobertura: Múltiples formatos (HTML, LCOV, texto)
- Mocks: Next.js, NextAuth, MongoDB
- Module mapping: Alias de rutas (@/components, etc.)
```

### **Playwright Configuration** (`playwright.config.ts`)
```typescript
- Browsers: Chrome, Firefox, Safari
- Paralelización: Tests en paralelo
- Server: Auto-start de Next.js en puerto 3001
- Tracing: Captura de errores en primer retry
```

### **Artillery Configuration** (`load-tests/vacaciones-load.yml`)
```yaml
- Fases: Warm-up → Load → Stress testing
- Escenarios: Check availability, Request vacation, Get user vacations
- Rate: 10-30 requests/second
- Duration: 4 minutos total
```

---

## 🔧 Debugging Tests

### **Tests que fallan**

#### Ver logs detallados
```bash
npm test -- --verbose
```

#### Ejecutar test específico
```bash
npm test -- __tests__/unit/helpers.test.ts
```

#### Debug mode
```bash
npm test -- --inspect-brk
```

### **E2E Tests**

#### Ver browser durante test
```bash
npx playwright test --headed
```

#### Debug step-by-step
```bash
npx playwright test --debug
```

#### Generar video de fallos
```bash
npx playwright test --video=retain-on-failure
```

---

## 📈 Métricas de Rendimiento

### **Load Testing Results**

Los tests de carga verifican:

- **Response Time**: <500ms promedio
- **Error Rate**: <1%
- **Throughput**: 20-30 requests/second
- **Memory Usage**: <200MB
- **CPU Usage**: <70%

### **Interpretar Resultes**

```bash
# Ver reporte detallado
npx artillery report reports/load-test.json
```

---

## 🐛 Troubleshooting

### **Problemas Comunes**

#### 1. **MongoDB Memory Server no inicia**
```bash
# Instalar MongoDB localmente
# O usar MongoDB Atlas para tests de integración
```

#### 2. **Playwright no encuentra elementos**
```bash
# Actualizar selectores CSS
# Usar data-testid attributes
```

#### 3. **Tests de carga fallan**
```bash
# Verificar que el servidor esté corriendo
# Revisar límites de rate limiting
```

#### 4. **Coverage baja**
```bash
# Añadir más casos de borde
# Testear error handling
# Cubrir todas las ramas condicionales
```

---

## 📝 Mejores Prácticas

### **Escribir Nuevos Tests**

#### Unit Tests
```typescript
describe('FunctionName', () => {
  it('should handle normal case', () => {
    // Arrange
    const input = 'test';
    // Act
    const result = functionName(input);
    // Assert
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    // Test error cases, boundaries, etc.
  });
});
```

#### Component Tests
```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<Component />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

#### E2E Tests
```typescript
test('complete user flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 🎯 Checklist de Testing

- [ ] Tests unitarios pasan (cobertura >80%)
- [ ] Tests de integración pasan
- [ ] Tests de componentes pasan
- [ ] Tests E2E pasan en todos los browsers
- [ ] Tests de carga pasan (sin degradación)
- [ ] ESLint sin errores
- [ ] Build de producción exitoso
- [ ] No hay memory leaks
- [ ] Tests pasan en CI/CD

---

## 📞 Soporte

Para problemas con testing:

1. **Revisar logs**: `npm test -- --verbose`
2. **Debug mode**: `npm test -- --inspect-brk`
3. **Documentación**: Jest, Playwright, Artillery docs
4. **Comunidad**: GitHub issues, Stack Overflow

¡Happy Testing! 🧪✨
