'use client';

import { useState, useEffect } from 'react';

interface ReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidencia: string, comoPaso: string) => Promise<void>;
}

/**
 * Modal para reportar fallos del sistema AGN
 */
export default function ReporteModal({ isOpen, onClose, onSubmit }: ReporteModalProps) {
  const [incidencia, setIncidencia] = useState('');
  const [comoPaso, setComoPaso] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!incidencia.trim() || !comoPaso.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(incidencia.trim(), comoPaso.trim());
      // Mostrar mensaje de éxito
      setSuccess(true);
      // Limpiar formulario
      setIncidencia('');
      setComoPaso('');
      setError('');
    } catch (err) {
      setError('Error al enviar el reporte. Inténtalo de nuevo.');
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIncidencia('');
      setComoPaso('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  // Cerrar automáticamente después de 2 segundos cuando se complete exitosamente
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Reportar Fallo AGN
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-600 font-medium">Enviado exitosamente</p>
            </div>
          )}

          <div>
            <label htmlFor="incidencia" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Qué ha pasado? *
            </label>
            <textarea
              id="incidencia"
              value={incidencia}
              onChange={(e) => setIncidencia(e.target.value)}
              placeholder="Describe brevemente la incidencia..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black bg-white"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="comoPaso" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cómo ha pasado? *
            </label>
            <textarea
              id="comoPaso"
              value={comoPaso}
              onChange={(e) => setComoPaso(e.target.value)}
              placeholder="Explica cómo se produjo el fallo..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black bg-white"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <p><strong>Fecha del reporte:</strong> {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          {!success && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !incidencia.trim() || !comoPaso.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Reportar Fallo'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
