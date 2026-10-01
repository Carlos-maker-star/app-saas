import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase.client';

export interface Cliente {
  id: string; nombre: string; slug: string; rubro: string; whatsapp: string | null;
  estado: 'activo' | 'suspendido'; plan: string; publicada: boolean; creado_en: string; ultima_edicion: string | null;
}

/** Clientes de la plataforma (solo super admin: la base lo exige con RLS) */
@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    const { data, error } = await supabase!.rpc('admin_listar_clientes');
    if (error) this.error.set('No se pudo cargar la lista de clientes.');
    this.clientes.set((data as Cliente[] | null) ?? []);
    this.cargando.set(false);
  }

  /** true si salió bien */
  async cambiarEstado(c: Cliente, estado: 'activo' | 'suspendido'): Promise<boolean> {
    const { error } = await supabase!.rpc('admin_set_estado', { p_tenant: c.id, p_estado: estado });
    if (!error) this.clientes.update((l) => l.map((x) => (x.id === c.id ? { ...x, estado } : x)));
    return !error;
  }
}

export const RUBROS: Record<string, { nombre: string; icono: string }> = {
  cafeteria: { nombre: 'Cafetería', icono: 'coffee' },
  barberia: { nombre: 'Barbería', icono: 'scissors' },
  perfumes: { nombre: 'Perfumes', icono: 'perfume' },
  salud: { nombre: 'Salud', icono: 'heart' },
};
