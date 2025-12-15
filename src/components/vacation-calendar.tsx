'use client';

import { useState, useEffect } from 'react';

interface VacationEvent {
  id: string;
  usuarioNombre: string;
  usuarioEmail: string;
  rol: string;
  fechaInicio: Date;
  fechaFin: Date;
  diasVacaciones: number;
}

interface VacationCalendarProps {
  vacations: VacationEvent[];
  onEdit?: (vacationId: string) => void;
  onDelete?: (vacationId: string) => void;
  onMonthChange?: (month: number, year: number) => void;
}

export default function VacationCalendar({ vacations, onEdit, onDelete, onMonthChange }: VacationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVacation, setSelectedVacation] = useState<VacationEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil de manera segura
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Navegar meses
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getMonth(), newDate.getFullYear());
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getMonth(), newDate.getFullYear());
    }
  };

  const goToToday = () => {
    const newDate = new Date();
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getMonth(), newDate.getFullYear());
    }
  };

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo

  // Nombres de meses y días
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generar array de días del mes con días previos para completar la semana
  const calendarDays: (number | null)[] = [];
  
  // Días del mes anterior para completar la primera semana
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Función para verificar si un día tiene vacaciones
  const getVacationsForDay = (day: number): VacationEvent[] => {
    const currentDay = new Date(year, month, day);
    return vacations.filter(vacation => {
      const start = new Date(vacation.fechaInicio);
      const end = new Date(vacation.fechaFin);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      currentDay.setHours(12, 0, 0, 0);
      return currentDay >= start && currentDay <= end;
    });
  };

  // Colores para diferentes roles
  const getRoleColor = (rol: string): string => {
    const colors: { [key: string]: string } = {
      admin: 'bg-purple-500',
      polizas: 'bg-purple-500',
      notario: 'bg-indigo-500',
      copista: 'bg-blue-500',
      contabilidad: 'bg-green-500',
      gestion: 'bg-yellow-500',
      oficial: 'bg-red-500',
      recepcion: 'bg-pink-500',
      indices: 'bg-orange-500',
    };
    return colors[rol] || 'bg-gray-500';
  };

  // Verificar si es hoy
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Calcular duración de vacaciones
  const calculateDuration = (start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-6 sm:mb-8">
      {/* Header del calendario - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Calendario de Vacaciones
        </h2>

        {/* Controles de navegación - Responsive */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Hoy
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes anterior"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[120px] sm:min-w-[200px] text-center px-2">
              <span className="hidden sm:inline">{monthNames[month]} {year}</span>
              <span className="sm:hidden">{monthNames[month].substring(0, 3)} {year}</span>
            </span>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes siguiente"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de colores - Responsive */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Admin</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Copista</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Contab.</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Gestión</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Oficial</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Recep.</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Índices</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 rounded mr-1 sm:mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 truncate">Notario</span>
          </div>
        </div>
      </div>

      {/* Grid del calendario - Responsive */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Nombres de los días - Responsive */}
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-gray-700 py-1 sm:py-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 1)}</span>
          </div>
        ))}

        {/* Días del calendario - Responsive */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] bg-gray-50 rounded-lg"
              ></div>
            );
          }

          const dayVacations = getVacationsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border rounded-lg p-1 sm:p-2 ${
                today ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200 bg-white'
              } hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                {day}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayVacations.slice(0, isMobile ? 2 : 3).map((vacation, idx) => (
                  <button
                    key={`${vacation.id}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVacation(vacation);
                    }}
                    className={`w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs text-white ${getRoleColor(
                      vacation.rol
                    )} hover:opacity-80 transition-opacity truncate`}
                    title={`${vacation.usuarioNombre} - ${vacation.rol}`}
                  >
                    <span className="hidden sm:inline">{vacation.usuarioNombre}</span>
                    <span className="sm:hidden">{vacation.usuarioNombre.split(' ')[0]}</span>
                  </button>
                ))}
                {dayVacations.length > (isMobile ? 2 : 3) && (
                  <div className="text-xs text-gray-500 px-1 sm:px-2">
                    +{dayVacations.length - (isMobile ? 2 : 3)} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalles - Responsive */}
      {selectedVacation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Detalles de Vacaciones</h3>
              <button
                onClick={() => setSelectedVacation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Empleado</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedVacation.usuarioNombre}</p>
                <p className="text-sm text-gray-600">{selectedVacation.usuarioEmail}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-full ${getRoleColor(selectedVacation.rol)} mr-2`}></div>
                  <span className="text-gray-900 capitalize">{selectedVacation.rol}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Inicio</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedVacation.fechaInicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Fin</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedVacation.fechaFin).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Duración</label>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {calculateDuration(new Date(selectedVacation.fechaInicio), new Date(selectedVacation.fechaFin))} días
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Días restantes</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedVacation.diasVacaciones} días</p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(selectedVacation.id);
                    setSelectedVacation(null);
                  }}
                  className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors font-medium text-sm sm:text-base"
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(selectedVacation.id);
                    setSelectedVacation(null);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={() => setSelectedVacation(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

