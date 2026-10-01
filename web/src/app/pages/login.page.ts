import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../core/auth.service';
import { AuthLayout } from '../layout/auth-layout';
import { CampoContrasena } from '../shared/campo-contrasena';
import { Icono } from '../shared/icono';

@Component({
  selector: 'app-login',
  imports: [AuthLayout, CampoContrasena, Icono, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout>
      <h1 class="m-0 text-[28px] font-semibold tracking-tight">Bienvenido de nuevo</h1>
      <p class="mb-8 mt-1.5 text-sm text-fg-muted">Entra para administrar tu landing page.</p>

      <form class="flex flex-col gap-5" (submit)="enviar($event)">
        <div>
          <label class="ui-label" for="email">Correo electrónico</label>
          <input class="ui-input" id="email" name="email" type="email" autocomplete="email" required autofocus
                 placeholder="tucorreo@ejemplo.com" [value]="email()" (input)="email.set($any($event.target).value)">
        </div>
        <app-campo-contrasena [(valor)]="password" />

        @if (error()) {
          <p class="m-0 flex items-start gap-2 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">
            <app-icono n="alert" [tamanio]="18" />{{ error() }}
          </p>
        }

        <button type="submit" class="ui-btn ui-btn-primary w-full" [disabled]="cargando()">
          @if (cargando()) { <span class="ui-spinner"></span>Entrando… } @else { Iniciar sesión }
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-fg-muted">
        ¿Aún no tienes cuenta?
        <a routerLink="/registro" class="font-semibold text-primary no-underline hover:underline">Crea tu página gratis</a>
      </p>
    </app-auth-layout>`,
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected async enviar(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set('');
    this.cargando.set(true);
    const error = await this.auth.entrar(this.email(), this.password());
    this.cargando.set(false);
    if (error) this.error.set(error);
    else await this.router.navigateByUrl(this.auth.destino());
  }
}
