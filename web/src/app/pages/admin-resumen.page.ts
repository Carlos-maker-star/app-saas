import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, RUBROS } from '../core/admin.service';
import { hace } from '../core/format';
import { Icono } from '../shared/icono';

@Component({
  selector: 'app-admin-resumen',
  imports: [Icono, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rise flex flex-col gap-6">
      <div>
        <h1 class="m-0 text-[28px] font-semibold tracking-tight">Resumen</h1>
        <p class="mt-1.5 text-sm text-fg-muted">Estado de tus clientes y de sus landings.</p>
      </div>

      @if (svc.error()) { <p class="m-0 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert">{{ svc.error() }}</p> }

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (k of kpis(); track k.texto) {
          <div class="ui-card flex items-center gap-4 p-5">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-xl" [class]="k.clase"><app-icono [n]="k.icono" /></span>
            <div>
              <div class="text-[28px] font-semibold leading-none tracking-tight">@if (svc.cargando()) { <span class="inline-block h-7 w-10 animate-pulse rounded bg-card-2"></span> } @else { {{ k.valor }} }</div>
              <div class="mt-1 text-[13px] text-fg-muted">{{ k.texto }}</div>
            </div>
          </div>
        }
      </div>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section class="ui-card p-6">
          <h2 class="m-0 text-base font-semibold">Clientes por rubro</h2>
          <ul class="m-0 mt-5 flex list-none flex-col gap-4 p-0">
            @for (r of porRubro(); track r.id) {
              <li>
                <div class="mb-1.5 flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2 font-medium"><span class="text-fg-subtle"><app-icono [n]="r.icono" [tamanio]="16" /></span>{{ r.nombre }}</span>
                  <span class="font-semibold">{{ r.total }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-card-2"><div class="h-full rounded-full bg-primary transition-all duration-500" [style.width.%]="r.pct"></div></div>
              </li>
            }
          </ul>
        </section>

        <section class="ui-card overflow-hidden">
          <div class="flex items-center justify-between px-6 pb-3 pt-5">
            <h2 class="m-0 text-base font-semibold">Altas recientes</h2>
            <a routerLink="/admin/clientes" class="text-[13px] font-semibold text-primary no-underline hover:underline">Ver todos</a>
          </div>
          <ul class="m-0 list-none p-0">
            @for (c of recientes(); track c.id) {
              <li class="flex items-center gap-3 border-t border-edge px-6 py-3.5">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary" aria-hidden="true">{{ c.nombre.charAt(0).toUpperCase() }}</span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold">{{ c.nombre }}</div>
                  <div class="text-xs text-fg-subtle">{{ rubros[c.rubro]?.nombre }} · {{ hace(c.creado_en) }}</div>
                </div>
                <span class="ui-badge" [class]="c.estado === 'suspendido' ? 'bg-bad-bg text-bad-fg' : c.publicada ? 'bg-ok-bg text-ok-fg' : 'bg-neutral-bg text-neutral-fg'">
                  {{ c.estado === 'suspendido' ? 'Suspendido' : c.publicada ? 'Publicada' : 'Borrador' }}
                </span>
              </li>
            } @empty {
              <li class="border-t border-edge px-6 py-10 text-center text-sm text-fg-subtle">{{ svc.cargando() ? 'Cargando…' : 'Aún no hay clientes.' }}</li>
            }
          </ul>
        </section>
      </div>
    </div>`,
})
export class AdminResumenPage {
  protected readonly svc = inject(AdminService);
  protected readonly rubros = RUBROS;
  protected readonly hace = hace;

  protected readonly kpis = computed(() => {
    const c = this.svc.clientes();
    return [
      { valor: c.length, texto: 'Clientes', icono: 'users', clase: 'bg-info-bg text-info-fg' },
      { valor: c.filter((x) => x.estado === 'activo' && x.publicada).length, texto: 'Landings visibles', icono: 'globe', clase: 'bg-ok-bg text-ok-fg' },
      { valor: c.filter((x) => !x.publicada).length, texto: 'Sin publicar', icono: 'layout', clase: 'bg-warn-bg text-warn-fg' },
      { valor: c.filter((x) => x.estado === 'suspendido').length, texto: 'Suspendidos', icono: 'pause', clase: 'bg-bad-bg text-bad-fg' },
    ];
  });
  protected readonly porRubro = computed(() => {
    const c = this.svc.clientes();
    const max = Math.max(1, ...Object.keys(RUBROS).map((id) => c.filter((x) => x.rubro === id).length));
    return Object.entries(RUBROS).map(([id, r]) => {
      const total = c.filter((x) => x.rubro === id).length;
      return { id, ...r, total, pct: (total / max) * 100 };
    });
  });
  protected readonly recientes = computed(() => this.svc.clientes().slice(0, 5));

  constructor() {
    if (!this.svc.clientes().length) void this.svc.cargar();
  }
}
