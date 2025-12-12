'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  diasVacaciones: number;
}

export default function SolicitarVacacionesPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState<{
    available: boolean;
    roleAvailable: boolean;
    hasEnoughDays: boolean;
    requestedDays: number;
    remainingDays: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    fetchUserData();
  }, [session, status, router, fetchUserData]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;

    // Validaciones de fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Validar que la fecha de inicio no sea en el pasado
    if (start < today) {
      setError('No se pueden solicitar vacaciones en fechas pasadas');
      setAvailability(null);
      return;
    }

    // Validar que la fecha de fin sea posterior o igual a la de inicio
    if (end < start) {
      setError('La fecha de fin debe ser posterior o igual a la fecha de inicio');
      setAvailability(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/vacaciones/disponibilidad?start=${startDate}&end=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Error checking availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Permitir envío siempre que se haya verificado la disponibilidad
    if (!availability) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/vacaciones/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fechaInicio: startDate,
          fechaFin: endDate,
        }),
      });

      if (response.ok) {
        const diasSolicitados = availability?.requestedDays || 0;
        const successMessage = `⏳ Solicitud enviada correctamente. Pendiente de aprobación por el administrador. Días solicitados: ${diasSolicitados}`;
        setSuccess(successMessage);
        setStartDate('');
        setEndDate('');
        setAvailability(null);
        // Actualizar datos del usuario
        await fetchUserData();
        // Redirect after a delay
        setTimeout(() => {
          router.push('/mis-vacaciones');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Error submitting vacation request');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Solicitar Vacaciones</h1>
              <p className="text-gray-600">
                Días de vacaciones disponibles: {userData?.diasVacaciones ?? session.user.diasVacaciones}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setAvailability(null);
                      setError('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setAvailability(null);
                      setError('');
                    }}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={checkAvailability}
                disabled={!startDate || !endDate || loading}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar Disponibilidad'}
              </button>

              {availability && (
                <div className={`p-4 rounded-md ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="space-y-2">
                    <p className={`font-medium ${availability.available ? 'text-green-800' : 'text-red-800'}`}>
                      {availability.available ? '✅ Fechas disponibles' : '❌ Fechas no disponibles'}
                    </p>
                    <div className="text-sm space-y-1 text-gray-900">
                      <p className="text-gray-900">Regla de rol: {availability.roleAvailable ? '✅' : '❌'}</p>
                      <p className="text-gray-900">Días suficientes: {availability.hasEnoughDays ? '✅' : '❌'}</p>
                      <p className="text-gray-900">Días solicitados: {availability.requestedDays}</p>
                      <p className="text-gray-900">Días restantes después: {availability.remainingDays - availability.requestedDays}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm text-center p-2 bg-green-50 rounded">
                  {success}
                </div>
              )}

              {availability && (
                <div className={`p-3 border rounded-md ${
                  availability.available 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-sm text-center ${
                    availability.available 
                      ? 'text-green-800' 
                      : 'text-yellow-800'
                  }`}>
                    {availability.available 
                      ? '✓ Las fechas cumplen las restricciones. Tu solicitud será enviada al administrador para aprobación.'
                      : '⚠️ Las fechas no cumplen las restricciones automáticas. Tu solicitud será enviada al administrador para revisión.'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!availability || submitting}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Solicitando...' : 'Solicitar Vacaciones'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
