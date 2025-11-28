# Referencias de Imágenes para el TFG

Este documento lista todas las referencias de imágenes que se han añadido al TFG y que necesitan ser capturadas e insertadas.

## Instrucciones Generales

Para cada referencia, debes:
1. Capturar la pantalla o crear el diagrama correspondiente
2. Guardar la imagen en una carpeta `imagenes/` o `figures/`
3. Insertar en LaTeX usando:
```latex
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/nombre-archivo.png}
\caption{Descripción de la figura}
\label{fig:nombre-referencia}
\end{figure}
```

## Referencias por Capítulo

### Capítulo 5: Diagnóstico As-Is de Procesos Críticos

#### Sistema de Gestión de Vacaciones

**Figura \ref{fig:bpmn-vacaciones-asis}**
- **Ubicación**: Sección "Modelado BPMN As-Is - Proceso de Vacaciones"
- **Descripción**: Diagrama BPMN del proceso As-Is de gestión de vacaciones
- **Tipo**: Diagrama BPMN (puede crearse con herramientas como Lucidchart, Draw.io, Camunda Modeler)
- **Contenido sugerido**: Pools (Empleado, Admin), eventos, actividades manuales, puntos de dolor

---

### Capítulo 6: Diseño To-Be de Procesos Críticos

#### Sistema de Gestión de Vacaciones

**Figura \ref{fig:bpmn-vacaciones-tobe}**
- **Ubicación**: Sección "Flujo To-Be Automatizado"
- **Descripción**: Diagrama BPMN del proceso To-Be de gestión de vacaciones
- **Tipo**: Diagrama BPMN
- **Contenido sugerido**: Flujo automatizado con validaciones automáticas, sistemas, API calls

**Figura \ref{fig:calendario-general}**
- **Ubicación**: Subsección "Calendario Visual Compartido"
- **Descripción**: Captura del calendario visual compartido
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/calendario`
- **Contenido**: Vista mensual con vacaciones de diferentes usuarios codificadas por color

**Figura \ref{fig:solicitud-vacaciones}**
- **Ubicación**: Subsección "Formulario de Solicitud Inteligente"
- **Descripción**: Captura del formulario de solicitud con validación en tiempo real
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/solicitar-vacaciones`
- **Contenido**: Formulario con selectores de fecha, botón de verificación, panel de feedback (verde/rojo)

**Figura \ref{fig:mis-vacaciones}**
- **Ubicación**: Subsección "Dashboard de Mis Vacaciones"
- **Descripción**: Dashboard personal de vacaciones
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/mis-vacaciones`
- **Contenido**: Días disponibles destacados, historial de vacaciones, estado de solicitudes

**Figura \ref{fig:admin-vacaciones}**
- **Ubicación**: Subsección "Panel de Administración"
- **Descripción**: Panel administrativo con calendario y gestión CRUD
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/admin/vacaciones`
- **Contenido**: Calendario + listado de vacaciones + botones CRUD

---

### Capítulo 7: Especificación de Requisitos de Sistemas

#### Sistema de Gestión de Vacaciones

**Figura \ref{fig:usecase-sgv}**
- **Ubicación**: Subsección "Casos de Uso Principales del SGV"
- **Descripción**: Diagrama de casos de uso del Sistema de Gestión de Vacaciones
- **Tipo**: Diagrama UML de casos de uso
- **Contenido sugerido**: Actores (Empleado, Admin, Sistema), casos de uso principales conectados

---

### Capítulo 8: Arquitectura de Sistemas Integrados

#### Sistema de Gestión de Vacaciones

**Figura \ref{fig:modelo-datos-sgv}**
- **Ubicación**: Subsección "Modelo de Datos del SGV"
- **Descripción**: Diagrama del modelo de datos del Sistema de Gestión de Vacaciones
- **Tipo**: Diagrama de base de datos (ER Diagram)
- **Contenido**: Colecciones `usuarios` y `vacaciones` con sus campos y relaciones

**Figura \ref{fig:componente-vacation-calendar}**
- **Ubicación**: Subsección "VacationCalendar.tsx"
- **Descripción**: Componente VacationCalendar con vacaciones renderizadas
- **Tipo**: Screenshot del componente o diagrama
- **Contenido**: Componente visual del calendario con anotaciones de props y funcionalidades

**Figura \ref{fig:flujo-solicitud-vacaciones}**
- **Ubicación**: Subsección "Flujo de Datos Crítico: Solicitud de Vacaciones"
- **Descripción**: Diagrama de secuencia del flujo de solicitud de vacaciones
- **Tipo**: Diagrama de secuencia UML
- **Contenido**: Cliente ↔ API ↔ DB ↔ Helpers, mostrando flujo completo de validación y creación

---

### Capítulo 9: Desarrollo e Implementación

#### Sistema de Gestión Documental (QR)

