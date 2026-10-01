import { Injectable, signal } from '@angular/core';

export interface Aviso { id: number; tipo: 'ok' | 'error'; texto: string; }

/** Avisos breves (toasts) */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  readonly avisos = signal<Aviso[]>([]);
  private n = 0;

  ok(texto: string): void { this.poner('ok', texto); }
  error(texto: string): void { this.poner('error', texto); }

  private poner(tipo: Aviso['tipo'], texto: string): void {
    const id = ++this.n;
    this.avisos.update((a) => [...a, { id, tipo, texto }]);
    setTimeout(() => this.quitar(id), 4000);
  }

  quitar(id: number): void {
    this.avisos.update((a) => a.filter((x) => x.id !== id));
  }
}
