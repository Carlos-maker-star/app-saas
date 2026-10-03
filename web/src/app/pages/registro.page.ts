import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../core/auth.service';
import { AuthLayout } from '../layout/auth-layout';
import { CampoContrasena } from '../shared/campo-contrasena';
import { Icono } from '../shared/icono';

@Component({
  selector: 'app-registro',
  imports: [AuthLayout, CampoContrasena, Icono, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout>
      @if (confirmar()) {
        <div class="text-center">
          <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"><app-icono n="mail" [tamanio]="26" /></span>
          <h1 class="mb-0 mt-5 text-[26px] font-semibold tracking-tight">Revisa tu correo</h1>
          <p class="mt-2 text-sm text-fg-muted">Enviamos un código de 6 dígitos a<br><b class="text-fg">{{ email() }}</b></p>
        </div>

        <form class="stagger mt-7 flex flex-col gap-4" (submit)="verificar($event)">
          <div>
            <label class="ui-label" for="codigo">Código de verificación</label>
            <input class="ui-input !h-14 text-center font-mono !text-2xl tracking-[.4em]" id="codigo" name="codigo" inputmode="numeric" autocomplete="one-time-code"
                   maxlength="10" autofocus placeholder="······" [value]="codigo()" (input)="alEscribir($any($event.target).value)">
          </div>

          @if (error()) {
            <p class="m-0 flex items-start gap-2 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">
              <app-icono n="alert" [tamanio]="18" />{{ error() }}
            </p>
          }
          @if (aviso()) { <p class="m-0 rounded-[10px] bg-ok-bg px-3.5 py-2.5 text-sm text-ok-fg" role="status">{{ aviso() }}</p> }

          <button type="submit" class="ui-btn ui-btn-primary w-full" [disabled]="cargando()">
            @if (cargando()) { <span class="ui-spinner"></span>Verificando… } @else { Verificar y entrar }
          </button>
        </form>

        <div class="mt-6 flex flex-col items-center gap-2 text-sm text-fg-muted">
          <button type="button" class="font-semibold text-primary disabled:text-fg-subtle" [disabled]="espera() > 0 || cargando()" (click)="reenviar()">
            {{ espera() > 0 ? 'Reenviar código en ' + espera() + ' s' : 'Reenviar código' }}
          </button>
          <button type="button" class="hover:underline" (click)="volver()">Usé un correo equivocado</button>
          <span class="text-xs text-fg-subtle">¿No llega? Revisa la carpeta de spam. También puedes confirmar con el enlace del correo.</span>
        </div>
      } @else {
        <h1 class="m-0 text-[28px] font-semibold tracking-tight">Crea tu página</h1>
        <p class="mb-8 mt-1.5 text-sm text-fg-muted">Primero tu cuenta. Luego eliges tu rubro y diseño.</p>

        <form class="stagger flex flex-col gap-5" (submit)="enviar($event)">
          <div>
            <label class="ui-label" for="email">Correo electrónico</label>
            <input class="ui-input" id="email" name="email" type="email" autocomplete="email" required autofocus
                   placeholder="tucorreo@ejemplo.com" [value]="email()" (input)="email.set($any($event.target).value)">
          </div>
          <app-campo-contrasena [(valor)]="password" autocomplete="new-password" [minimo]="8" ayuda="Mínimo 8 caracteres." />

          <label class="flex cursor-pointer items-start gap-3 text-sm leading-6 text-fg-muted">
            <input type="checkbox" name="terminos" class="mt-1 size-4 shrink-0 accent-[var(--app-primary)]" [checked]="acepto()" (change)="acepto.set($any($event.target).checked)">
            <span>Acepto los <a routerLink="/terminos" target="_blank" class="font-semibold text-primary no-underline hover:underline">Términos de uso</a>
              y la <a routerLink="/privacidad" target="_blank" class="font-semibold text-primary no-underline hover:underline">Política de privacidad</a>.</span>
          </label>

          @if (error()) {
            <p class="m-0 flex items-start gap-2 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">
              <app-icono n="alert" [tamanio]="18" />{{ error() }}
            </p>
          }

          <button type="submit" class="ui-btn ui-btn-primary w-full" [disabled]="cargando() || !acepto()">
            @if (cargando()) { <span class="ui-spinner"></span>Creando cuenta… } @else { Crear cuenta }
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-fg-muted">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="font-semibold text-primary no-underline hover:underline">Iniciar sesión</a>
        </p>
      }
    </app-auth-layout>`,
})
export class RegistroPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly confirmar = signal(false);
  protected readonly acepto = signal(false);
  protected readonly codigo = signal('');
  protected readonly aviso = signal('');
  /** Segundos que faltan para poder pedir otro código */
  protected readonly espera = signal(0);
  private temporizador: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.parar());
  }

  private parar(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
  }

  private contar(): void {
    this.parar();
    this.espera.set(60);
    this.temporizador = setInterval(() => {
      this.espera.update((n) => Math.max(0, n - 1));
      if (this.espera() === 0) this.parar();
    }, 1000);
  }

  protected alEscribir(v: string): void {
    const limpio = v.replace(/\D/g, '').slice(0, 10);
    this.codigo.set(limpio);
    this.error.set('');
    if (limpio.length === 6) void this.verificar(); // el código de Supabase tiene 6 dígitos
  }

  protected async verificar(e?: Event): Promise<void> {
    e?.preventDefault();
    if (this.cargando()) return;
    this.error.set('');
    this.aviso.set('');
    this.cargando.set(true);
    const err = await this.auth.verificarCodigo(this.email(), this.codigo());
    this.cargando.set(false);
    if (err) this.error.set(err);
    else await this.router.navigateByUrl(this.auth.destino());
  }

  protected async reenviar(): Promise<void> {
    this.error.set('');
    this.aviso.set('');
    const err = await this.auth.reenviarCodigo(this.email());
    if (err) { this.error.set(err); return; }
    this.aviso.set('Te enviamos un código nuevo.');
    this.contar();
  }

  protected volver(): void {
    this.parar();
    this.confirmar.set(false);
    this.codigo.set('');
    this.error.set('');
    this.aviso.set('');
  }

  protected async enviar(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set('');
    if (!this.acepto()) {
      this.error.set('Para crear tu cuenta debes aceptar los términos y la política de privacidad.');
      return;
    }
    if (this.password().length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.cargando.set(true);
    const r = await this.auth.registrar(this.email(), this.password());
    this.cargando.set(false);
    if (r.error) this.error.set(r.error);
    else if (r.confirmar) { this.confirmar.set(true); this.contar(); }
    else await this.router.navigateByUrl(this.auth.destino());
  }
}
