import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../core/auth.service';
import { AvisoService } from '../core/aviso.service';
import { NegocioService } from '../core/negocio.service';
import { urlSoporte } from '../core/soporte';
import { TemaApp } from '../core/tema-app';
import { Icono } from '../shared/icono';
import { Toasts } from '../shared/toasts';
import { Logo } from './logo';

interface ItemNav { etiqueta: string; icono: string; ruta?: string; consulta?: Record<string, string>; exacto?: boolean; pronto?: boolean; }
interface SeccionNav { titulo: string; items: ItemNav[]; }

const NAV: Record<'admin' | 'cliente', SeccionNav[]> = {
  admin: [
    { titulo: 'Plataforma', items: [
      { etiqueta: 'Resumen', icono: 'home', ruta: '/admin', exacto: true },
      { etiqueta: 'Clientes', icono: 'users', ruta: '/admin/clientes' },
    ] },
    { titulo: 'Próximamente', items: [{ etiqueta: 'Plantillas', icono: 'layout', pronto: true }] },
  ],
  cliente: [
    { titulo: 'Mi landing', items: [
      { etiqueta: 'Resumen', icono: 'home', ruta: '/panel', exacto: true },
      { etiqueta: 'Contenido', icono: 'layout', ruta: '/editor', consulta: { tab: 'contenido' } },
      { etiqueta: 'Diseño', icono: 'palette', ruta: '/editor', consulta: { tab: 'diseno' } },
      { etiqueta: 'Redes y contacto', icono: 'share', ruta: '/editor', consulta: { tab: 'negocio' } },
    ] },
  ],
};

/** Marco del panel: menú lateral + barra superior (admin y cliente) */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icono, Logo, Toasts],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ui block' },
  template: `
    <div class="flex h-dvh overflow-hidden">
      @if (menuAbierto()) { <div class="fixed inset-0 z-30 bg-black/40 lg:hidden" (click)="menuAbierto.set(false)" aria-hidden="true"></div> }

      <aside class="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-6 border-r border-edge bg-card px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0"
             [class.-translate-x-full]="!menuAbierto()">
        <a routerLink="/" class="px-2 py-1 no-underline text-fg"><app-logo /></a>

        @for (s of secciones(); track s.titulo) {
          <nav class="flex flex-col gap-1" [attr.aria-label]="s.titulo">
            <span class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">{{ s.titulo }}</span>
            @for (i of s.items; track i.etiqueta) {
              @if (i.ruta) {
                <a [routerLink]="i.ruta" [queryParams]="i.consulta" routerLinkActive="bg-primary-soft! text-primary!" [routerLinkActiveOptions]="{ exact: !!i.exacto }"
                   (click)="menuAbierto.set(false)"
                   class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-fg-muted no-underline transition-colors hover:bg-card-2">
                  <app-icono [n]="i.icono" [tamanio]="18" />{{ i.etiqueta }}
                </a>
              } @else {
                <span class="flex h-10 cursor-default items-center gap-3 rounded-lg px-3 text-sm font-medium text-fg-subtle opacity-70" aria-disabled="true">
                  <app-icono [n]="i.icono" [tamanio]="18" />{{ i.etiqueta }}
                  <span class="ml-auto rounded-full bg-neutral-bg px-2 py-0.5 text-[10px] font-semibold text-neutral-fg">Pronto</span>
                </span>
              }
            }
          </nav>
        }

        <div class="flex-1"></div>

        @if (modo() === 'cliente') {
          <a [href]="ayuda()" target="_blank" rel="noopener"
             class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-fg-muted no-underline transition-colors hover:bg-card-2">
            <app-icono n="mail" [tamanio]="18" />Ayuda y soporte
          </a>
        }

        <div class="flex items-center gap-3 rounded-xl border border-edge bg-card-2 p-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary" aria-hidden="true">{{ inicial() }}</span>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-semibold">{{ modo() === 'admin' ? 'Administrador' : (negocio.negocio()?.nombre ?? 'Mi negocio') }}</span>
            <span class="truncate text-xs text-fg-subtle">{{ auth.usuario()?.email }}</span>
          </div>
          <button type="button" class="ui-icon-btn size-9" (click)="salir()" aria-label="Cerrar sesión" title="Cerrar sesión"><app-icono n="logout" [tamanio]="18" /></button>
        </div>
        <p class="m-0 flex justify-center gap-4 text-xs text-fg-subtle">
          <a routerLink="/terminos" target="_blank" class="text-inherit no-underline hover:underline">Términos</a>
          <a routerLink="/privacidad" target="_blank" class="text-inherit no-underline hover:underline">Privacidad</a>
        </p>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-16 shrink-0 items-center gap-2 border-b border-edge bg-card px-4 sm:px-8">
          <button type="button" class="ui-icon-btn lg:hidden" (click)="menuAbierto.set(true)" aria-label="Abrir menú"><app-icono n="menu" /></button>
          <span class="flex-1 truncate text-sm font-semibold text-fg-muted">{{ modo() === 'admin' ? 'Administración' : 'Mi panel' }}</span>
          @if (modo() === 'cliente' && negocio.enlace()) {
            <a [href]="negocio.enlace()" target="_blank" rel="noopener" class="ui-btn ui-btn-outline ui-btn-sm hidden sm:inline-flex"><app-icono n="external" [tamanio]="16" />Ver mi página</a>
          }
          <button type="button" class="ui-icon-btn" (click)="tema.alternar()" [attr.aria-label]="tema.oscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <app-icono [n]="tema.oscuro() ? 'sun' : 'moon'" />
          </button>
        </header>

        <main class="flex-1 overflow-y-auto bg-app">
          <div class="mx-auto w-full max-w-[1200px] p-4 sm:p-8"><router-outlet /></div>
        </main>
      </div>
    </div>

    <app-toasts />`,
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly negocio = inject(NegocioService);
  protected readonly tema = inject(TemaApp);
  protected readonly avisos = inject(AvisoService);
  private readonly router = inject(Router);

  /** Lo fija la ruta: data: { modo: 'admin' | 'cliente' } */
  readonly modo = input<'admin' | 'cliente'>('cliente');
  protected readonly menuAbierto = signal(false);
  protected readonly secciones = computed(() => NAV[this.modo()]);
  protected readonly ayuda = computed(() => urlSoporte(this.negocio.negocio()?.nombre, this.auth.usuario()?.email));
  protected readonly inicial = computed(() => (this.auth.usuario()?.email ?? '?').charAt(0).toUpperCase());

  constructor() {
    if (!this.auth.esAdmin()) void this.negocio.cargar();
  }

  protected async salir(): Promise<void> {
    await this.auth.salir();
    await this.router.navigateByUrl('/login');
  }
}
