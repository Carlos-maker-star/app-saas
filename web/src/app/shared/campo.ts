import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

let siguiente = 0;

/** Campo de texto, área o número con etiqueta, ayuda y contador. */
@Component({
  selector: 'app-campo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-baseline justify-between">
      <label class="ui-label !mb-1.5" [attr.for]="id">{{ label() }}</label>
      @if (max() && texto().length > max()! * 0.8) { <span class="mb-1.5 text-[11px] tabular-nums text-fg-subtle">{{ texto().length }}/{{ max() }}</span> }
    </div>
    @if (tipo() === 'area') {
      <textarea class="ui-input !h-auto resize-y py-2.5 leading-snug" rows="3" [id]="id" [value]="texto()" [placeholder]="ph()"
                [attr.maxlength]="max()" (input)="valor.set($any($event.target).value)"></textarea>
    } @else {
      <input class="ui-input" [id]="id" [type]="tipo()" [value]="texto()" [placeholder]="ph()" [attr.maxlength]="max()"
             [attr.inputmode]="tipo() === 'number' ? 'decimal' : null" [attr.step]="tipo() === 'number' ? 'any' : null" [attr.min]="tipo() === 'number' ? 0 : null"
             (input)="cambiar($any($event.target).value)" (blur)="salir.emit()">
    }
    @if (ayuda()) { <p class="mb-0 mt-1.5 text-xs text-fg-subtle">{{ ayuda() }}</p> }`,
})
export class CampoTexto {
  readonly label = input.required<string>();
  readonly tipo = input<'text' | 'area' | 'number' | 'url' | 'email' | 'tel'>('text');
  readonly valor = model<string | number | null>('');
  readonly ph = input('');
  readonly ayuda = input('');
  readonly max = input<number | null>(null);
  /** Se emite al salir del campo (para normalizar, por ejemplo) */
  readonly salir = output<void>();
  protected readonly id = `campo-${++siguiente}`;

  protected texto(): string {
    const v = this.valor();
    return v === null || v === undefined ? '' : String(v);
  }

  protected cambiar(v: string): void {
    if (this.tipo() === 'number') this.valor.set(v.trim() === '' ? null : Number(v.replace(',', '.')));
    else this.valor.set(v);
  }
}
