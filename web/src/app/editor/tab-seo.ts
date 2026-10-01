import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EditorStore } from '../core/editor.store';
import { env } from '../core/env';
import { CampoTexto } from '../shared/campo';
import { ImagenCampo } from '../shared/imagen-campo';

/** Cómo se ve tu página en Google y al compartir el enlace */
@Component({
  selector: 'app-tab-seo',
  imports: [CampoTexto, ImagenCampo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <div class="rounded-xl border border-edge bg-card-2 p-4" aria-label="Vista previa en Google">
        <p class="m-0 text-xs text-fg-subtle">Así aparecerá en Google</p>
        <p class="m-0 mt-2 truncate text-xs text-ok-fg">{{ direccion() }}</p>
        <p class="m-0 mt-0.5 truncate text-lg text-info-fg">{{ titulo() }}</p>
        <p class="m-0 mt-0.5 line-clamp-2 text-sm text-fg-muted">{{ descripcion() }}</p>
      </div>

      <app-campo label="Título" [valor]="seo().titulo ?? ''" (valorChange)="store.setSeo({ titulo: '' + $event })" [max]="60" [ph]="store.negocio().nombre"
                 ayuda="Lo ideal: nombre del negocio + qué haces + ciudad." />
      <app-campo label="Descripción" tipo="area" [valor]="seo().descripcion ?? ''" (valorChange)="store.setSeo({ descripcion: '' + $event })" [max]="160"
                 ph="Ej. Cafetería de especialidad en Miraflores. Café de altura y postres artesanales." />
      <app-imagen-campo label="Imagen al compartir" [valor]="seo().imagen ?? null" (valorChange)="store.setSeo({ imagen: $event ?? '' })"
                        ayuda="Se ve cuando compartes tu enlace por WhatsApp o redes. Mejor horizontal." />
    </div>`,
})
export class TabSeo {
  protected readonly store = inject(EditorStore);
  protected readonly seo = this.store.seo;
  protected readonly titulo = computed(() => this.seo().titulo || this.store.negocio().nombre || 'Tu negocio');
  protected readonly descripcion = computed(() => this.seo().descripcion || 'Escribe una descripción para que la gente sepa qué ofreces antes de entrar.');
  protected readonly direccion = computed(() => (env.dominioBase ? `${this.store.slug()}.${env.dominioBase}` : `${location.host}/n/${this.store.slug()}`));
}
