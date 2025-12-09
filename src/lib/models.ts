import { ObjectId } from 'mongodb';

export interface Usuario {
  _id: ObjectId;
  email: string;
  nombre: string;
  rol: string;
  despacho?: string; // Ignored as per requirements
  passwordHash: string;
  diasVacaciones: number; // New field: remaining vacation days
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export interface Vacacion {
  _id?: ObjectId;
  usuarioId: ObjectId;
  rolUsuario: string; // Copied from user for fast filtering
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'pendiente' | 'aprobada' | 'rechazada'; // Vacation status
  diasSolicitados?: number; // Days requested (calculated at creation)
  createdAt: Date;
  approvedAt?: Date; // When it was approved
  approvedBy?: ObjectId; // Admin who approved
  rejectedAt?: Date; // When it was rejected
  rejectedBy?: ObjectId; // Admin who rejected
}

export interface Reporte {
  _id?: ObjectId;
  usuarioId: ObjectId;
  incidencia: string; // Qué ha pasado
  comoPaso: string; // Cómo ha pasado
  fechaIncidencia: Date; // Fecha automática de la incidencia
  createdAt: Date;
}

export interface UsuarioSession {
  _id: string;
  email: string;
  nombre: string;
  rol: string;
  diasVacaciones: number;
}
