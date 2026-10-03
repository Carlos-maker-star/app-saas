import { Injectable, computed, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { MARCA } from './marca';
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
  'Token has expired or is invalid': 'El código es incorrecto o ya venció. Revisa el último correo o pide uno nuevo.',
};

function traducir(msg: string): string {
  if (msg.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.';
  if (msg.includes('you can only request this after')) return 'Espera un momento antes de pedir otro código.';
  return ERRORES[msg] ?? msg;
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
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      // queda guardado en la cuenta: qué versión de los textos legales aceptó y cuándo
      options: { data: { terminos_version: MARCA.legal.version, terminos_aceptados_en: new Date().toISOString() } },
    });
    if (error) return { error: traducir(error.message), confirmar: false };
    // Correo ya registrado: Supabase devuelve un usuario sin identidades
    if (data.user && data.user.identities?.length === 0) {
      return { error: ERRORES['User already registered'], confirmar: false };
    }
    if (data.session) await this.aplicar(data.session);
    return { error: null, confirmar: !data.session };
  }

  /** Confirma el correo con el código de 6 dígitos que llegó por mail. Devuelve un mensaje de error, o null si salió bien. */
  async verificarCodigo(email: string, codigo: string): Promise<string | null> {
    if (!supabase) return 'Supabase no está configurado.';
    const token = codigo.replace(/\D/g, '');
    if (token.length < 6) return 'Escribe el código completo (6 dígitos).';
    const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'signup' });
    if (error) return traducir(error.message);
    await this.aplicar(data.session);
    return null;
  }

  /** Vuelve a enviar el código de confirmación. Devuelve un mensaje de error, o null si se envió. */
  async reenviarCodigo(email: string): Promise<string | null> {
    if (!supabase) return 'Supabase no está configurado.';
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    return error ? traducir(error.message) : null;
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
