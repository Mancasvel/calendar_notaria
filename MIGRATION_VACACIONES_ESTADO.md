# Migración: Sistema de Solicitud y Aprobación de Vacaciones

## Descripción

Esta migración añade un sistema de solicitud y aprobación de vacaciones al sistema existente. Ahora las vacaciones pueden estar en tres estados:
- **Aprobada**: Vacaciones confirmadas y activas
- **Pendiente**: Esperando aprobación del administrador
- **Rechazada**: Solicitud denegada por el administrador

## Cambios Implementados

### 1. Modelo de Datos (`Vacacion`)

Se añadieron los siguientes campos al modelo `Vacacion`:

```typescript
estado: 'pendiente' | 'aprobada' | 'rechazada'
diasSolicitados?: number
approvedAt?: Date
approvedBy?: ObjectId
rejectedAt?: Date
rejectedBy?: ObjectId
```

### 2. Flujo de Solicitud

- **Aprobación automática**: Si las restricciones se cumplen (disponibilidad de rol + días suficientes), la vacación se aprueba automáticamente
- **Solicitud pendiente**: Si no se cumplen las restricciones, la vacación se crea con estado `pendiente`
- Los días solo se descuentan cuando la vacación está aprobada

### 3. Panel de Administración

Nueva página en `/admin/solicitudes` donde los administradores pueden:
- Ver todas las solicitudes pendientes
- Aprobar solicitudes (✓)
- Rechazar solicitudes (✗)

### 4. Interfaz de Usuario

- La página de solicitar vacaciones ahora permite enviar solicitudes incluso si no cumplen restricciones
- La página "Mis Vacaciones" muestra el estado de cada vacación con indicadores visuales
- El navbar incluye un nuevo enlace "Solicitudes Pendientes" para administradores

## Instrucciones de Migración

### Paso 1: Actualizar Código

El código ya está actualizado. Los cambios incluyen:

- ✅ Modelo de datos actualizado
- ✅ APIs actualizadas
- ✅ Interfaces de usuario actualizadas
- ✅ Filtros en consultas para mostrar solo vacaciones aprobadas

### Paso 2: Ejecutar Script de Migración

**IMPORTANTE**: Ejecuta este script ANTES de iniciar la aplicación con el nuevo código.

El script actualizará todas las vacaciones existentes estableciendo su estado como `aprobada`:

```bash
# Asegúrate de tener las variables de entorno configuradas
# Especialmente MONGODB_URI

npx ts-node scripts/migrate-vacaciones-estado.ts
```

**Salida esperada:**

```
🚀 Iniciando migración de vacaciones...
✅ Conectado a MongoDB
📊 Encontradas X vacaciones sin campo 'estado'
✅ Migración completada:
   - Documentos modificados: X
   - Documentos coincidentes: X

📊 Estado actual de vacaciones:
   - Aprobadas: X
   - Pendientes: 0
   - Rechazadas: 0

✅ Conexión cerrada
🎉 Migración completada exitosamente
```

### Paso 3: Verificar la Migración

1. Inicia la aplicación:
   ```bash
   npm run dev
   ```

2. Verifica que:
   - Las vacaciones existentes aparecen como "Aprobadas" ✓
   - Puedes solicitar nuevas vacaciones
   - Las solicitudes que no cumplen restricciones aparecen como "Pendientes" ⏳
   - Los administradores pueden ver y gestionar solicitudes pendientes

## Rollback (Si es necesario)

Si necesitas revertir la migración, ejecuta:

```javascript
// En MongoDB shell o tu cliente MongoDB
db.vacaciones.updateMany(
  { estado: { $exists: true } },
  { $unset: { 
      estado: "", 
      diasSolicitados: "",
      approvedAt: "", 
      approvedBy: "",
      rejectedAt: "",
      rejectedBy: ""
    } 
  }
)
```

Luego revierte el código a la versión anterior usando git.

## Comportamiento Detallado

### Solicitud de Vacaciones

1. Usuario solicita vacaciones con fechas específicas
2. Sistema verifica:
   - ✅ Disponibilidad de rol (máximo permitido por rol)
   - ✅ Días de vacaciones disponibles
3. Si ambas condiciones se cumplen → **Aprobación automática**
4. Si no se cumplen → **Estado pendiente** (esperando decisión del admin)

### Aprobación por Admin

1. Admin ve la solicitud en el panel de solicitudes pendientes
2. Al aprobar, el sistema verifica nuevamente:
   - Disponibilidad de rol en esas fechas
   - Días de vacaciones disponibles del usuario
3. Si todo está correcto:
   - Estado cambia a `aprobada`
   - Se descuentan los días del usuario
   - Aparece en el calendario
4. Si no cumple restricciones:
   - Error informativo al admin
   - La solicitud permanece pendiente

### Rechazo por Admin

1. Admin rechaza la solicitud
2. Estado cambia a `rechazada`
3. NO se descuentan días
4. El usuario puede ver que fue rechazada en "Mis Vacaciones"

## Consultas Actualizadas

Todas las consultas que muestran vacaciones en calendarios ahora filtran por `estado: 'aprobada'`:

- `/api/vacaciones/rol` - Solo muestra aprobadas
- `/api/admin/vacaciones` - Solo muestra aprobadas
- `/api/vacaciones/mias` - Muestra aprobadas Y pendientes (para que el usuario vea sus solicitudes)

## Permisos

- **Usuarios normales**: Pueden solicitar vacaciones
- **Administradores**: Pueden aprobar/rechazar solicitudes + todo lo anterior

## Notas Importantes

1. Las vacaciones pendientes NO cuentan para las restricciones de rol
2. Solo las vacaciones aprobadas ocupan "espacio" en las fechas
3. Los días solo se descuentan al aprobar, no al solicitar
4. Al eliminar una vacación aprobada, se devuelven los días al usuario
5. Al eliminar una vacación pendiente o rechazada, NO se devuelven días (porque nunca se descontaron)

## Soporte

Si encuentras algún problema durante la migración, revisa:
1. Logs del script de migración
2. Logs de la aplicación
3. Estado de las vacaciones en MongoDB directamente

