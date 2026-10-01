import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LandingStore } from '../core/landing.store';

@Component({
  selector: 'app-wa-flotante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="wa-flotante fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 font-bold shadow-lg"
       style="background: #25D366; color: #073b1b"
       [href]="store.wa('Hola, quisiera más información.')" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1.9 2 1.2 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3z"/></svg>
      WhatsApp
    </a>`,
})
export class WaFlotante {
  protected readonly store = inject(LandingStore);
}
