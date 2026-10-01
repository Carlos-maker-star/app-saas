import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Iconos simples de redes sociales (trazo, heredan el color del texto). */
@Component({
  selector: 'app-red-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (red()) {
        @case ('instagram') { <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/> }
        @case ('facebook') { <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/> }
        @case ('tiktok') { <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2 4.2 5 4.4"/> }
        @case ('youtube') { <rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/> }
        @case ('x') { <path d="M4 4l16 16M20 4L4 20"/> }
        @case ('linkedin') { <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v6M8 7.5v.01M12 16v-6m0 3a3 3 0 0 1 6 0v3"/> }
        @default { <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/> }
      }
    </svg>`,
})
export class RedIcon {
  readonly red = input.required<string>();
}
