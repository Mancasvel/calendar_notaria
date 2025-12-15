"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calculator, Info, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Colores bonitos para cada rol
const ROLE_COLORS: Record<string, string> = {
  admin: "#6366f1", // Indigo
  notario: "#8b5cf6", // Violet
  copista: "#10b981", // Emerald
  contabilidad: "#f59e0b", // Amber
  gestion: "#06b6d4", // Cyan
  oficial: "#ef4444", // Red
  recepcion: "#ec4899", // Pink
  indices: "#f97316", // Orange
  Default: "#94a3b8", // Slate
};

// Todos los roles disponibles
const ALL_ROLES = ['admin', 'notario', 'copista', 'contabilidad', 'gestion', 'oficial', 'recepcion', 'indices'];

interface VacationData {
  usuarioId: string;
  rolUsuario: string;
  fechaInicio: string;
  diasSolicitados?: number;
  estado: string;
}

interface UserData {
  _id: string;
  rol: string;
  nombre: string;
}

interface AverageDaysChartProps {
  vacations: VacationData[];
  users: UserData[];
}

export default function AverageDaysChart({ vacations, users }: AverageDaysChartProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Generar datos para el año seleccionado
  const chartData = useMemo(() => {
    const monthlyData: Record<string, Record<string, { totalDays: number; employeeCount: number }>> = {};

    // Inicializar todos los meses del año
    for (let month = 0; month < 12; month++) {
      const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {};

      // Inicializar todos los roles con 0
      ALL_ROLES.forEach(role => {
        monthlyData[monthKey][role] = { totalDays: 0, employeeCount: 0 };
      });
    }

    // Filtrar vacaciones aprobadas del año seleccionado
    const approvedVacations = vacations.filter(v => {
      if (v.estado !== 'aprobada') return false;
      const vacationDate = new Date(v.fechaInicio);
      return vacationDate.getFullYear() === currentYear;
    });

    // Agrupar por mes y rol
    approvedVacations.forEach((vacation) => {
      const user = users.find(u => u._id === vacation.usuarioId);
      const role = user?.rol || 'Unknown';

      const vacationDate = new Date(vacation.fechaInicio);
      const monthKey = `${currentYear}-${String(vacationDate.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[monthKey] && monthlyData[monthKey][role]) {
        monthlyData[monthKey][role].totalDays += vacation.diasSolicitados || 0;
        monthlyData[monthKey][role].employeeCount += 1;
      }
    });

    // Convertir a formato de Recharts
    return Object.entries(monthlyData).map(([month, roleData]) => {
      const result: any = {
        month,
        monthName: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short' }),
      };

      // Calcular promedio para cada rol
      ALL_ROLES.forEach(role => {
        const data = roleData[role];
        result[role] = data.employeeCount > 0
          ? Math.round((data.totalDays / data.employeeCount) * 10) / 10
          : 0;
      });

      return result;
    });
  }, [vacations, users, currentYear]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      const monthName = new Date(monthData.month + '-01').toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
      });

      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-lg text-sm max-w-sm">
          <p className="font-bold text-gray-800 mb-3">{monthName}</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {payload
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600 capitalize text-xs">
                      {entry.dataKey}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 text-xs">
                    {entry.value} días
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Navegación de años
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => {
      const newYear = direction === 'next' ? prev + 1 : prev - 1;
      // Limitar entre 2020 y 2030 para evitar navegación excesiva
      return Math.max(2020, Math.min(2030, newYear));
    });
  };

  const hasData = chartData.some(month =>
    ALL_ROLES.some(role => month[role] > 0)
  );

  return (
    // Contenedor expandido para mejor visualización
    <div className="w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      {/* Header del Gráfico con navegación */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-500" />
            Evolución de Vacaciones por Rol
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Media mensual de días de vacaciones por puesto - {currentYear}
            <span className="text-xs text-gray-300 ml-2">(2020-2030)</span>
          </p>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateYear('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            title="Año anterior"
            disabled={currentYear <= 2020}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-800">{currentYear}</span>
          </div>

          <button
            onClick={() => navigateYear('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            title="Año siguiente"
            disabled={currentYear >= new Date().getFullYear() + 5}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          <div className="bg-gray-50 p-2 rounded-full text-gray-400 ml-2">
            <Info className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Área del Gráfico - Más grande */}
      <div className="h-[500px] w-full mb-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

              <XAxis
                dataKey="monthName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                label={{
                  value: 'Días promedio por empleado',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />

              {/* Líneas para cada rol */}
              {ALL_ROLES.map((role) => (
                <Line
                  key={role}
                  type="monotone"
                  dataKey={role}
                  stroke={ROLE_COLORS[role] || ROLE_COLORS.Default}
                  strokeWidth={2}
                  dot={{ r: 4, fill: ROLE_COLORS[role] || ROLE_COLORS.Default }}
                  activeDot={{ r: 6, fill: ROLE_COLORS[role] || ROLE_COLORS.Default }}
                  name={role.charAt(0).toUpperCase() + role.slice(1)}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay datos para {currentYear}</p>
              <p className="text-gray-400 text-sm">Selecciona otro año o añade vacaciones</p>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda de colores */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Roles incluidos:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_ROLES.map((role) => (
            <div key={role} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ROLE_COLORS[role] || ROLE_COLORS.Default }}
              />
              <span className="text-xs text-gray-600 capitalize">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-6">
          <span>Empleados totales: {users.length}</span>
          <span>Vacaciones en {currentYear}: {vacations.filter(v => {
            if (v.estado !== 'aprobada') return false;
            const date = new Date(v.fechaInicio);
            return date.getFullYear() === currentYear;
          }).length}</span>
        </div>
        <span className="font-medium bg-gray-50 px-3 py-1 rounded-full">
          Actualizado hoy
        </span>
      </div>
    </div>
  );
}
