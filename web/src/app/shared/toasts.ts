import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvisoService } from '../core/aviso.service';
import { Icono } from './icono';

@Component({
  selector: 'app-toasts',
  imports: [Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2" aria-live="polite">
      @for (a of avisos.avisos(); track a.id) {
        <div class="toast-in pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ring-black/5"
             [class]="a.tipo === 'ok' ? 'bg-ok-bg text-ok-fg' : 'bg-bad-bg text-bad-fg'" role="status">
          <app-icono [n]="a.tipo === 'ok' ? 'check' : 'alert'" [tamanio]="18" />{{ a.texto }}
        </div>
      }
    </div>`,
})
export class Toasts {
  protected readonly avisos = inject(AvisoService);
}
