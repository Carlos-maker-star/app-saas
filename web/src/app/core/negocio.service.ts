import { computed, inject, Injectable, signal } from '@angular/core';
import { Auth } from './auth.service';
import { env } from './env';
import { supabase } from './supabase.client';

export interface Negocio { id: string; nombre: string; slug: string; rubro: string; estado: 'activo' | 'suspendido'; }
export interface EstadoLanding { publicada: boolean; actualizado_en: string; publicada_en: string | null; }

/** Negocio del cliente que inició sesión y el estado de su landing */
@Injectable({ providedIn: 'root' })
export class NegocioService {
  private readonly auth = inject(Auth);
  readonly negocio = signal<Negocio | null>(null);
  readonly estado = signal<EstadoLanding | null>(null);
  readonly cargando = signal(true);
  readonly url = computed(() => {
    const s = this.negocio()?.slug;
    if (!s) return '';
    return env.dominioBase ? `${s}.${env.dominioBase}` : `${location.host}/n/${s}`;
  });
  readonly enlace = computed(() => {
    const s = this.negocio()?.slug;
    return s ? (env.dominioBase ? `https://${s}.${env.dominioBase}` : `/n/${s}`) : '';
  });

  async cargar(): Promise<void> {
    const id = this.auth.perfil()?.tenant_id;
    if (!id || !supabase) { this.cargando.set(false); return; }
    const [n, l] = await Promise.all([
      supabase.from('tenants').select('id, nombre, slug, rubro, estado').eq('id', id).single(),
      supabase.from('landings').select('publicada, actualizado_en, publicada_en').eq('tenant_id', id).single(),
    ]);
    this.negocio.set(n.data as Negocio | null);
    this.estado.set(l.data as EstadoLanding | null);
    this.cargando.set(false);
  }

  /** true si salió bien */
  async publicar(publicar: boolean): Promise<boolean> {
    const { error } = await supabase!.rpc(publicar ? 'publicar_landing' : 'despublicar_landing');
    if (!error) await this.cargar();
    return !error;
  }
}
