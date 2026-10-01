import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Iconos de trazo (estilo Lucide). Heredan el color del texto. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:inline-flex;flex-shrink:0' },
  template: `
    <svg [attr.width]="tamanio()" [attr.height]="tamanio()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (n()) {
        @case ('home') { <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/> }
        @case ('users') { <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/> }
        @case ('layout') { <rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="16" y="14" width="5" height="7" rx="1"/> }
        @case ('palette') { <circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.7-.4-1-.3-.3-.5-.6-.5-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z"/> }
        @case ('share') { <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/> }
        @case ('sun') { <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/> }
        @case ('moon') { <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/> }
        @case ('logout') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/> }
        @case ('menu') { <path d="M4 6h16M4 12h16M4 18h16"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/> }
        @case ('check') { <path d="M20 6 9 17l-5-5"/> }
        @case ('eye') { <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/> }
        @case ('eye-off') { <path d="M9.9 4.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2"/> }
        @case ('external') { <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/> }
        @case ('pause') { <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/> }
        @case ('play') { <path d="m6 3 14 9-14 9z"/> }
        @case ('store') { <path d="m2 7 1.5-4h17L22 7M2 7v1a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V7M4 21V11M20 21V11M3 21h18"/> }
        @case ('alert') { <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/> }
        @case ('copy') { <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/> }
        @case ('left') { <path d="m15 18-6-6 6-6"/> }
        @case ('right') { <path d="m9 18 6-6-6-6"/> }
        @case ('lock') { <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/> }
        @case ('mail') { <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/> }
        @case ('rocket') { <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/> }
        @case ('coffee') { <path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v3M10 2v3M14 2v3"/> }
        @case ('scissors') { <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/> }
        @case ('perfume') { <path d="M9 2h6v4H9zM7 6h10v3a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3zM5 12h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/> }
        @case ('heart') { <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/> }
        @case ('chart') { <path d="M3 3v18h18M7 15v3M12 9v9M17 12v6"/> }
        @case ('x') { <path d="M18 6 6 18M6 6l12 12"/> }
        @default { <circle cx="12" cy="12" r="9"/> }
      }
    </svg>`,
})
export class Icono {
  readonly n = input.required<string>();
  readonly tamanio = input(20);
}
