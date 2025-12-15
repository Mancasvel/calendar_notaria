'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminRole } from '@/lib/permissions';
import VacationCalendar from '@/components/vacation-calendar';
import VacationReport from '@/components/vacation-report';

interface VacationWithUser {
  _id: string;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
  usuarioId: string;
  rolUsuario: string;
  usuario: {
    nombre: string;
    email: string;
    rol: string;
    diasVacaciones: number;
  } | null;
}

interface GroupedVacations {
  [role: string]: VacationWithUser[];
}

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  diasVacaciones: number;
}

export default function AdminVacacionesPage() {
  const { data: session, status } = useSession();
  const [vacations, setVacations] = useState<GroupedVacations>({});
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState<VacationWithUser | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [createUserId, setCreateUserId] = useState('');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const router = useRouter();

  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user || !isAdminRole(session.user.role)) {
      router.push('/login');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchVacations(), fetchUsuarios()]);
    setLoading(false);
  };

  const fetchVacations = async () => {
    try {
      const response = await fetch('/api/admin/vacaciones');
      if (response.ok) {
        const data = await response.json();
        setVacations(data);
      }
    } catch (error) {
      console.error('Error fetching vacations:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const handleDelete = async (vacationId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta vacación? Los días se restaurarán al usuario.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/vacaciones/${vacationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Vacación eliminada correctamente' });
        await fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Error al eliminar vacación' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al eliminar vacación' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEditFromCalendar = (vacationId: string) => {
    // Encontrar la vacación en los datos agrupados
    const allVacations = Object.values(vacations).flat();
    const vacation = allVacations.find(v => v._id === vacationId);
    if (vacation) {
      handleEdit(vacation);
    }
  };

  const handleEdit = (vacation: VacationWithUser) => {
    setSelectedVacation(vacation);
    setEditStartDate(new Date(vacation.fechaInicio).toISOString().split('T')[0]);
    setEditEndDate(new Date(vacation.fechaFin).toISOString().split('T')[0]);
    // Asegurarse de que editUserId tenga un valor válido
    setEditUserId(vacation.usuarioId && vacation.usuarioId.trim() !== '' ? vacation.usuarioId : '');
    setShowEditModal(true);
  };

  const handleUpdateVacation = async () => {
    if (!selectedVacation) return;

    // Validaciones del frontend
    if (!editStartDate || !editEndDate) {
      setMessage({ type: 'error', text: 'Las fechas de inicio y fin son requeridas' });
      return;
    }

    if (!editUserId || editUserId.trim() === '') {
      setMessage({ type: 'error', text: 'Debe seleccionar un usuario' });
      return;
    }

    const start = new Date(editStartDate);
    const end = new Date(editEndDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setMessage({ type: 'error', text: 'Formato de fecha inválido' });
      return;
    }

    if (start > end) {
      setMessage({ type: 'error', text: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/vacaciones/${selectedVacation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fechaInicio: editStartDate,
          fechaFin: editEndDate,
          usuarioId: editUserId
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Vacación actualizada correctamente' });
        setShowEditModal(false);
        await fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Error al actualizar vacación' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al actualizar vacación' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateVacation = async () => {
    if (!createUserId || !createStartDate || !createEndDate) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/vacaciones/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: createUserId,
          fechaInicio: createStartDate,
          fechaFin: createEndDate,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Vacación creada correctamente' });
        setShowCreateModal(false);
        setCreateUserId('');
        setCreateStartDate('');
        setCreateEndDate('');
        await fetchData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Error al crear vacación' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al crear vacación' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !isAdminRole(session.user.role)) {
    return null;
  }

  // Preparar datos para el calendario
  const calendarVacations = Object.values(vacations)
    .flat()
    .map(vacation => ({
      id: vacation._id,
      usuarioNombre: vacation.usuario ? vacation.usuario.nombre : 'Usuario desconocido',
      usuarioEmail: vacation.usuario ? vacation.usuario.email : 'N/A',
      rol: vacation.usuario?.rol || vacation.rolUsuario || 'N/A',
      fechaInicio: new Date(vacation.fechaInicio),
      fechaFin: new Date(vacation.fechaFin),
      diasVacaciones: vacation.usuario ? vacation.usuario.diasVacaciones : 0
    }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mensaje de feedback */}
        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Reporte Mensual */}
        <VacationReport 
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthYearChange={handleMonthYearChange}
        />

        {/* Calendario Visual */}
        <VacationCalendar 
          vacations={calendarVacations}
          onEdit={handleEditFromCalendar}
          onDelete={handleDelete}
          onMonthChange={handleMonthYearChange}
        />

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Listado de Vacaciones</h1>
                <p className="text-gray-600">Vista detallada de todas las vacaciones por rol</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Crear Vacación
              </button>
            </div>

            {Object.keys(vacations).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay vacaciones registradas.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(vacations).map(([role, roleVacations]) => (
                  <div key={role} className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Rol: {role} ({roleVacations.length} vacaciones)
                    </h2>

                    <div className="grid gap-4">
                      {roleVacations.map((vacation) => (
                        <div key={vacation._id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{vacation.usuario ? vacation.usuario.nombre : 'Usuario desconocido'}</p>
                              <p className="text-sm text-gray-600">{vacation.usuario ? vacation.usuario.email : 'N/A'}</p>
                              <p className="text-sm text-gray-500">
                                Días restantes: {vacation.usuario ? vacation.usuario.diasVacaciones : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-black">
                                {new Date(vacation.fechaInicio).toLocaleDateString()} - {' '}
                                {new Date(vacation.fechaFin).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Solicitado: {new Date(vacation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aprobada
                              </span>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(vacation)}
                                disabled={actionLoading}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(vacation._id)}
                                disabled={actionLoading}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && selectedVacation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Vacación</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario *
              </label>
              <select
                value={editUserId}
                onChange={(e) => setEditUserId(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black px-3 py-2"
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios.map((usuario) => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nombre} ({usuario.email}) - {usuario.diasVacaciones} días disponibles
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateVacation}
                disabled={actionLoading || !editUserId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Crear Nueva Vacación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <select
                  value={createUserId}
                  onChange={(e) => setCreateUserId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario._id} value={usuario._id}>
                      {usuario.nombre} ({usuario.email}) - {usuario.diasVacaciones} días disponibles
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={createStartDate}
                  onChange={(e) => setCreateStartDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={createEndDate}
                  onChange={(e) => setCreateEndDate(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateUserId('');
                  setCreateStartDate('');
                  setCreateEndDate('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateVacation}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Creando...' : 'Crear Vacación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
