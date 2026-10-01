import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../core/auth.service';
import { env } from '../core/env';
import { Rubro } from '../core/models';
import { SLUG_VALIDO, slugify } from '../core/slug';
import { supabase } from '../core/supabase.client';
import { TemaApp } from '../core/tema-app';
import { Logo } from '../layout/logo';
import { Icono } from '../shared/icono';

const RUBROS: { id: Rubro; nombre: string; texto: string; icono: string; fondo: string; marca: string; tinta: string }[] = [
  { id: 'cafeteria', nombre: 'Cafetería', texto: 'Carta, pedidos y reservas', icono: 'coffee', fondo: '#FBF6EF', marca: '#6F4E37', tinta: '#2B1D14' },
  { id: 'barberia', nombre: 'Barbería', texto: 'Servicios, equipo y citas', icono: 'scissors', fondo: '#0D0D0D', marca: '#C9A227', tinta: '#F2F2F2' },
  { id: 'perfumes', nombre: 'Perfumes', texto: 'Catálogo con filtros', icono: 'perfume', fondo: '#FAF8F5', marca: '#1F1B24', tinta: '#1F1B24' },
  { id: 'salud', nombre: 'Salud', texto: 'Especialidades y citas', icono: 'heart', fondo: '#F6FBFB', marca: '#0E7C86', tinta: '#12333A' },
];

