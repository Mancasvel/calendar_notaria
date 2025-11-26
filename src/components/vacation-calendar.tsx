'use client';

import { useState } from 'react';

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
}

export default function VacationCalendar({ vacations, onEdit, onDelete }: VacationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVacation, setSelectedVacation] = useState<VacationEvent | null>(null);

  // Navegar meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
      copista: 'bg-blue-500',
      contabilidad: 'bg-green-500',
      gestion: 'bg-yellow-500',
      oficial: 'bg-red-500',
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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Calendario de Vacaciones
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Hoy
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes anterior"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Mes siguiente"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
          <span className="text-gray-600">Admin/Pólizas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-600">Copista</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-600">Contabilidad</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className="text-gray-600">Gestión</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-gray-600">Oficial</span>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {/* Nombres de los días */}
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-gray-700 py-2 text-sm"
          >
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 rounded-lg"></div>;
          }

          const dayVacations = getVacationsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[120px] border rounded-lg p-2 ${
                today ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200 bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className={`text-sm font-semibold mb-1 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                {day}
              </div>
              <div className="space-y-1">
                {dayVacations.slice(0, 3).map((vacation, idx) => (
                  <button
                    key={`${vacation.id}-${idx}`}
                    onClick={() => setSelectedVacation(vacation)}
                    className={`w-full text-left px-2 py-1 rounded text-xs text-white ${getRoleColor(
                      vacation.rol
                    )} hover:opacity-80 transition-opacity truncate`}
                    title={`${vacation.usuarioNombre} - ${vacation.rol}`}
                  >
                    {vacation.usuarioNombre}
                  </button>
                ))}
                {dayVacations.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayVacations.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalles */}
      {selectedVacation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalles de Vacaciones</h3>
              <button
                onClick={() => setSelectedVacation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Empleado</label>
                <p className="text-lg font-semibold text-gray-900">{selectedVacation.usuarioNombre}</p>
                <p className="text-sm text-gray-600">{selectedVacation.usuarioEmail}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-full ${getRoleColor(selectedVacation.rol)} mr-2`}></div>
                  <span className="text-gray-900 capitalize">{selectedVacation.rol}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Inicio</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedVacation.fechaInicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Fin</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedVacation.fechaFin).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Duración</label>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateDuration(new Date(selectedVacation.fechaInicio), new Date(selectedVacation.fechaFin))} días
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Días restantes</label>
                <p className="text-lg font-semibold text-gray-900">{selectedVacation.diasVacaciones} días</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(selectedVacation.id);
                    setSelectedVacation(null);
                  }}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors font-medium"
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
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={() => setSelectedVacation(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
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

