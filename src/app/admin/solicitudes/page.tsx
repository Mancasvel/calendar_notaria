'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminRole } from '@/lib/permissions';

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  diasVacaciones: number;
}

interface SolicitudVacacion {
  _id: string;
  usuarioId: string;
  usuario?: Usuario;
  rolUsuario: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  diasSolicitados: number;
  createdAt: string;
  validacion?: {
    roleAvailable: boolean;
    hasEnoughDays: boolean;
    currentRoleVacations: number;
    maxRoleVacations: number;
  };
}

export default function SolicitudesPendientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudVacacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vacaciones/solicitudes');
      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data.solicitudes || []);
      } else {
        setError('Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      setError('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user || !isAdminRole(session.user.role)) {
      router.push('/login');
      return;
    }

    fetchSolicitudes();
  }, [session, status, router, fetchSolicitudes]);

  const handleAccion = async (id: string, action: 'aprobar' | 'rechazar') => {
    if (processingId) return;

    const confirmMessage = action === 'aprobar' 
      ? '¿Estás seguro de aprobar esta solicitud de vacaciones?'
      : '¿Estás seguro de rechazar esta solicitud de vacaciones?';

    if (!confirm(confirmMessage)) return;

    setProcessingId(id);
    setError('');

    try {
      const response = await fetch(`/api/admin/vacaciones/solicitudes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        await fetchSolicitudes(); // Recargar lista
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      setError('Error al procesar la solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session || !isAdminRole(session.user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes Pendientes de Aprobación</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de vacaciones que requieren aprobación administrativa
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {solicitudes.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Días Solicitados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Días Disponibles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => {
                    const fechaInicio = new Date(solicitud.fechaInicio).toLocaleDateString('es-ES');
                    const fechaFin = new Date(solicitud.fechaFin).toLocaleDateString('es-ES');
                    const fechaSolicitud = new Date(solicitud.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const validacion = solicitud.validacion;
                    const incumplimientos = [];
                    
                    if (validacion) {
                      if (!validacion.hasEnoughDays) {
                        const diasDisponibles = solicitud.usuario && solicitud.usuario.diasVacaciones ? solicitud.usuario.diasVacaciones : 0;
                        incumplimientos.push(`❌ Días insuficientes (tiene ${diasDisponibles}, necesita ${solicitud.diasSolicitados})`);
                      }
                      if (!validacion.roleAvailable) {
                        incumplimientos.push(`❌ Límite de rol alcanzado (${validacion.currentRoleVacations}/${validacion.maxRoleVacations} personas ya de vacaciones)`);
                      }
                    }

                    const todoValido = incumplimientos.length === 0;

                    return (
                      <tr key={solicitud._id} className={`hover:bg-gray-50 ${!todoValido ? 'bg-red-50' : 'bg-white'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {solicitud.usuario && solicitud.usuario.nombre ? solicitud.usuario.nombre : 'Usuario no encontrado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {solicitud.usuario && solicitud.usuario.email ? solicitud.usuario.email : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {solicitud.rolUsuario}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{fechaInicio}</div>
                          <div className="text-gray-500">a {fechaFin}</div>
                          <div className="text-xs text-gray-400 mt-1">Solicitado: {fechaSolicitud}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {solicitud.diasSolicitados || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-semibold ${
                            (solicitud.usuario && solicitud.usuario.diasVacaciones ? solicitud.usuario.diasVacaciones : 0) >= (solicitud.diasSolicitados || 0)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {solicitud.usuario && solicitud.usuario.diasVacaciones ? solicitud.usuario.diasVacaciones : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {todoValido ? (
                            <div className="flex items-center text-green-700">
                              <span className="text-lg mr-1">✓</span>
                              <span className="text-sm font-medium">Cumple restricciones</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {incumplimientos.map((inc, idx) => (
                                <div key={idx} className="text-xs text-red-700 font-medium">
                                  {inc}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleAccion(solicitud._id, 'aprobar')}
                              disabled={processingId === solicitud._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={todoValido ? "Aprobar solicitud" : "Aprobar de todos modos (puede incumplir restricciones)"}
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => handleAccion(solicitud._id, 'rechazar')}
                              disabled={processingId === solicitud._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Rechazar solicitud"
                            >
                              ✗ Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