/** Onboarding: crea el negocio y su landing a partir de la plantilla del rubro */
@Component({
  selector: 'app-crear-negocio',
  imports: [Icono, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ui block min-h-dvh' },
  template: `
    <header class="border-b border-edge bg-card">
      <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <app-logo />
        <div class="flex items-center gap-1">
          <button type="button" class="ui-icon-btn" (click)="tema.alternar()" [attr.aria-label]="tema.oscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <app-icono [n]="tema.oscuro() ? 'sun' : 'moon'" />
          </button>
          <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="salir()"><app-icono n="logout" [tamanio]="16" />Salir</button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-10">
      <div class="rise">
        <p class="m-0 text-[13px] font-semibold uppercase tracking-wider text-primary">Último paso</p>
        <h1 class="mb-1 mt-1 text-[30px] font-semibold tracking-tight">Cuéntanos de tu negocio</h1>
        <p class="m-0 text-sm text-fg-muted">Con esto armamos tu landing. Después podrás cambiar textos, fotos y colores.</p>
      </div>

      <form class="mt-8 flex flex-col gap-6" (submit)="crear($event)">
        <fieldset class="ui-card m-0 p-6">
          <legend class="sr-only">Rubro</legend>
          <h2 class="m-0 text-base font-semibold">1. ¿A qué te dedicas?</h2>
          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Rubro">
            @for (r of rubros; track r.id) {
              <label class="group relative cursor-pointer overflow-hidden rounded-xl border-2 p-3 transition hover:-translate-y-0.5"
                     [class]="rubro() === r.id ? 'border-primary bg-primary-soft' : 'border-edge bg-card'">
                <input type="radio" name="rubro" class="sr-only" [value]="r.id" [checked]="rubro() === r.id" (change)="rubro.set(r.id)">
                <div class="mb-3 rounded-lg p-2.5" [style.background]="r.fondo" [style.color]="r.tinta" aria-hidden="true">
                  <div class="h-1.5 w-3/4 rounded-full opacity-80" [style.background]="r.tinta"></div>
                  <div class="mt-1.5 h-1.5 w-1/2 rounded-full opacity-30" [style.background]="r.tinta"></div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="rounded px-1.5 py-0.5 text-[8px] font-bold" [style.background]="r.marca" [style.color]="r.fondo">WA</span>
                    <span [style.color]="r.marca"><app-icono [n]="r.icono" [tamanio]="14" /></span>
                  </div>
                </div>
                <span class="block text-sm font-semibold">{{ r.nombre }}</span>
                <span class="block text-xs text-fg-subtle">{{ r.texto }}</span>
                @if (rubro() === r.id) {
                  <span class="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-on-primary"><app-icono n="check" [tamanio]="12" /></span>
                }
              </label>
            }
          </div>
        </fieldset>

        <section class="ui-card p-6">
          <h2 class="m-0 text-base font-semibold">2. Datos del negocio</h2>
          <div class="mt-4 grid gap-5">
            <div>
              <label class="ui-label" for="nombre">Nombre del negocio</label>
              <input class="ui-input" id="nombre" name="nombre" required maxlength="60" placeholder="Ej. Café Aroma"
                     [value]="nombre()" (input)="cambiarNombre($any($event.target).value)">
            </div>
            <div>
              <label class="ui-label" for="slug">Dirección de tu página</label>
              <div class="flex h-11 items-center overflow-hidden rounded-[10px] border border-edge bg-card transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                <input id="slug" name="slug" required autocapitalize="off" spellcheck="false" placeholder="mi-negocio"
                       class="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-subtle"
                       [value]="slug()" (input)="cambiarSlug($any($event.target).value)" (blur)="verificar()">
                <span class="h-full whitespace-nowrap border-l border-edge bg-card-2 px-3 text-sm leading-[42px] text-fg-subtle">.{{ dominio }}</span>
              </div>
              @switch (slugEstado()) {
                @case ('libre') { <p class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-ok-fg"><app-icono n="check" [tamanio]="14" />Disponible</p> }
                @case ('ocupado') { <p class="mt-1.5 text-xs font-medium text-bad-fg">Ese nombre ya está en uso. Prueba otro.</p> }
                @case ('invalido') { <p class="mt-1.5 text-xs font-medium text-bad-fg">Usa 3 a 40 letras minúsculas, números o guiones.</p> }
                @default { <p class="mt-1.5 text-xs text-fg-subtle">Así te encontrarán tus clientes: <b class="font-medium text-fg-muted">{{ vista() }}</b></p> }
              }
            </div>
            <div>
              <label class="ui-label" for="wa">WhatsApp de contacto</label>
              <input class="ui-input" id="wa" name="wa" inputmode="tel" required placeholder="51987654321"
                     [value]="whatsapp()" (input)="whatsapp.set($any($event.target).value)">
              <p class="mt-1.5 text-xs text-fg-subtle">Con código de país, sin + ni espacios. Aquí te escribirán tus clientes.</p>
            </div>
          </div>
        </section>

        @if (error()) {
          <p class="m-0 flex items-start gap-2 rounded-[10px] bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg" role="alert"><app-icono n="alert" [tamanio]="18" />{{ error() }}</p>
        }

        <button type="submit" class="ui-btn ui-btn-primary h-12 text-[15px]" [disabled]="cargando()">
          @if (cargando()) { <span class="ui-spinner"></span>Creando tu landing… } @else { <app-icono n="rocket" [tamanio]="18" />Crear mi landing }
        </button>
      </form>
    </main>`,
})
export class CrearNegocioPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly tema = inject(TemaApp);
  protected readonly rubros = RUBROS;
  protected readonly dominio = env.dominioBase || 'tuapp.com';

  protected readonly rubro = signal<Rubro>('cafeteria');
  protected readonly nombre = signal('');
  protected readonly slug = signal('');
  protected readonly whatsapp = signal('');
  protected readonly slugEstado = signal<'' | 'libre' | 'ocupado' | 'invalido'>('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly vista = computed(() => `${this.slug() || 'mi-negocio'}.${this.dominio}`);
  private slugEditado = false;

  protected cambiarNombre(v: string): void {
    this.nombre.set(v);
    if (!this.slugEditado) this.slug.set(slugify(v));
    this.slugEstado.set('');
  }

  protected cambiarSlug(v: string): void {
    this.slugEditado = true;
    this.slug.set(slugify(v));
    this.slugEstado.set('');
  }

  protected async verificar(): Promise<boolean> {
    const s = this.slug();
    if (!SLUG_VALIDO.test(s)) { this.slugEstado.set('invalido'); return false; }
    const { data } = await supabase!.rpc('slug_disponible', { p_slug: s });
    this.slugEstado.set(data ? 'libre' : 'ocupado');
    return !!data;
  }

  protected async crear(e: Event): Promise<void> {
    e.preventDefault();
    this.error.set('');
    if (!this.nombre().trim()) { this.error.set('Escribe el nombre de tu negocio.'); return; }
    if (this.whatsapp().replace(/\D/g, '').length < 8) { this.error.set('Escribe un WhatsApp válido, con código de país.'); return; }
    this.cargando.set(true);
    if (!(await this.verificar())) { this.cargando.set(false); return; }
    const { error } = await supabase!.rpc('crear_mi_negocio', {
      p_nombre: this.nombre().trim(), p_slug: this.slug(), p_rubro: this.rubro(), p_whatsapp: this.whatsapp(),
    });
    if (error) {
      this.cargando.set(false);
      this.error.set(error.message.includes('ya tiene un negocio') ? 'Esta cuenta ya tiene un negocio.' : 'No se pudo crear el negocio. Intenta de nuevo.');
      return;
    }
    await this.auth.refrescarPerfil();
    this.cargando.set(false);
    await this.router.navigateByUrl('/panel');
  }

  protected async salir(): Promise<void> {
    await this.auth.salir();
    await this.router.navigateByUrl('/login');
  }
}
