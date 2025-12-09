'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Vacation {
  _id: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  diasSolicitados?: number;
  createdAt: string;
}

interface UserData {
  diasVacaciones: number;
}

export default function MisVacacionesPage() {
  const { data: session, status } = useSession();
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch both vacations and current user data
      const [vacationsResponse, userResponse] = await Promise.all([
        fetch('/api/vacaciones/mias'),
        fetch('/api/usuarios/me')
      ]);

      if (vacationsResponse.ok) {
        const data = await vacationsResponse.json();
        setVacations(data);
      }

      if (userResponse.ok) {
        const data = await userResponse.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

    fetchData();
  }, [session, status, router, fetchData]);

  if (status === 'loading' || loading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Vacaciones</h1>
                <p className="text-gray-600">
                  Días de vacaciones restantes: {userData?.diasVacaciones ?? session.user.diasVacaciones}
                </p>
              </div>
              <button
                onClick={() => router.push('/solicitar-vacaciones')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Solicitar Vacaciones
              </button>
            </div>

            {vacations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes vacaciones registradas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Historial de Vacaciones</h2>
                <div className="grid gap-4">
                  {vacations.map((vacation) => {
                    const estadoConfig = {
                      aprobada: { label: 'Aprobada', color: 'bg-green-100 text-green-800', icon: '✓' },
                      pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
                      rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: '✗' }
                    };
                    const config = estadoConfig[vacation.estado];

                    return (
                      <div key={vacation._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-black">
                                {new Date(vacation.fechaInicio).toLocaleDateString('es-ES')} - {' '}
                                {new Date(vacation.fechaFin).toLocaleDateString('es-ES')}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                {config.icon} {config.label}
                              </span>
                            </div>
                            <div className="flex gap-4 mt-1">
                              <p className="text-sm text-gray-500">
                                Solicitado: {new Date(vacation.createdAt).toLocaleDateString('es-ES')}
                              </p>
                              {vacation.diasSolicitados && (
                                <p className="text-sm text-gray-500">
                                  Días: {vacation.diasSolicitados}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
