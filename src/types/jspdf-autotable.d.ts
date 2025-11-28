declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: number | [number, number, number];
    tableLineWidth?: number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    didParseCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
  }

  global {
    interface jsPDF {
      autoTable: (options: UserOptions) => jsPDF;
      lastAutoTable: {
        finalY: number;
      };
    }
  }
}

