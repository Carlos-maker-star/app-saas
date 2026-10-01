import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../core/aviso.service';
import { hace } from '../core/format';
import { NegocioService } from '../core/negocio.service';
import { Icono } from '../shared/icono';

/** Resumen del cliente: estado de su landing, publicar y primeros pasos */
@Component({
  selector: 'app-panel-inicio',
  imports: [Icono, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svc.cargando()) {
      <div class="grid gap-4 lg:grid-cols-[1fr_340px]" role="status" aria-label="Cargando">
        <div class="h-56 animate-pulse rounded-[14px] bg-card ring-1 ring-edge"></div>
        <div class="h-56 animate-pulse rounded-[14px] bg-card ring-1 ring-edge"></div>
      </div>
    } @else if (svc.negocio(); as n) {
      <div class="rise flex flex-col gap-6">
        <div>
          <h1 class="m-0 text-[28px] font-semibold tracking-tight">Hola, {{ n.nombre }}</h1>
          <p class="mt-1.5 text-sm text-fg-muted">Aquí controlas si tu landing está visible y qué falta para lanzarla.</p>
        </div>

        @if (n.estado === 'suspendido') {
          <div class="flex items-start gap-3 rounded-xl bg-warn-bg px-4 py-3.5 text-sm text-warn-fg" role="alert">
            <app-icono n="alert" [tamanio]="20" />
            <div><b>Tu página está suspendida.</b> Por ahora no es visible al público. Escríbenos para reactivarla.</div>
          </div>
        }

        <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section class="ui-card p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="m-0 text-base font-semibold">Tu landing</h2>
              <span class="ui-badge dot" [class]="publicada() ? 'bg-ok-bg text-ok-fg' : 'bg-neutral-bg text-neutral-fg'">{{ publicada() ? 'Publicada' : 'Sin publicar' }}</span>
            </div>

            <div class="mt-4 flex items-center gap-2 rounded-[10px] border border-edge bg-card-2 py-1.5 pl-3.5 pr-1.5">
              <span class="min-w-0 flex-1 truncate font-mono text-[13px] text-fg-muted">{{ svc.url() }}</span>
              <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="copiar()"><app-icono [n]="copiado() ? 'check' : 'copy'" [tamanio]="16" />{{ copiado() ? 'Copiado' : 'Copiar' }}</button>
              <a class="ui-btn ui-btn-outline ui-btn-sm" [href]="svc.enlace()" target="_blank" rel="noopener" aria-label="Abrir mi página"><app-icono n="external" [tamanio]="16" /></a>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <a routerLink="/editor" class="ui-btn" [class]="publicada() ? 'ui-btn-outline' : 'ui-btn-primary'"><app-icono n="palette" [tamanio]="16" />Editar mi landing</a>
              @if (publicada()) {
                <button type="button" class="ui-btn ui-btn-outline" [disabled]="ocupado()" (click)="cambiar(false)"><app-icono n="pause" [tamanio]="16" />Despublicar</button>
                <span class="text-sm text-fg-subtle">Publicada {{ hace(svc.estado()?.publicada_en) }}</span>
              } @else {
                <button type="button" class="ui-btn ui-btn-primary" [disabled]="ocupado()" (click)="cambiar(true)">
                  @if (ocupado()) { <span class="ui-spinner"></span> } @else { <app-icono n="rocket" [tamanio]="16" /> }Publicar tal cual
                </button>
                <span class="w-full text-sm text-fg-subtle">Nadie la verá hasta que la publiques. Mejor edítala primero.</span>
              }
            </div>
          </section>

          <section class="ui-card p-6">
            <div class="flex items-center justify-between">
              <h2 class="m-0 text-base font-semibold">Primeros pasos</h2>
              <span class="text-xs font-semibold text-fg-subtle">{{ hechos() }} de {{ pasos().length }}</span>
            </div>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-card-2" role="progressbar" [attr.aria-valuenow]="hechos()" aria-valuemin="0" [attr.aria-valuemax]="pasos().length">
              <div class="h-full rounded-full bg-primary transition-all duration-500" [style.width.%]="(hechos() / pasos().length) * 100"></div>
            </div>
            <ol class="m-0 mt-5 flex list-none flex-col gap-4 p-0">
              @for (p of pasos(); track p.texto) {
                <li class="flex items-center gap-3">
                  <span class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs"
                        [class]="p.hecho ? 'bg-primary text-on-primary' : 'border border-edge text-fg-subtle'">
                    @if (p.hecho) { <app-icono n="check" [tamanio]="14" /> }
                  </span>
                  <span class="text-sm" [class]="p.hecho ? 'text-fg-muted line-through' : 'font-medium'">{{ p.texto }}</span>
                  @if (p.pronto) { <span class="ml-auto rounded-full bg-neutral-bg px-2 py-0.5 text-[10px] font-semibold text-neutral-fg">Pronto</span> }
                </li>
              }
            </ol>
          </section>
        </div>
      </div>
    } @else {
      <p class="text-fg-muted">No pudimos cargar tu negocio.</p>
    }`,
})
export class PanelInicioPage {
  protected readonly svc = inject(NegocioService);
  private readonly avisos = inject(AvisoService);
  protected readonly hace = hace;
  protected readonly ocupado = signal(false);
  protected readonly copiado = signal(false);
  protected readonly publicada = computed(() => !!this.svc.estado()?.publicada);
  protected readonly pasos = computed(() => [
    { texto: 'Crear tu cuenta', hecho: true, pronto: false },
    { texto: 'Crear tu negocio', hecho: true, pronto: false },
    { texto: 'Personalizar textos, fotos y colores', hecho: false, pronto: false },
    { texto: 'Publicar tu landing', hecho: this.publicada(), pronto: false },
  ]);
  protected readonly hechos = computed(() => this.pasos().filter((p) => p.hecho).length);

  protected async cambiar(publicar: boolean): Promise<void> {
    this.ocupado.set(true);
    const ok = await this.svc.publicar(publicar);
    this.ocupado.set(false);
    if (ok) this.avisos.ok(publicar ? 'Tu landing ya está publicada. Puede tardar hasta 30 segundos en verse.' : 'Tu landing se ocultó. Dejará de verse en unos 30 segundos.');
    else this.avisos.error('No se pudo actualizar. Intenta de nuevo.');
  }

  protected async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.svc.enlace().startsWith('/') ? location.origin + this.svc.enlace() : this.svc.enlace());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1800);
    } catch { this.avisos.error('No se pudo copiar'); }
  }
}
