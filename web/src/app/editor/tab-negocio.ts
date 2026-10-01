import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EditorStore } from '../core/editor.store';
import { NombreRed, normalizarRed, REDES } from '../core/redes';
import { CampoTexto } from '../shared/campo';
import { ImagenCampo } from '../shared/imagen-campo';

/** Datos del negocio: logo, contacto y redes sociales (se muestran en toda la página) */
@Component({
  selector: 'app-tab-negocio',
  imports: [CampoTexto, ImagenCampo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-7">
      <section class="flex flex-col gap-4">
        <h3 class="m-0 text-base font-semibold">Tu negocio</h3>
        <app-imagen-campo label="Logo" [valor]="n().logo_url" (valorChange)="store.setNegocio({ logo_url: $event })" [ladoMax]="600"
                          ayuda="Si no subes uno, se muestra el nombre del negocio." />
        <app-campo label="Nombre del negocio" [valor]="n().nombre" (valorChange)="store.setNegocio({ nombre: '' + $event })" [max]="60" />
      </section>

      <section class="flex flex-col gap-4">
        <h3 class="m-0 text-base font-semibold">Contacto</h3>
        <app-campo label="WhatsApp" tipo="tel" [valor]="n().whatsapp" (valorChange)="store.setNegocio({ whatsapp: '' + $event })" ph="51987654321"
                   ayuda="Con código de país, sin + ni espacios. A este número llegan los mensajes de todos los botones." />
        <app-campo label="Teléfono (opcional)" tipo="tel" [valor]="n().telefono" (valorChange)="store.setNegocio({ telefono: '' + $event })" [max]="30" />
        <app-campo label="Correo (opcional)" tipo="email" [valor]="n().email" (valorChange)="store.setNegocio({ email: '' + $event })" [max]="80" />
        <app-campo label="Dirección (opcional)" [valor]="n().direccion" (valorChange)="store.setNegocio({ direccion: '' + $event })" [max]="120"
                   ayuda="Aparece en 'Horarios y ubicación' con un botón «Cómo llegar»." />
      </section>

      <section class="flex flex-col gap-4">
        <div>
          <h3 class="m-0 text-base font-semibold">Redes sociales</h3>
          <p class="mb-0 mt-1 text-xs text-fg-subtle">Escribe tu usuario (@tunegocio) o pega el enlace. Solo se muestran las que llenes.</p>
        </div>
        @for (r of redes; track r.id) {
          <app-campo [label]="r.nombre" [valor]="n().redes[r.id] ?? ''" [ph]="r.ejemplo" tipo="text"
                     (valorChange)="store.setRed(r.id, '' + $event)" (salir)="normalizar(r.id)" />
        }
      </section>
    </div>`,
})
export class TabNegocio {
  protected readonly store = inject(EditorStore);
  protected readonly n = this.store.negocio;
  protected readonly redes = REDES;

  /** Al salir del campo: "@usuario" se convierte en su enlace https */
  protected normalizar(red: NombreRed): void {
    this.store.setRed(red, normalizarRed(red, this.n().redes[red] ?? ''));
  }
}