**Figura \ref{fig:screenshot-qr-dashboard}**
- **Ubicación**: Subsección "Fase 2: Sistema de Gestión Documental - Core QR"
- **Descripción**: Captura del dashboard del sistema QR
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/dashboard` (del sistema QR)
- **Contenido**: Dashboard con lista de documentos, filtros, estado

#### Sistema de Gestión de Vacaciones

**Figura \ref{fig:screenshot-calendario-vacaciones}**
- **Ubicación**: Subsección "Fase 4: Interfaces de Usuario del SGV"
- **Descripción**: Captura del calendario visual de vacaciones
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/calendario`
- **Contenido**: Calendario mensual con múltiples vacaciones de diferentes colores

**Figura \ref{fig:solicitud-vacaciones-form}**
- **Ubicación**: Subsubsección "Solicitud de Vacaciones con Validación en Tiempo Real"
- **Descripción**: Formulario de solicitud con validación automática
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/solicitar-vacaciones`
- **Contenido**: Formulario completo mostrando validación (panel verde o rojo con detalles)

**Figura \ref{fig:calendario-vacaciones-visual}**
- **Ubicación**: Subsubsección "Calendario Visual Compartido"
- **Descripción**: Calendario mensual con vacaciones codificadas por color
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/calendario`
- **Contenido**: Vista mensual clara con leyenda de colores por rol

**Figura \ref{fig:dashboard-mis-vacaciones}**
- **Ubicación**: Subsubsección "Dashboard Personal de Vacaciones"
- **Descripción**: Vista personal con días disponibles y historial
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/mis-vacaciones`
- **Contenido**: Dashboard personal mostrando días disponibles (destacado) e historial en tabla

**Figura \ref{fig:admin-panel-vacaciones}**
- **Ubicación**: Subsubsección "Panel de Administración con CRUD Completo"
- **Descripción**: Panel administrativo con calendario y gestión completa
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/admin/vacaciones`
- **Contenido**: Vista completa del panel admin con calendario + listado + controles CRUD

**Figura \ref{fig:admin-usuarios}**
- **Ubicación**: Subsubsección "Gestión de Usuarios y Asignación de Días"
- **Descripción**: Panel de gestión de usuarios con CRUD
- **Tipo**: Screenshot de la aplicación
- **Ruta sugerida**: `/admin/usuarios`
- **Contenido**: Lista de usuarios con botones editar/eliminar, modal de creación/edición

---

## Resumen por Tipo

### Screenshots de Aplicación (10 imágenes)
1. Calendario general (2 veces - pueden ser la misma imagen)
2. Formulario de solicitud (2 veces - pueden ser la misma imagen)
3. Dashboard personal "Mis Vacaciones"
4. Panel administrativo de vacaciones
5. Panel de gestión de usuarios
6. Dashboard QR del sistema documental

### Diagramas BPMN (2 diagramas)
1. Proceso As-Is de gestión de vacaciones
2. Proceso To-Be de gestión de vacaciones

### Diagramas UML (3 diagramas)
1. Casos de uso del SGV
2. Modelo de datos del SGV (ER Diagram)
3. Diagrama de secuencia: Flujo de solicitud de vacaciones

### Diagramas de Componentes (1 diagrama)
1. Componente VacationCalendar (puede ser screenshot anotado)

---

## Prioridad de Capturas

### Alta Prioridad (deben estar)
- Calendario visual de vacaciones
- Formulario de solicitud con validación
- Panel administrativo de vacaciones
- Dashboard personal "Mis Vacaciones"
- Diagrama BPMN To-Be

### Media Prioridad (importantes)
- Panel de gestión de usuarios
- Dashboard QR del sistema documental
- Diagrama de casos de uso
- Diagrama de secuencia

### Baja Prioridad (opcionales/pueden crearse después)
- Diagrama BPMN As-Is
- Modelo de datos (puede describirse en texto si no hay diagrama)
- Componente VacationCalendar (puede omitirse si hay otras capturas del calendario)

---

## Consejos para las Capturas

1. **Calidad**: Usa capturas de alta resolución (mínimo 1920x1080)
2. **Datos de prueba**: Asegúrate de tener datos de prueba representativos
3. **Redacción**: Oculta/censura datos sensibles reales (nombres, emails reales)
4. **Consistencia**: Usa el mismo conjunto de datos de prueba en todas las capturas
5. **Estado**: Captura estados interesantes (validación exitosa Y fallida para el formulario)
6. **Navegación**: Asegúrate de que la barra de navegación sea visible para mostrar contexto
7. **Responsive**: Considera capturar también versiones móviles para algunas vistas clave

---

## Herramientas Recomendadas

- **Screenshots**: Snipping Tool (Windows), Shift+Cmd+4 (Mac), o extensión de navegador
- **Diagramas BPMN**: Camunda Modeler, Draw.io, Lucidchart
- **Diagramas UML**: PlantUML, Draw.io, StarUML, Visual Paradigm
- **Edición**: GIMP, Photoshop, o herramientas online como Canva

---

## Formato LaTeX para Insertar Imágenes

```latex
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{imagenes/nombre-archivo.png}
\caption{Descripción detallada de lo que muestra la figura}
\label{fig:nombre-referencia}
\end{figure}
```

**Importante**: Asegúrate de que los `\label{fig:...}` coincidan exactamente con las referencias mencionadas arriba.

