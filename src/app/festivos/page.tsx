'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOLIDAYS_2025 } from '@/lib/holidays-2025';

export default function FestivosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

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

  // Agrupar festivos por mes
  const holidaysByMonth: { [key: string]: typeof HOLIDAYS_2025 } = {};
  HOLIDAYS_2025.forEach(holiday => {
    const month = holiday.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    if (!holidaysByMonth[month]) {
      holidaysByMonth[month] = [];
    }
    holidaysByMonth[month].push(holiday);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Días Festivos 2025</h1>
              <p className="text-gray-600">
                Estos días NO se descuentan de tus vacaciones
              </p>
            </div>

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
                      <li>✅ Solo cuenta los <strong>días laborables</strong> (Lun-Vie)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ejemplo */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                📝 Ejemplo de cálculo:
              </h3>
              <p className="text-sm text-green-700">
                Si solicitas vacaciones del <strong>viernes 5 de diciembre</strong> al <strong>lunes 15 de diciembre</strong>:
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• 11 días naturales en total</li>
                <li>• Se excluyen: 2 sábados + 2 domingos + 2 festivos (6-8 dic)</li>
                <li>• <strong className="text-green-900">= Solo se descuentan 7 días laborables</strong></li>
              </ul>
            </div>

            {/* Lista de festivos por mes */}
            <div className="space-y-6">
              {Object.entries(holidaysByMonth).map(([month, holidays]) => (
                <div key={month} className="border-t pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                    {month}
                  </h2>
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
                              Festivo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contador total */}
            <div className="mt-6 pt-6 border-t">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total de días festivos en 2025:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {HOLIDAYS_2025.length} días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

