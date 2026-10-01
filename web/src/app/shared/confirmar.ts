import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/** Diálogo de confirmación (usa <dialog> nativo: foco, Esc y fondo ya resueltos por el navegador). */
@Component({
  selector: 'app-confirmar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="ui-dialog" (close)="cancelar.emit()" (click)="fondo($event)" aria-labelledby="dlg-titulo">
      <div class="p-6">
        <h2 id="dlg-titulo" class="m-0 text-lg font-semibold">{{ titulo() }}</h2>
        <p class="mt-2 text-sm text-fg-muted">{{ mensaje() }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="ui-btn ui-btn-outline ui-btn-sm" (click)="dlg.close()">Cancelar</button>
          <button type="button" [class]="peligro() ? 'ui-btn ui-btn-sm ui-btn-danger' : 'ui-btn ui-btn-sm ui-btn-primary'"
                  (click)="aceptar.emit()">{{ boton() }}</button>
        </div>
      </div>
    </dialog>`,
})
export class Confirmar {
  readonly abierto = input(false);
  readonly titulo = input('¿Confirmar?');
  readonly mensaje = input('');
  readonly boton = input('Confirmar');
  readonly peligro = input(false);
  readonly aceptar = output<void>();
  readonly cancelar = output<void>();
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.abierto() && !d.open) d.showModal();
      else if (!this.abierto() && d.open) d.close();
    });
  }

  /** Clic en el fondo oscuro cierra */
  protected fondo(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.dlg().nativeElement.close();
  }
}
