// Tipos TypeScript de la base de datos

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_show';

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio_eur: number;
  orden: number;
  activo: boolean;
}

export interface Hueco {
  hora_inicio: string;
  hora_fin: string;
}

export interface ResultadoReserva {
  cita_id: string;
  cliente_id: string;
  servicio_nombre: string;
  precio: number;
  duracion_min: number;
  fecha_hora: string;
}
