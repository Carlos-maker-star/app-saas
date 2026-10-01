import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AvisoService } from '../core/aviso.service';
import { EditorStore } from '../core/editor.store';
import { env } from '../core/env';
import { TemaApp } from '../core/tema-app';
import { TabContenido } from '../editor/tab-contenido';
import { TabDiseno } from '../editor/tab-diseno';
import { TabNegocio } from '../editor/tab-negocio';
import { TabSeo } from '../editor/tab-seo';
import { Confirmar } from '../shared/confirmar';
import { Icono } from '../shared/icono';
import { Toasts } from '../shared/toasts';

type Pestana = 'contenido' | 'diseno' | 'negocio' | 'seo';
const PESTANAS: { id: Pestana; nombre: string; icono: string }[] = [
  { id: 'contenido', nombre: 'Contenido', icono: 'layout' },
  { id: 'diseno', nombre: 'Diseño', icono: 'palette' },
  { id: 'negocio', nombre: 'Negocio', icono: 'store' },
  { id: 'seo', nombre: 'Google', icono: 'search' },
];

/** Editor de la landing: formularios a la izquierda y vista previa en vivo a la derecha. */
@Component({
  selector: 'app-editor',
  imports: [TabContenido, TabDiseno, TabNegocio, TabSeo, Icono, Confirmar, Toasts],
  providers: [EditorStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ui block' },
  template: `
    <div class="flex h-dvh flex-col">
      <!-- Barra superior -->
      <header class="flex h-14 shrink-0 items-center gap-2 border-b border-edge bg-card px-3 sm:gap-3 sm:px-4">
        <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="volver()"><app-icono n="left" [tamanio]="16" /><span class="hidden sm:inline">Panel</span></button>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold">{{ store.negocio().nombre || 'Mi landing' }}</div>
          <div class="truncate text-xs" [class]="estado().clase">{{ estado().texto }}</div>
        </div>

        <div class="hidden items-center gap-0.5 rounded-lg border border-edge bg-card-2 p-0.5 lg:flex" role="group" aria-label="Tamaño de la vista previa">
          <button type="button" class="ui-icon-btn !size-8" [class.!bg-card]="dispositivo() === 'pc'" [class.!text-fg]="dispositivo() === 'pc'" (click)="dispositivo.set('pc')" aria-label="Vista de computadora" [attr.aria-pressed]="dispositivo() === 'pc'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </button>
          <button type="button" class="ui-icon-btn !size-8" [class.!bg-card]="dispositivo() === 'movil'" [class.!text-fg]="dispositivo() === 'movil'" (click)="dispositivo.set('movil')" aria-label="Vista de celular" [attr.aria-pressed]="dispositivo() === 'movil'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>
          </button>
        </div>

        <button type="button" class="ui-icon-btn" (click)="tema.alternar()" [attr.aria-label]="tema.oscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"><app-icono [n]="tema.oscuro() ? 'sun' : 'moon'" /></button>
        <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" [disabled]="!store.sucio() || store.guardando()" (click)="guardar()">
          @if (store.guardando()) { <span class="ui-spinner"></span> }Guardar
        </button>
        <button type="button" class="ui-btn ui-btn-primary ui-btn-sm" [disabled]="store.publicando() || store.guardando() || (store.estadoPublicacion() === 'publicada' && !store.sucio())" (click)="publicar()">
          @if (store.publicando()) { <span class="ui-spinner"></span> } @else { <app-icono n="rocket" [tamanio]="16" /> }{{ store.publicada() ? 'Publicar cambios' : 'Publicar' }}
        </button>
      </header>

      @if (store.cargando()) {
        <div class="grid flex-1 place-items-center" role="status"><span class="ui-spinner !size-6 text-primary"></span></div>
      } @else if (store.errorCarga()) {
        <div class="grid flex-1 place-items-center px-6 text-center">
          <div class="max-w-md">
            <span class="mx-auto flex size-12 items-center justify-center rounded-full bg-bad-bg text-bad-fg"><app-icono n="alert" /></span>
            <p class="mb-0 mt-4 font-semibold">No se pudo abrir el editor</p>
            <p class="mt-1 text-sm text-fg-muted">{{ store.errorCarga() }}</p>
          </div>
        </div>
      } @else {
        <div class="flex min-h-0 flex-1">
          <!-- Panel de edición -->
          <aside class="min-h-0 w-full flex-col border-r border-edge bg-card lg:flex lg:w-[420px] lg:shrink-0" [class]="vista() === 'editar' ? 'flex' : 'hidden'">
            <div class="flex shrink-0 gap-1 border-b border-edge px-2 pt-2" role="tablist" aria-label="Secciones del editor">
              @for (p of pestanas; track p.id) {
                <button type="button" role="tab" [attr.aria-selected]="pestana() === p.id" [attr.id]="'tab-' + p.id"
                        class="-mb-px flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-2 py-2.5 text-[13px] font-semibold transition-colors"
                        [class]="pestana() === p.id ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'" (click)="pestana.set(p.id)">
                  <app-icono [n]="p.icono" [tamanio]="16" />{{ p.nombre }}
                </button>
              }
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto p-4 pb-24 lg:pb-6" role="tabpanel" [attr.aria-labelledby]="'tab-' + pestana()">
              @switch (pestana()) {
                @case ('contenido') { <app-tab-contenido [(abierta)]="abierta" (ir)="irA($event)" /> }
                @case ('diseno') { <app-tab-diseno /> }
                @case ('negocio') { <app-tab-negocio /> }
                @case ('seo') { <app-tab-seo /> }
              }
            </div>
          </aside>

          <!-- Vista previa -->
          <section class="min-w-0 flex-1 items-stretch justify-center overflow-hidden bg-card-2 p-0 lg:flex lg:p-5" [class]="vista() === 'previa' ? 'flex' : 'hidden'" aria-label="Vista previa">
            <div class="h-full w-full overflow-hidden bg-white transition-[max-width] duration-300"
                 [class]="dispositivo() === 'movil' ? 'max-w-[390px] rounded-[28px] border-[10px] border-neutral-800 shadow-2xl lg:max-h-[860px] lg:self-center' : 'max-w-full lg:rounded-xl lg:border lg:border-edge lg:shadow-lg'">
              <iframe #marco src="/vista-previa" title="Vista previa de tu landing" class="size-full border-0" (load)="alCargar()"></iframe>
            </div>
          </section>
        </div>

        <!-- Cambiar entre editar y vista previa (celular) -->
        <nav class="fixed inset-x-0 bottom-0 z-20 flex border-t border-edge bg-card lg:hidden" aria-label="Modo">
          <button type="button" class="flex-1 py-3.5 text-sm font-semibold" [class]="vista() === 'editar' ? 'text-primary' : 'text-fg-muted'" (click)="vista.set('editar')">Editar</button>
          <button type="button" class="flex-1 py-3.5 text-sm font-semibold" [class]="vista() === 'previa' ? 'text-primary' : 'text-fg-muted'" (click)="vista.set('previa')">Vista previa</button>
        </nav>
      }
    </div>

    <app-confirmar [abierto]="confirmaSalida()" titulo="Tienes cambios sin guardar" boton="Salir sin guardar" [peligro]="true"
                   mensaje="Si sales ahora, se perderán los cambios que no guardaste."
                   (aceptar)="salir()" (cancelar)="confirmaSalida.set(false)" />
    <app-toasts />`,
})
export class EditorPage {
  protected readonly store = inject(EditorStore);
  protected readonly tema = inject(TemaApp);
  private readonly avisos = inject(AvisoService);
  private readonly router = inject(Router);

  /** ?tab=contenido|diseno|negocio|seo */
  readonly tab = input<string>();
  protected readonly pestanas = PESTANAS;
  protected readonly pestana = signal<Pestana>('contenido');
  protected readonly abierta = signal<string | null>('hero');
  protected readonly dispositivo = signal<'pc' | 'movil'>('pc');
  protected readonly vista = signal<'editar' | 'previa'>('editar');
  protected readonly confirmaSalida = signal(false);
  private readonly marco = viewChild<ElementRef<HTMLIFrameElement>>('marco');

  private listo = false;
  private pendiente?: ReturnType<typeof setTimeout>;
  private pendienteIr?: ReturnType<typeof setTimeout>;

  protected readonly estado = computed(() => {
    const s = this.store;
    if (s.itemsPendientes() > 0) return { texto: 'Guardando productos…', clase: 'text-fg-subtle' };
    if (s.guardando()) return { texto: 'Guardando…', clase: 'text-fg-subtle' };
    if (s.sucio()) return { texto: 'Cambios sin guardar', clase: 'text-warn-fg' };
    switch (s.estadoPublicacion()) {
      case 'borrador': return { texto: 'Guardado · sin publicar', clase: 'text-fg-subtle' };
      case 'cambios': return { texto: 'Guardado · hay cambios sin publicar', clase: 'text-info-fg' };
      default: return { texto: 'Publicada y al día', clase: 'text-ok-fg' };
    }
  });

  constructor() {
    void this.store.cargar();

    effect(() => {
      const t = this.tab();
      if (t === 'contenido' || t === 'diseno' || t === 'negocio' || t === 'seo') this.pestana.set(t);
    });

    // cada cambio se envía a la vista previa (con una pausa corta para no saturarla)
    effect(() => {
      const datos = this.store.vista();
      if (this.store.cargando()) return;
      untracked(() => {
        clearTimeout(this.pendiente);
        this.pendiente = setTimeout(() => this.enviar('borrador', datos), 120);
      });
    });

    const alMensaje = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== this.marco()?.nativeElement.contentWindow) return;
      const m = e.data as { tipo?: string; id?: string };
      if (m?.tipo === 'listo') { this.listo = true; this.enviar('borrador', this.store.vista()); }
      if (m?.tipo === 'seccion' && m.id) this.abrirSeccion(m.id);
    };
    window.addEventListener('message', alMensaje);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('message', alMensaje);
      clearTimeout(this.pendiente);
      clearTimeout(this.pendienteIr);
    });
  }

  private enviar(tipo: 'borrador', datos: unknown): void {
    const w = this.marco()?.nativeElement.contentWindow;
    if (!this.listo || !w) return;
    w.postMessage({ tipo, datos: JSON.parse(JSON.stringify(datos)) }, location.origin);
  }

  protected alCargar(): void {
    // si el iframe se recargó, vuelve a esperar su aviso de "listo"
    this.listo = false;
  }

  /** Clic en una sección de la vista previa: abre su formulario */
  private abrirSeccion(id: string): void {
    this.pestana.set('contenido');
    this.abierta.set(id);
    this.vista.set('editar');
    setTimeout(() => document.getElementById('sec-' + id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
  }

  /** Desplaza la vista previa a una sección (tras el borrador, que se envía 120 ms después del cambio) */
  protected irA(id: string): void {
    clearTimeout(this.pendienteIr);
    this.pendienteIr = setTimeout(() => this.marco()?.nativeElement.contentWindow?.postMessage({ tipo: 'ir', id }, location.origin), 260);
  }

  protected async guardar(): Promise<void> {
    const error = await this.store.guardar();
    if (error) this.avisos.error(error); else this.avisos.ok('Cambios guardados');
  }

  protected async publicar(): Promise<void> {
    const error = await this.store.publicar();
    if (error) { this.avisos.error(error); return; }
    const url = env.dominioBase ? `${this.store.slug()}.${env.dominioBase}` : `/n/${this.store.slug()}`;
    this.avisos.ok('¡Listo! Tu landing está publicada en ' + url + '. Puede tardar hasta 30 segundos en verse.');
  }

  protected volver(): void {
    if (this.store.sucio()) this.confirmaSalida.set(true);
    else void this.router.navigateByUrl('/panel');
  }

  protected salir(): void {
    this.confirmaSalida.set(false);
    void this.router.navigateByUrl('/panel');
  }

  @HostListener('window:keydown', ['$event'])
  protected atajo(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (this.store.sucio() && !this.store.guardando()) void this.guardar();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  protected alCerrar(e: BeforeUnloadEvent): void {
    if (this.store.sucio()) e.preventDefault();
  }
}
