'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalUsuarios: number;
  totalVacaciones: number;
  vacacionesAprobadas: number;
  vacacionesPendientes: number;
  vacacionesRechazadas: number;
  diasTotalesUsados: number;
  diasPromedioPorUsuario: number;
  usuariosPorRol: { [key: string]: number };
  vacacionesPorMes: { [key: string]: number };
  proximasVacaciones: Array<{
    usuario: string;
    fechaInicio: string;
    fechaFin: string;
    dias: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener datos de usuarios
      const usersResponse = await fetch('/api/admin/usuarios');
      const users = usersResponse.ok ? await usersResponse.json() : [];

      // Obtener datos de vacaciones
      const vacationsResponse = await fetch('/api/admin/vacaciones');
      const vacationsData = vacationsResponse.ok ? await vacationsResponse.json() : {};

      // Procesar estadísticas
      const allVacations = Object.values(vacationsData).flat() as any[];

      const stats: DashboardStats = {
        totalUsuarios: users.length,
        totalVacaciones: allVacations.length,
        vacacionesAprobadas: allVacations.filter(v => v.estado === 'aprobada').length,
        vacacionesPendientes: allVacations.filter(v => v.estado === 'pendiente').length,
        vacacionesRechazadas: allVacations.filter(v => v.estado === 'rechazada').length,
        diasTotalesUsados: allVacations
          .filter(v => v.estado === 'aprobada')
          .reduce((sum, v) => sum + (v.diasSolicitados || 0), 0),
        diasPromedioPorUsuario: 0,
        usuariosPorRol: {},
        vacacionesPorMes: {},
        proximasVacaciones: []
      };

      // Calcular promedio de días por usuario
      const usuariosConVacaciones = new Set(
        allVacations
          .filter(v => v.estado === 'aprobada')
          .map(v => v.usuarioId)
      );
      stats.diasPromedioPorUsuario = usuariosConVacaciones.size > 0
        ? Math.round(stats.diasTotalesUsados / usuariosConVacaciones.size)
        : 0;

      // Usuarios por rol
      users.forEach((user: any) => {
        stats.usuariosPorRol[user.rol] = (stats.usuariosPorRol[user.rol] || 0) + 1;
      });

      // Vacaciones por mes (últimos 12 meses)
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.vacacionesPorMes[key] = allVacations.filter(v => {
          const vacationDate = new Date(v.fechaInicio);
          return vacationDate.getFullYear() === date.getFullYear() &&
                 vacationDate.getMonth() === date.getMonth() &&
                 v.estado === 'aprobada';
        }).length;
      }

      // Próximas vacaciones (próximos 30 días)
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      stats.proximasVacaciones = allVacations
        .filter(v => {
          const startDate = new Date(v.fechaInicio);
          return v.estado === 'aprobada' &&
                 startDate >= new Date() &&
                 startDate <= in30Days;
        })
        .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
        .slice(0, 5)
        .map(v => ({
          usuario: v.usuario?.nombre || 'Usuario desconocido',
          fechaInicio: new Date(v.fechaInicio).toLocaleDateString('es-ES'),
          fechaFin: new Date(v.fechaFin).toLocaleDateString('es-ES'),
          dias: v.diasSolicitados || 0
        }));

      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Error al cargar los datos del dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="mt-2 text-gray-600">
            Estadísticas y métricas del sistema de gestión de vacaciones
          </p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              </div>
            </div>
          </div>

          {/* Vacaciones Aprobadas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vacaciones Aprobadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vacacionesAprobadas}</p>
              </div>
            </div>
          </div>

          {/* Solicitudes Pendientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vacacionesPendientes}</p>
                <p className="text-xs text-gray-500">Esperando aprobación</p>
              </div>
            </div>
          </div>

          {/* Días Totales Usados */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Días Totales Usados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.diasTotalesUsados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de distribución por roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Roles</h3>
            <div className="space-y-3">
              {Object.entries(stats.usuariosPorRol).map(([rol, count]) => (
                <div key={rol} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      rol === 'admin' ? 'bg-purple-500' :
                      rol === 'notario' ? 'bg-indigo-500' :
                      rol === 'copista' ? 'bg-blue-500' :
                      rol === 'contabilidad' ? 'bg-green-500' :
                      rol === 'gestion' ? 'bg-yellow-500' :
                      rol === 'oficial' ? 'bg-red-500' :
                      rol === 'recepcion' ? 'bg-pink-500' :
                      rol === 'indices' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{rol}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vacaciones por mes (últimos 6 meses) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vacaciones por Mes (Últimos 6)</h3>
            <div className="space-y-3">
              {Object.entries(stats.vacacionesPorMes)
                .slice(-6)
                .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / Math.max(...Object.values(stats.vacacionesPorMes))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solicitudes y próximas vacaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitudes pendientes destacadas */}
          {stats.vacacionesPendientes > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-yellow-800">Atención Requerida</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Solicitudes pendientes</p>
                    <p className="text-xs text-gray-600">Necesitan aprobación</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">{stats.vacacionesPendientes}</p>
                    <a
                      href="/admin/solicitudes"
                      className="text-xs text-yellow-700 hover:text-yellow-800 font-medium underline"
                    >
                      Revisar ahora →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Próximas vacaciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Vacaciones (30 días)</h3>
            {stats.proximasVacaciones.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.proximasVacaciones.map((vacacion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-white">
                          {vacacion.usuario.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{vacacion.usuario}</p>
                        <p className="text-xs text-gray-600">
                          {vacacion.fechaInicio} - {vacacion.fechaFin}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {vacacion.dias} días
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay vacaciones programadas en los próximos 30 días</p>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/usuarios"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Gestionar Usuarios</p>
                <p className="text-xs text-gray-500">Crear, editar y eliminar usuarios</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/solicitudes"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Revisar Solicitudes</p>
                <p className="text-xs text-gray-500">Aprobar o rechazar vacaciones pendientes</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/vacaciones"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Gestionar Vacaciones</p>
                <p className="text-xs text-gray-500">Ver y editar todas las vacaciones</p>
              </div>
            </div>
          </a>

          <a
            href="/calendario"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Ver Reportes</p>
                <p className="text-xs text-gray-500">Generar reportes mensuales en PDF</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
