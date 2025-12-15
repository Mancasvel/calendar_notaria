'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { isAdminRole } from '@/lib/permissions';
import ReporteModal from './reporte-modal';

/**
 * Componente Navbar principal de la aplicación
 * 
 * Funcionalidades:
 * - Muestra el nombre del usuario autenticado
 * - Navegación a las páginas principales (Mis Vacaciones, Solicitar Vacaciones)
 * - Para usuarios con rol admin o polizas: acceso al Panel de Administración
 * - Botón de cerrar sesión
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isReporteModalOpen, setIsReporteModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // No mostrar navbar en la página de login
  if (pathname === '/login' || status === 'loading' || !session) {
    return null;
  }

  const isAdmin = isAdminRole(session.user.role);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const handleReporteSubmit = async (incidencia: string, comoPaso: string) => {
    const response = await fetch('/api/reportes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incidencia, comoPaso }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el reporte');
    }
    // Cerrar menú móvil si está abierto
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    // Solo cerrar menú móvil si está abierto
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">



          {/* Navegación principal - Desktop */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 xl:space-x-4 flex-1 justify-center">
            <div className="flex items-center space-x-1 xl:space-x-2">
            <button
              onClick={() => handleNavigation('/mis-vacaciones')}
              className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/mis-vacaciones')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Mis Vacaciones
            </button>

            <button
              onClick={() => handleNavigation('/solicitar-vacaciones')}
              className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/solicitar-vacaciones')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Solicitar
            </button>

            <button
              onClick={() => handleNavigation('/calendario')}
              className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/calendario')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>

            <button
              onClick={() => handleNavigation('/festivos')}
              className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/festivos')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Festivos
            </button>

              {/* Botón para reportar fallos - visible para todos los usuarios */}
              <button
                onClick={() => setIsReporteModalOpen(true)}
                className="px-2 xl:px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors whitespace-nowrap"
              >
                Reportar Fallo
              </button>

              {/* Links de admin solo para roles admin y polizas */}
              {isAdmin && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <button
                    onClick={() => handleNavigation('/admin/vacaciones')}
                    className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive('/admin/vacaciones')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Panel Admin
                  </button>
                  <button
                    onClick={() => handleNavigation('/admin/solicitudes')}
                    className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive('/admin/solicitudes')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Solicitudes
                  </button>
                  <button
                    onClick={() => handleNavigation('/admin/usuarios')}
                    className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive('/admin/usuarios')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Usuarios
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Usuario y cerrar sesión - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 truncate max-w-32 lg:max-w-48">
                {session.user.name || session.user.email}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                  Admin
                </span>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap"
            >
              <span className="hidden lg:inline">Cerrar sesión</span>
              <span className="lg:hidden">Salir</span>
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navegación móvil - Mejora para mejor UX */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-b-lg">
            {/* Navegación principal móvil */}
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleNavigation('/mis-vacaciones')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/mis-vacaciones')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mis Vacaciones
              </button>

              <button
                onClick={() => handleNavigation('/solicitar-vacaciones')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/solicitar-vacaciones')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Solicitar
              </button>

              <button
                onClick={() => handleNavigation('/calendario')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/calendario')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Calendario
              </button>

              <button
                onClick={() => handleNavigation('/festivos')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/festivos')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Festivos
              </button>
            </div>

            {/* Botón reportar fallos móvil */}
            <button
              onClick={() => {
                setIsReporteModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 text-center"
            >
              Reportar Fallo AGN
            </button>

            {/* Links de admin móvil */}
            {isAdmin && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => handleNavigation('/admin/vacaciones')}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-left ${
                      isActive('/admin/vacaciones')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Panel Admin
                  </button>
                  <button
                    onClick={() => handleNavigation('/admin/solicitudes')}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-left ${
                      isActive('/admin/solicitudes')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Solicitudes Pendientes
                  </button>
                  <button
                    onClick={() => handleNavigation('/admin/usuarios')}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-left ${
                      isActive('/admin/usuarios')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Usuarios
                  </button>
                </div>
              </div>
            )}

            {/* Info de usuario móvil */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 truncate max-w-40">
                      {session.user.name || session.user.email}
                    </span>
                    {isAdmin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modal para reportar fallos */}
      <ReporteModal
        isOpen={isReporteModalOpen}
        onClose={() => setIsReporteModalOpen(false)}
        onSubmit={handleReporteSubmit}
      />
    </nav>
  );
}

