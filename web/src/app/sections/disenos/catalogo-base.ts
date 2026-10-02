import { computed, Directive, inject, input } from '@angular/core';
import { precio } from '../../core/format';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion, Item } from '../../core/models';
import { urlSegura } from '../../core/seguridad';

/** Lo que comparten todas las formas de mostrar el catálogo (cada diseño dibuja la suya) */
@Directive()
export abstract class CatalogoBase {
  protected readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly items = computed(() => this.store.itemsDe(this.datos()['tipo_item'] ?? 'producto'));
  protected readonly boton = computed(() => this.datos()['boton_item'] ?? 'Consultar');
  protected readonly grupos = computed(() => {
    const m = new Map<string, Item[]>();
    for (const i of this.items()) m.set(i.categoria ?? '', [...(m.get(i.categoria ?? '') ?? []), i]);
    return [...m].map(([categoria, items]) => ({ categoria, items }));
  });

  protected fmt = (i: Item) => precio(i.precio, this.datos()['moneda'] ?? 'S/');
  protected imagen = (i: Item) => urlSegura(i.imagen_url);
  protected pedir = (i: Item) => this.store.wa(this.datos()['mensaje_item'] ?? 'Hola, me interesa: {nombre}', i.nombre);
}
