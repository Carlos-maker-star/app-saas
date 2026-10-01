import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { ImagenesService } from '../core/imagenes.service';
import { urlSegura } from '../core/seguridad';
import { Icono } from './icono';

/** Subir/cambiar/quitar una imagen (se comprime a WebP y se guarda en Supabase Storage). */
@Component({
  selector: 'app-imagen-campo',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ui-label">{{ label() }}</span>
    <div class="flex items-center gap-3">
      <div class="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-edge bg-card-2 text-fg-subtle">
        @if (url(); as u) { <img [src]="u" alt="" class="absolute inset-0 size-full object-cover"> }
        @else if (porDefecto(); as d) { <img [src]="d" alt="" class="absolute inset-0 size-full object-cover"> }
        @else { <app-icono n="palette" [tamanio]="22" /> }
        @if (subiendo()) { <span class="absolute inset-0 flex items-center justify-center bg-black/40 text-white"><span class="ui-spinner"></span></span> }
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" [disabled]="subiendo()" (click)="archivo.click()">{{ url() ? 'Cambiar' : 'Subir imagen' }}</button>
        @if (url()) { <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" [disabled]="subiendo()" (click)="valor.set(null)">Quitar</button> }
      </div>
      <input #archivo type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" (change)="elegir($event)">
    </div>
    @if (error()) { <p class="mb-0 mt-1.5 text-xs text-bad-fg" role="alert">{{ error() }}</p> }
    @else if (ayuda()) { <p class="mb-0 mt-1.5 text-xs text-fg-subtle">{{ ayuda() }}</p> }`,
})
export class ImagenCampo {
  private readonly imagenes = inject(ImagenesService);
  readonly label = input.required<string>();
  readonly valor = model<string | null>(null);
  readonly ayuda = input('');
  readonly ladoMax = input(1400);
  /** true: se recorta cuadrada y se guarda como PNG de 256 px (para el icono de la pestaña) */
  readonly icono = input(false);
  /** Qué mostrar cuando no hay imagen (por ejemplo, el icono que se generará solo) */
  readonly porDefecto = input<string | null>(null);
  readonly subiendo = signal(false);
  readonly error = signal('');
  /** Para que quien lo use sepa que hubo un cambio (opcional) */
  readonly subida = output<string>();

  protected url = () => urlSegura(this.valor());

  protected async elegir(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    this.error.set('');
    this.subiendo.set(true);
    try {
      const url = this.icono() ? await this.imagenes.subirIcono(f) : await this.imagenes.subir(f, this.ladoMax());
      this.valor.set(url);
      this.subida.emit(url);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      this.subiendo.set(false);
    }
  }
}
