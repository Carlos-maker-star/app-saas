import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LEGAL } from '../core/legal-textos';
import { MARCA } from '../core/marca';
import { Logo } from '../layout/logo';

/** Términos de uso y Política de privacidad. Qué documento sale lo fija la ruta: data: { doc: 'terminos' | 'privacidad' } */
@Component({
  selector: 'app-legal',
  imports: [Logo, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-ui block min-h-dvh bg-app' },
  template: `
    <header class="border-b border-edge bg-card">
      <div class="mx-auto flex h-16 w-full max-w-[760px] items-center justify-between px-5">
        <a routerLink="/" class="text-fg no-underline" aria-label="Ir al inicio"><app-logo /></a>
        <a routerLink="/registro" class="ui-btn ui-btn-primary ui-btn-sm">Crear mi página</a>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:pt-14">
      <article class="rise">
        <h1 class="m-0 text-[32px] font-semibold tracking-tight">{{ texto().titulo }}</h1>
        <p class="mb-0 mt-2 text-fg-muted">{{ texto().resumen }}</p>
        <p class="mb-0 mt-1 text-sm text-fg-subtle">Última actualización: {{ actualizado }}</p>

        @for (b of texto().bloques; track b.titulo) {
          <section class="mt-9">
            <h2 class="m-0 text-lg font-semibold">{{ b.titulo }}</h2>
            @for (p of b.parrafos ?? []; track $index) { <p class="mb-0 mt-3 leading-7 text-fg-muted">{{ p }}</p> }
            @if (b.lista) {
              <ul class="mb-0 mt-3 flex list-disc flex-col gap-2 pl-5 leading-7 text-fg-muted">
                @for (li of b.lista; track $index) { <li>{{ li }}</li> }
              </ul>
            }
          </section>
        }
      </article>

      <nav class="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-edge pt-6 text-sm" aria-label="Documentos legales">
        <a routerLink="/terminos" class="text-primary no-underline hover:underline">Términos de uso</a>
        <a routerLink="/privacidad" class="text-primary no-underline hover:underline">Política de privacidad</a>
        <a [href]="'mailto:' + correo" class="ml-auto text-fg-muted no-underline hover:underline">{{ correo }}</a>
      </nav>
    </main>`,
})
export class LegalPage {
  /** Viene de `data` de la ruta */
  readonly doc = input<'terminos' | 'privacidad'>('terminos');
  protected readonly texto = computed(() => LEGAL[this.doc()]);
  protected readonly actualizado = MARCA.legal.actualizado;
  protected readonly correo = MARCA.soporte.email;

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const t = this.texto();
      title.setTitle(`${t.titulo} · ${MARCA.nombre}`);
      meta.updateTag({ name: 'description', content: t.resumen });
      meta.updateTag({ name: 'robots', content: 'index,follow' });
    });
  }
}
