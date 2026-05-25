// Lógica de negocio: obtener servicios, huecos y reservar
import { crearSupabaseBrowser } from './supabase/cliente';
import type { Hueco, ResultadoReserva, Servicio } from '@/types/database';

export async function obtenerServicios(): Promise<Servicio[]> {
  const supabase = crearSupabaseBrowser();
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerHuecosDisponibles(
  fecha: Date,
  servicioId: string
): Promise<Hueco[]> {
  const supabase = crearSupabaseBrowser();
  // Formato YYYY-MM-DD en zona horaria local
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = `${year}-${month}-${day}`;

  const { data, error } = await supabase.rpc('obtener_huecos_disponibles', {
    p_fecha: fechaStr,
    p_servicio_id: servicioId,
  });

  if (error) throw error;
  return data ?? [];
}

export async function reservarCita(datos: {
  nombre: string;
  telefono: string;
  email?: string;
  servicioId: string;
  fechaHora: Date;
  notas?: string;
}): Promise<ResultadoReserva> {
  const supabase = crearSupabaseBrowser();

  const { data, error } = await supabase.rpc('reservar_cita', {
    p_nombre: datos.nombre,
    p_telefono: datos.telefono,
    p_email: datos.email ?? '',
    p_servicio_id: datos.servicioId,
    p_fecha_hora: datos.fechaHora.toISOString(),
    p_notas: datos.notas ?? null,
  });

  if (error) {
    throw new Error(traducirError(error.message));
  }

  return Array.isArray(data) ? data[0] : data;
}

function traducirError(mensaje: string): string {
  const traducciones: Record<string, string> = {
    NOMBRE_INVALIDO: 'El nombre es obligatorio',
    TELEFONO_INVALIDO: 'El teléfono no es válido',
    SERVICIO_NO_DISPONIBLE: 'Ese servicio ya no está disponible',
    FECHA_PASADA: 'No puedes reservar en una fecha pasada',
    FECHA_DEMASIADO_LEJANA: 'Esa fecha está demasiado lejana',
    HUECO_OCUPADO: 'Ese hueco ya ha sido reservado, elige otro',
  };

  for (const [clave, valor] of Object.entries(traducciones)) {
    if (mensaje.includes(clave)) return valor;
  }
  return 'No se ha podido completar la reserva. Inténtalo de nuevo.';
}

// Formato de precio: 12.5 → "12,50 €"
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(precio);
}

// Formato de duración: 45 → "45 min", 60 → "1 h"
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;
  if (restantes === 0) return `${horas} h`;
  return `${horas} h ${restantes} min`;
}

export function formatearFechaLarga(fecha: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
}

export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(fecha);
}

export function formatearHora(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

// Función auxiliar: combina clases CSS condicionalmente
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
