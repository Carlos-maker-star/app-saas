import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
        <div class="text-center" role="status">
          <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"><app-icono n="mail" [tamanio]="26" /></span>
          <h1 class="mb-0 mt-5 text-[26px] font-semibold tracking-tight">Revisa tu correo</h1>
          <p class="mt-2 text-sm text-fg-muted">Enviamos un enlace de confirmación a<br><b class="text-fg">{{ email() }}</b>.<br>Confírmalo y vuelve para iniciar sesión.</p>
          <a routerLink="/login" class="ui-btn ui-btn-primary mt-7 w-full">Ir a iniciar sesión</a>
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

          @if (error()) {
            <p class="m-0 flex items-start gap-2 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">
              <app-icono n="alert" [tamanio]="18" />{{ error() }}
            </p>
          }

          <button type="submit" class="ui-btn ui-btn-primary w-full" [disabled]="cargando()">
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

  protected async enviar(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set('');
    if (this.password().length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.cargando.set(true);
    const r = await this.auth.registrar(this.email(), this.password());
    this.cargando.set(false);
    if (r.error) this.error.set(r.error);
    else if (r.confirmar) this.confirmar.set(true);
    else await this.router.navigateByUrl(this.auth.destino());
  }
}
