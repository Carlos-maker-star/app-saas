import { Injectable, computed, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase.client';

export interface Perfil {
  rol: 'cliente' | 'super_admin';
  tenant_id: string | null;
}

const ERRORES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Primero confirma tu correo (revisa tu bandeja de entrada).',
  'User already registered': 'Ese correo ya está registrado. Inicia sesión.',
  'Email signups are disabled': 'El registro de cuentas nuevas está desactivado por ahora.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
};

function traducir(msg: string): string {
  return ERRORES[msg] ?? (msg.includes('rate limit') ? 'Demasiados intentos. Espera unos minutos.' : msg);
}

/** Sesión y perfil (rol + negocio) del usuario que inició sesión. */
@Injectable({ providedIn: 'root' })
export class Auth {
  readonly usuario = signal<User | null>(null);
  readonly perfil = signal<Perfil | null>(null);
  readonly esAdmin = computed(() => this.perfil()?.rol === 'super_admin');
  readonly tieneNegocio = computed(() => !!this.perfil()?.tenant_id);
  /** Se resuelve cuando ya se leyó la sesión guardada (los guards esperan esto) */
  readonly listo: Promise<void>;

  constructor() {
    this.listo = this.iniciar();
  }

  private async iniciar(): Promise<void> {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await this.aplicar(data.session);
    // No se llama a Supabase dentro del callback (bloquea el cliente): se difiere.
    supabase.auth.onAuthStateChange((_evento, sesion) => {
      setTimeout(() => void this.aplicar(sesion), 0);
    });
  }

  private async aplicar(sesion: Session | null): Promise<void> {
    this.usuario.set(sesion?.user ?? null);
    this.perfil.set(sesion?.user ? await this.leerPerfil(sesion.user.id) : null);
  }

  private async leerPerfil(id: string): Promise<Perfil | null> {
    const { data } = await supabase!.from('perfiles').select('rol, tenant_id').eq('user_id', id).maybeSingle();
    return (data as Perfil | null) ?? null;
  }

  async refrescarPerfil(): Promise<void> {
    const u = this.usuario();
    this.perfil.set(u ? await this.leerPerfil(u.id) : null);
  }

  /** Devuelve un mensaje de error, o null si salió bien */
  async entrar(email: string, password: string): Promise<string | null> {
    if (!supabase) return 'Supabase no está configurado.';
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return traducir(error.message);
    await this.aplicar(data.session);
    return null;
  }

  async registrar(email: string, password: string): Promise<{ error: string | null; confirmar: boolean }> {
    if (!supabase) return { error: 'Supabase no está configurado.', confirmar: false };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: traducir(error.message), confirmar: false };
    // Correo ya registrado: Supabase devuelve un usuario sin identidades
    if (data.user && data.user.identities?.length === 0) {
      return { error: ERRORES['User already registered'], confirmar: false };
    }
    if (data.session) await this.aplicar(data.session);
    return { error: null, confirmar: !data.session };
  }

  async salir(): Promise<void> {
    await supabase?.auth.signOut();
    this.usuario.set(null);
    this.perfil.set(null);
  }

  /** A dónde mandar al usuario según quién es */
  destino(): string {
    if (this.esAdmin()) return '/admin';
    return this.tieneNegocio() ? '/panel' : '/crear-negocio';
  }
}
