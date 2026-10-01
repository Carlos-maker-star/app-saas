import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminService, Cliente, RUBROS } from '../core/admin.service';
import { AvisoService } from '../core/aviso.service';
import { env } from '../core/env';
import { hace } from '../core/format';
import { Confirmar } from '../shared/confirmar';
import { Icono } from '../shared/icono';

const POR_PAGINA = 8;

@Component({
  selector: 'app-admin-clientes',
  imports: [Icono, Confirmar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rise flex flex-col gap-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="m-0 text-[28px] font-semibold tracking-tight">Clientes</h1>
          <p class="mt-1.5 text-sm text-fg-muted">{{ svc.clientes().length }} {{ svc.clientes().length === 1 ? 'cliente' : 'clientes' }} en la plataforma</p>
        </div>
      </div>

      <div class="ui-card flex flex-wrap items-center gap-3 p-3">
        <label class="relative min-w-[240px] flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"><app-icono n="search" [tamanio]="18" /></span>
          <input class="ui-input pl-10" type="search" placeholder="Buscar por nombre o dirección…" aria-label="Buscar cliente"
                 [value]="q()" (input)="q.set($any($event.target).value); pagina.set(0)">
        </label>
        <select class="ui-input w-44" aria-label="Rubro" [value]="rubro()" (change)="rubro.set($any($event.target).value); pagina.set(0)">
          <option value="">Todos los rubros</option>
          @for (r of rubroLista; track r.id) { <option [value]="r.id">{{ r.nombre }}</option> }
        </select>
        <select class="ui-input w-40" aria-label="Estado" [value]="estado()" (change)="estado.set($any($event.target).value); pagina.set(0)">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="suspendido">Suspendidos</option>
        </select>
        @if (hayFiltro()) { <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="limpiar()"><app-icono n="x" [tamanio]="14" />Limpiar</button> }
      </div>

      @if (svc.error()) { <p class="m-0 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">{{ svc.error() }}</p> }

      <section class="ui-card overflow-hidden">
        <div class="h-1">@if (svc.cargando()) { <div class="h-full w-1/3 animate-pulse bg-primary"></div> }</div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr class="border-b border-edge bg-card-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                <th class="h-11 px-6 font-semibold">Negocio</th>
                <th class="px-4 font-semibold">Rubro</th>
                <th class="px-4 font-semibold">Landing</th>
                <th class="px-4 font-semibold">Estado</th>
                <th class="px-4 font-semibold">Alta</th>
                <th class="px-6 text-right font-semibold"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              @for (c of visibles(); track c.id) {
                <tr class="h-[60px] border-b border-edge transition-colors last:border-b-0 hover:bg-card-2" [class.opacity-70]="c.estado === 'suspendido'">
                  <td class="px-6">
                    <div class="flex items-center gap-3">
                      <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary" aria-hidden="true">{{ c.nombre.charAt(0).toUpperCase() }}</span>
                      <div class="min-w-0">
                        <div class="truncate text-sm font-semibold">{{ c.nombre }}</div>
                        <div class="font-mono text-xs text-fg-subtle">{{ c.slug }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 text-sm"><span class="inline-flex items-center gap-2 text-fg-muted"><app-icono [n]="rubros[c.rubro]?.icono ?? 'store'" [tamanio]="16" />{{ rubros[c.rubro]?.nombre ?? c.rubro }}</span></td>
                  <td class="px-4"><span class="ui-badge" [class]="c.publicada ? 'bg-ok-bg text-ok-fg' : 'bg-neutral-bg text-neutral-fg'">{{ c.publicada ? 'Publicada' : 'Borrador' }}</span></td>
                  <td class="px-4"><span class="ui-badge dot" [class]="c.estado === 'activo' ? 'bg-ok-bg text-ok-fg' : 'bg-bad-bg text-bad-fg'">{{ c.estado === 'activo' ? 'Activo' : 'Suspendido' }}</span></td>
                  <td class="px-4 text-sm text-fg-muted">{{ hace(c.creado_en) }}</td>
                  <td class="px-6">
                    <div class="flex items-center justify-end gap-1">
                      <a class="ui-icon-btn" [href]="enlace(c)" target="_blank" rel="noopener" [attr.aria-label]="'Ver landing de ' + c.nombre" title="Ver landing"><app-icono n="external" [tamanio]="18" /></a>
                      @if (c.estado === 'activo') {
                        <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" [disabled]="ocupado() === c.id" (click)="pendiente.set(c)"><app-icono n="pause" [tamanio]="14" />Suspender</button>
                      } @else {
                        <button type="button" class="ui-btn ui-btn-primary ui-btn-sm" [disabled]="ocupado() === c.id" (click)="reactivar(c)"><app-icono n="play" [tamanio]="14" />Reactivar</button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-14 text-center">
                    <span class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary"><app-icono [n]="hayFiltro() ? 'search' : 'users'" [tamanio]="22" /></span>
                    <p class="mb-0 mt-4 text-sm font-semibold">{{ svc.cargando() ? 'Cargando…' : hayFiltro() ? 'No hay clientes con esos filtros' : 'Todavía no hay clientes' }}</p>
                    @if (!svc.cargando()) { <p class="mb-0 mt-1 text-sm text-fg-subtle">{{ hayFiltro() ? 'Prueba con otra búsqueda.' : 'Aparecerán aquí cuando se registren.' }}</p> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filtrados().length > POR_PAGINA) {
          <div class="flex items-center justify-between border-t border-edge px-6 py-3 text-sm text-fg-muted">
            <span>{{ desde() }}–{{ hasta() }} de {{ filtrados().length }}</span>
            <div class="flex gap-1">
              <button type="button" class="ui-icon-btn" [disabled]="pagina() === 0" (click)="pagina.set(pagina() - 1)" aria-label="Página anterior"><app-icono n="left" [tamanio]="18" /></button>
              <button type="button" class="ui-icon-btn" [disabled]="hasta() >= filtrados().length" (click)="pagina.set(pagina() + 1)" aria-label="Página siguiente"><app-icono n="right" [tamanio]="18" /></button>
            </div>
          </div>
        }
      </section>
    </div>

    <app-confirmar [abierto]="!!pendiente()" titulo="¿Suspender esta landing?" boton="Suspender" [peligro]="true"
                   [mensaje]="'«' + (pendiente()?.nombre ?? '') + '» dejará de ser visible para el público hasta que la reactives.'"
                   (aceptar)="suspender()" (cancelar)="pendiente.set(null)" />`,
})
export class AdminClientesPage {
  protected readonly svc = inject(AdminService);
  private readonly avisos = inject(AvisoService);
  protected readonly rubros = RUBROS;
  protected readonly rubroLista = Object.entries(RUBROS).map(([id, r]) => ({ id, ...r }));
  protected readonly hace = hace;
  protected readonly POR_PAGINA = POR_PAGINA;

  protected readonly q = signal('');
  protected readonly rubro = signal('');
  protected readonly estado = signal('');
  protected readonly pagina = signal(0);
  protected readonly pendiente = signal<Cliente | null>(null);
  protected readonly ocupado = signal('');

  protected readonly hayFiltro = computed(() => !!(this.q() || this.rubro() || this.estado()));
  protected readonly filtrados = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.svc.clientes().filter((c) =>
      (!q || c.nombre.toLowerCase().includes(q) || c.slug.includes(q)) &&
      (!this.rubro() || c.rubro === this.rubro()) &&
      (!this.estado() || c.estado === this.estado()));
  });
  protected readonly visibles = computed(() => this.filtrados().slice(this.pagina() * POR_PAGINA, (this.pagina() + 1) * POR_PAGINA));
  protected readonly desde = computed(() => this.pagina() * POR_PAGINA + 1);
  protected readonly hasta = computed(() => Math.min((this.pagina() + 1) * POR_PAGINA, this.filtrados().length));

  constructor() {
    void this.svc.cargar();
  }

  protected enlace = (c: Cliente) => (env.dominioBase ? `https://${c.slug}.${env.dominioBase}` : `/n/${c.slug}`);

  protected limpiar(): void {
    this.q.set(''); this.rubro.set(''); this.estado.set(''); this.pagina.set(0);
  }

  protected async suspender(): Promise<void> {
    const c = this.pendiente();
    this.pendiente.set(null);
    if (c) await this.cambiar(c, 'suspendido', 'Landing suspendida. Dejará de verse en unos 30 segundos.');
  }

  protected reactivar(c: Cliente): Promise<void> {
    return this.cambiar(c, 'activo', 'Landing reactivada. Volverá a verse en unos 30 segundos.');
  }

  private async cambiar(c: Cliente, estado: 'activo' | 'suspendido', ok: string): Promise<void> {
    this.ocupado.set(c.id);
    const bien = await this.svc.cambiarEstado(c, estado);
    this.ocupado.set('');
    if (bien) this.avisos.ok(ok); else this.avisos.error('No se pudo cambiar el estado.');
  }
}
