'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HOLIDAYS_2025 } from '@/lib/holidays-2025';
import { isAdminRole } from '@/lib/permissions';

interface FestivoDinamico {
  _id: string;
  fecha: string;
  nombre: string;
  descripcion?: string;
  createdAt: string;
}

export default function FestivosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [festivosDinamicos, setFestivosDinamicos] = useState<FestivoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFestivo, setEditingFestivo] = useState<FestivoDinamico | null>(null);
  const [formData, setFormData] = useState({ fecha: '', nombre: '', descripcion: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = session?.user?.role && isAdminRole(session.user.role);

  const fetchFestivosDinamicos = useCallback(async () => {
    try {
      const res = await fetch('/api/festivos');
      if (res.ok) {
        const data = await res.json();
        setFestivosDinamicos(data);
      }
    } catch (err) {
      console.error('Error fetching festivos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    fetchFestivosDinamicos();
  }, [session, status, router, fetchFestivosDinamicos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fecha || !formData.nombre) {
      setError('Fecha y nombre son obligatorios');
      return;
    }

    try {
      const url = editingFestivo 
        ? `/api/festivos/${editingFestivo._id}` 
        : '/api/festivos';
      
      const method = editingFestivo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingFestivo ? 'Festivo actualizado correctamente' : 'Festivo añadido correctamente');
        setFormData({ fecha: '', nombre: '', descripcion: '' });
        setShowAddForm(false);
        setEditingFestivo(null);
        fetchFestivosDinamicos();
      } else {
        setError(data.error || 'Error al guardar el festivo');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (festivo: FestivoDinamico) => {
    setEditingFestivo(festivo);
    setFormData({
      fecha: new Date(festivo.fecha).toISOString().split('T')[0],
      nombre: festivo.nombre,
      descripcion: festivo.descripcion || ''
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este festivo?')) {
      return;
    }

    try {
      const res = await fetch(`/api/festivos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Festivo eliminado correctamente');
        fetchFestivosDinamicos();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al eliminar el festivo');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingFestivo(null);
    setFormData({ fecha: '', nombre: '', descripcion: '' });
    setError('');
  };

  // Agrupar festivos fijos por mes
  const holidaysByMonth: { [key: string]: typeof HOLIDAYS_2025 } = {};
  HOLIDAYS_2025.forEach(holiday => {
    const month = holiday.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!holidaysByMonth[month]) {
      holidaysByMonth[month] = [];
    }
    holidaysByMonth[month].push(holiday);
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Días Festivos</h1>
                <p className="text-gray-600">
                  Estos días NO se descuentan de tus vacaciones
                </p>
              </div>

              {/* Mensajes de éxito/error */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                  {success}
                </div>
              )}

              {/* Información importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Cálculo Inteligente de Vacaciones
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Al solicitar vacaciones, el sistema automáticamente:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>❌ NO cuenta los <strong>sábados y domingos</strong></li>
                        <li>❌ NO cuenta los <strong>días festivos oficiales</strong></li>
                        <li>❌ NO cuenta los <strong>días festivos personalizados</strong></li>
                        <li>✅ Solo cuenta los <strong>días laborables</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Festivos Personalizados (Solo Admin) */}
              {isAdmin && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Festivos Personalizados
                    </h2>
                    {!showAddForm && (
                      <button
                        onClick={() => {
                          setShowAddForm(true);
                          setEditingFestivo(null);
                          setFormData({ fecha: '', nombre: '', descripcion: '' });
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Añadir Festivo
                      </button>
                    )}
                  </div>

                  {/* Formulario para añadir/editar festivo */}
                  {showAddForm && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        {editingFestivo ? 'Editar Festivo' : 'Nuevo Festivo'}
                      </h3>
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha *
                            </label>
                            <input
                              type="date"
                              value={formData.fecha}
                              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre del festivo *
                            </label>
                            <input
                              type="text"
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                              placeholder="Ej: Día del Patrón"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción (opcional)
                          </label>
                          <input
                            type="text"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                            placeholder="Ej: Fiesta local"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            {editingFestivo ? 'Actualizar' : 'Añadir'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelForm}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lista de festivos personalizados */}
                  {festivosDinamicos.length > 0 ? (
                    <div className="grid gap-3">
                      {festivosDinamicos.map((festivo) => {
                        const fechaDate = new Date(festivo.fecha);
                        const dayName = fechaDate.toLocaleDateString('es-ES', { weekday: 'long' });
                        const dayNumber = fechaDate.toLocaleDateString('es-ES', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        });
                        
                        return (
                          <div
                            key={festivo._id}
                            className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-300 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-600 text-white rounded-lg flex items-center justify-center">
                                  <span className="text-lg font-bold">
                                    {fechaDate.getDate()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {festivo.nombre}
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {dayName}, {dayNumber}
                                </p>
                                {festivo.descripcion && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {festivo.descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Personalizado
                              </span>
                              <button
                                onClick={() => handleEdit(festivo)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(festivo._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay festivos personalizados añadidos
                    </p>
                  )}
                </div>
              )}

              {/* Lista de festivos personalizados (solo lectura para no-admin) */}
              {!isAdmin && festivosDinamicos.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Festivos Personalizados
                  </h2>
                  <div className="grid gap-3">
                    {festivosDinamicos.map((festivo) => {
                      const fechaDate = new Date(festivo.fecha);
                      const dayName = fechaDate.toLocaleDateString('es-ES', { weekday: 'long' });
                      const dayNumber = fechaDate.toLocaleDateString('es-ES', { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });
                      
                      return (
                        <div
                          key={festivo._id}
                          className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-yellow-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold">
                                  {fechaDate.getDate()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {festivo.nombre}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {dayName}, {dayNumber}
                              </p>
                              {festivo.descripcion && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {festivo.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Personalizado
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de festivos oficiales por mes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Festivos Oficiales 2025
                </h2>
                <div className="space-y-6">
                  {Object.entries(holidaysByMonth).map(([month, holidays]) => (
                    <div key={month} className="border-t pt-4">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 capitalize">
                        {month}
                      </h3>
                      <div className="grid gap-3">
                        {holidays.map((holiday, idx) => {
                          const dayName = holiday.date.toLocaleDateString('es-ES', { weekday: 'long' });
                          const dayNumber = holiday.date.toLocaleDateString('es-ES', { 
                            day: 'numeric',
                            month: 'long'
                          });
                          
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold">
                                      {holiday.date.getDate()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-900 capitalize">
                                    {holiday.name}
                                  </p>
                                  <p className="text-sm text-gray-600 capitalize">
                                    {dayName}, {dayNumber}
                                  </p>
                                  {holiday.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {holiday.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Oficial
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contador total */}
              <div className="mt-6 pt-6 border-t">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Festivos oficiales:</span>
                        <span className="text-xl font-bold text-red-600 ml-2">{HOLIDAYS_2025.length}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Personalizados:</span>
                        <span className="text-xl font-bold text-yellow-600 ml-2">{festivosDinamicos.length}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-gray-900 ml-2">
                        {HOLIDAYS_2025.length + festivosDinamicos.length} días
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
