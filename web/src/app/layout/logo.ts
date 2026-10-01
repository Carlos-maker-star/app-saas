import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MARCA } from '../core/marca';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2.5">
      <span class="flex size-9 items-center justify-center rounded-[10px]"
            [class]="claro() ? 'bg-white text-panel-brand' : 'bg-primary text-on-primary'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 14h4"/>
        </svg>
      </span>
      <span class="text-lg font-bold tracking-tight" [class.text-white]="claro()">{{ marca.nombre }}</span>
    </span>`,
})
export class Logo {
  readonly claro = input(false);
  protected readonly marca = MARCA;
}
