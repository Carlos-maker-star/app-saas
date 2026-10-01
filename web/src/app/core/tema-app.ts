import { Injectable, signal } from '@angular/core';

/** Modo claro/oscuro de las pantallas de la app (no afecta a las landings públicas). */
@Injectable({ providedIn: 'root' })
export class TemaApp {
  readonly oscuro = signal(false);

  constructor() {
    let guardado: string | null = null;
    try { guardado = localStorage.getItem('app.tema'); } catch { /* sin almacenamiento */ }
    this.aplicar(guardado ? guardado === 'oscuro' : matchMedia('(prefers-color-scheme: dark)').matches);
  }

  alternar(): void {
    this.aplicar(!this.oscuro());
    try { localStorage.setItem('app.tema', this.oscuro() ? 'oscuro' : 'claro'); } catch { /* ignorar */ }
  }

  private aplicar(oscuro: boolean): void {
    this.oscuro.set(oscuro);
    document.documentElement.classList.toggle('dark', oscuro);
  }
}
