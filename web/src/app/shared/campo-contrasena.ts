import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { Icono } from './icono';

/** Campo de contraseña con ojo para mostrar/ocultar. Úsalo en TODA contraseña. */
@Component({
  selector: 'app-campo-contrasena',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ui-label" [attr.for]="id()">{{ etiqueta() }}</label>
    <div class="relative">
      <input class="ui-input pr-11" [id]="id()" [name]="id()" [type]="visible() ? 'text' : 'password'" required
             [value]="valor()" (input)="valor.set($any($event.target).value)"
             [attr.autocomplete]="autocomplete()" [attr.minlength]="minimo()" [placeholder]="placeholder()">
      <button type="button" class="ui-icon-btn absolute right-0.5 top-0.5" (click)="visible.set(!visible())"
              [attr.aria-label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="visible()">
        <app-icono [n]="visible() ? 'eye-off' : 'eye'" [tamanio]="18" />
      </button>
    </div>
    @if (ayuda()) { <p class="mt-1.5 text-xs text-fg-subtle">{{ ayuda() }}</p> }`,
})
export class CampoContrasena {
  readonly valor = model('');
  readonly etiqueta = input('Contraseña');
  readonly id = input('password');
  readonly autocomplete = input('current-password');
  readonly ayuda = input('');
  readonly minimo = input<number | null>(null);
  readonly placeholder = input('');
  protected readonly visible = signal(false);
}
