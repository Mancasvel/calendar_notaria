'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface VacationData {
  _id: string;
  usuarioId: string;
  fechaInicio: string;
  fechaFin: string;
  usuario: {
    nombre: string;
    rol: string;
  };
}

interface VacationReportProps {
  currentMonth: number; // 0-11
  currentYear: number;
  onMonthYearChange?: (month: number, year: number) => void;
}

export default function VacationReport({ currentMonth, currentYear, onMonthYearChange }: VacationReportProps) {
  const [vacations, setVacations] = useState<VacationData[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; nombre: string; nombreCorto: string; rol: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  useEffect(() => {
    if (showReport) {
      fetchData();
    }
  }, [currentMonth, currentYear, showReport]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vacationsRes, usersRes] = await Promise.all([
        fetch('/api/admin/vacaciones'),
        fetch('/api/admin/usuarios')
      ]);

      if (vacationsRes.ok && usersRes.ok) {
        const vacationsData = await vacationsRes.json();
        const usersData = await usersRes.json();

        // Mapeo de nombres a abreviaciones
        const nombreAbreviado = (nombre: string): string => {
          const nombreNormalizado = nombre.trim().toLowerCase().replace(/\s+/g, ' ');
          
          // Mapeo directo completo
          const abreviaturas: { [key: string]: string } = {
            'marta': 'MARTA',
            'eva': 'EVA',
            'beatriz': 'BEA',
            'lele': 'LELE',
            'maria': 'MAR',
            'maria jose': 'MAR',
            'maría': 'MAR',
            'mar f': 'MAR',
            'marf': 'MAR',
            'matilde': 'MATI',
            'matias': 'MATI',
            'matías': 'MATI',
            'marina': 'MAR',
            'mariana': 'MAR',
            'angela': 'ANGELA',
            'ángela': 'ANGELA',
          };
          
          // Búsqueda exacta
          if (abreviaturas[nombreNormalizado]) {
            return abreviaturas[nombreNormalizado];
          }
          
          // Búsqueda sin espacios
          const nombreSinEspacios = nombreNormalizado.replace(/\s/g, '');
          if (abreviaturas[nombreSinEspacios]) {
            return abreviaturas[nombreSinEspacios];
          }
          
          // Búsqueda por subcadenas (si el nombre contiene...)
          if (nombreNormalizado.includes('mar') && nombreNormalizado.includes('f')) return 'MAR';
          if (nombreNormalizado.includes('beatriz') || nombreNormalizado.includes('bea')) return 'BEA';
          if (nombreNormalizado.includes('lele')) return 'LELE';
          if (nombreNormalizado.includes('marta')) return 'MARTA';
          if (nombreNormalizado.includes('matild') || nombreNormalizado.includes('mati')) return 'MATI';
          if (nombreNormalizado.includes('eva') && !nombreNormalizado.includes('steve')) return 'EVA';
          if (nombreNormalizado.includes('angel')) return 'ANGELA';
          if (nombreNormalizado.includes('mari') && !nombreNormalizado.includes('marina')) return 'MAR';
          
          // Si no está en el mapeo, usar las primeras 5 letras en mayúsculas
          return nombre.trim().toUpperCase().substring(0, 5);
        };

        // Orden personalizado: primero estas personas específicas
        const ordenPrioritario = ['MARTA', 'MAR', 'MATI', 'BEA', 'LELE'];

        // Filtrar usuarios: excluir solo admin
        const allUsers = usersData
          .filter((u: any) => u.rol !== 'admin')
          .map((u: any) => ({ 
            id: u._id.toString(), 
            nombre: u.nombre,
            nombreCorto: nombreAbreviado(u.nombre),
            rol: u.rol 
          }));

        // Separar usuarios prioritarios del resto
        const usuariosPrioritarios: any[] = [];
        const usuariosRestantes: any[] = [];

        allUsers.forEach((user: any) => {
          const indexPrioridad = ordenPrioritario.indexOf(user.nombreCorto);
          if (indexPrioridad !== -1) {
            usuariosPrioritarios.push({ ...user, prioridad: indexPrioridad });
          } else {
            usuariosRestantes.push(user);
          }
        });

        // Ordenar prioritarios por el orden especificado
        usuariosPrioritarios.sort((a, b) => a.prioridad - b.prioridad);

        // Ordenar el resto por rol y luego por nombre
        usuariosRestantes.sort((a: any, b: any) => {
          if (a.rol !== b.rol) {
            return a.rol.localeCompare(b.rol);
          }
          return a.nombre.localeCompare(b.nombre);
        });

        // Combinar: primero prioritarios, luego el resto
        const filteredUsers = [...usuariosPrioritarios, ...usuariosRestantes];

        setEmployees(filteredUsers);

        // Aplanar vacaciones
        const allVacations = Object.values(vacationsData).flat() as VacationData[];
        setVacations(allVacations);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDayOfWeek = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    return date.getDay();
  };

  const isVacationDay = (employeeId: string, day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(12, 0, 0, 0);

    return vacations.some(vacation => {
      if (vacation.usuarioId !== employeeId) return false;

      const start = new Date(vacation.fechaInicio);
      const end = new Date(vacation.fechaFin);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return date >= start && date <= end;
    });
  };

  const getVacationSequence = (employeeId: string, day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(12, 0, 0, 0);

    for (const vacation of vacations) {
      if (vacation.usuarioId !== employeeId) continue;

      const start = new Date(vacation.fechaInicio);
      const end = new Date(vacation.fechaFin);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (date >= start && date <= end) {
        // Calcular día dentro de la secuencia
        const diffTime = date.getTime() - start.getTime();
        const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Calcular total de días
        const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return { dayNumber, totalDays };
      }
    }
    return null;
  };

  const getRoleColor = (rol: string) => {
    const colors: { [key: string]: string } = {
      copista: 'bg-blue-200',
      contabilidad: 'bg-green-200',
      gestion: 'bg-yellow-200',
      oficial: 'bg-red-200',
      recepcion: 'bg-pink-200',
      indices: 'bg-orange-200',
    };
    return colors[rol] || 'bg-gray-200';
  };

  const generatePDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Reporte de Vacaciones - ${monthNames[currentMonth]} ${currentYear}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Vacaciones - Manuel Castillejo Vela', 14, 22);

    // Preparar datos para la tabla
    const headers = ['Día', 'L/M/X', ...employees.map(e => `${e.nombreCorto}\n(${e.rol})`)];
    
    const rows = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayOfWeek = getDayOfWeek(day, currentMonth, currentYear);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const row = [
        `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`,
        dayNames[dayOfWeek]
      ];

      employees.forEach(emp => {
        const vacationSeq = getVacationSequence(emp.id, day);
        if (vacationSeq) {
          row.push(`${vacationSeq.dayNumber}(${vacationSeq.totalDays})`);
        } else {
          row.push('');
        }
      });

      return { data: row, isWeekend };
    });

    (doc as any).autoTable({
      head: [headers],
      body: rows.map(r => r.data),
      startY: 28,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: function(data: any) {
        // Filas de fin de semana con fondo grisáceo claro
        const rowIndex = data.row.index;
        if (rowIndex < rows.length && rows[rowIndex].isWeekend && data.section === 'body') {
          data.cell.styles.fillColor = [230, 230, 230]; // Gris claro para fines de semana
        }
        
        // Celdas con vacaciones: fondo gris más oscuro y texto bold
        if (data.section === 'body' && data.column.index > 1 && data.cell.text[0] !== '') {
          data.cell.styles.fillColor = [200, 200, 200]; // Gris medio para vacaciones
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 0, 0];
        }
      }
    });

    // Agregar leyenda al final
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Leyenda:', 14, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const legendText = [
      'Formato: Número(Total) - Ej: 3(7) = Día 3 de un total de 7 días de vacaciones',
      'Celdas con fondo gris: Indican días de vacaciones del empleado',
      'Filas con fondo claro: Sábados y domingos (fines de semana)',
    ];
    
    legendText.forEach((text, index) => {
      doc.text(`• ${text}`, 14, finalY + 16 + (index * 5));
    });

    // Pie de página
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES')} - © ${currentYear} Manuel Castillejo Vela`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Descargar
    doc.save(`Vacaciones_${monthNames[currentMonth]}_${currentYear}.pdf`);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  if (!showReport) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setShowReport(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium shadow-md"
        >
          📊 Ver Reporte Mensual
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Reporte de Vacaciones - {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          <button
            onClick={() => setShowReport(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando reporte...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border-2 border-black text-sm">
            <thead>
              <tr className="bg-white">
                <th className="border-2 border-black px-2 py-2 font-bold text-center w-16">Día</th>
                <th className="border-2 border-black px-2 py-2 font-bold text-center w-12">L/M/X</th>
                {employees.map(emp => (
                  <th
                    key={emp.id}
                    className="border-2 border-black px-3 py-2 font-bold text-center min-w-[80px] max-w-[120px] bg-white"
                  >
                    <div className="uppercase text-xs">{emp.nombreCorto}</div>
                    <div className="text-xs text-black font-normal capitalize">({emp.rol})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayOfWeek = getDayOfWeek(day, currentMonth, currentYear);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const date = new Date(currentYear, currentMonth, day);
                const isToday = 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                return (
                  <tr key={day} className={isToday ? 'bg-blue-50' : ''}>
                    <td className={`border border-black px-2 py-1 text-center font-medium text-black ${
                      isWeekend ? 'bg-gray-200' : 'bg-white'
                    }`}>
                      {String(day).padStart(2, '0')}/{String(currentMonth + 1).padStart(2, '0')}/{currentYear}
                    </td>
                    <td className={`border border-black px-2 py-1 text-center font-bold text-black ${
                      isWeekend ? 'bg-gray-200' : 'bg-white'
                    }`}>
                      {dayNames[dayOfWeek]}
                    </td>
                    {employees.map(emp => {
                      const vacationSeq = getVacationSequence(emp.id, day);
                      const hasVacation = vacationSeq !== null;

                      return (
                        <td
                          key={emp.id}
                          className={`border border-black px-2 py-1 text-center text-black ${
                            hasVacation ? `${getRoleColor(emp.rol)} font-bold` : isWeekend ? 'bg-gray-200' : 'bg-white'
                          }`}
                        >
                          {hasVacation && (
                            <div className="text-sm">
                              {vacationSeq.dayNumber}
                              {vacationSeq.totalDays > 1 && (
                                <span className="text-xs">({vacationSeq.totalDays})</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Leyenda */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="font-semibold text-gray-700">Leyenda:</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-200 border border-gray-300"></div>
              <span>Copista</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-200 border border-gray-300"></div>
              <span>Contabilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-200 border border-gray-300"></div>
              <span>Gestión</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-200 border border-gray-300"></div>
              <span>Oficial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-200 border border-gray-300"></div>
              <span>Recepción</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-200 border border-gray-300"></div>
              <span>Índices</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Nota:</strong> Los números indican el día consecutivo de vacaciones. Ej: 1, 2, 3... = días 1º, 2º, 3º de vacaciones.</p>
            <p>El número entre paréntesis indica el total de días de ese período de vacaciones.</p>
          </div>
        </div>
      )}
    </div>
  );
}

