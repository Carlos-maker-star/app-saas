import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LandingStore } from '../../core/landing.store';
import { DatosSeccion } from '../../core/models';
import { lista, resaltar } from '../../core/texto';
import { CountUp } from '../../shared/reveal';

const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HORAS = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];

/** Salud · Editorial + agenda: el visitante elige especialidad, día y hora y se arma su mensaje de WhatsApp */
@Component({
  selector: 'app-hero-agenda',
  imports: [CountUp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto grid max-w-6xl items-start gap-10 px-6 py-12 md:grid-cols-[1.15fr_.85fr] md:py-16">
      <div>
        @if (d().etiqueta) { <span class="edi-kick entra" style="--i:0"><i></i>{{ d().etiqueta }}</span> }
        <h1 class="edi-h1 entra" style="--i:1">{{ t().antes }} @if (t().resalte) { <em>{{ t().resalte }}</em> }</h1>
        @if (d().subtitulo) { <p class="edi-lead entra" style="--i:2">{{ d().subtitulo }}</p> }
        @if (stats().length) {
          <div class="edi-stats entra" style="--i:3">
            @for (s of stats(); track $index) { <div><b>{{ s.prefijo }}<span [appCount]="s.valor">{{ s.valor }}</span></b><span>{{ s.texto }}</span></div> }
          </div>
        }
      </div>

      <aside class="edi-agenda entra" style="--i:3" id="agenda" aria-label="Agenda tu cita">
        <h3>Agenda tu cita</h3>
        <p class="edi-s">Te respondemos por WhatsApp en minutos.</p>
        @if (especialidades().length) {
          <div class="edi-lbl">Especialidad</div>
          <div class="edi-chips">
            @for (e of especialidades(); track e; let n = $index) {
              <button type="button" class="edi-chip" [attr.aria-pressed]="esp() === n" (click)="esp.set(n)">{{ e }}</button>
            }
          </div>
        }
        <div class="edi-lbl">Día</div>
        <div class="edi-dias" [style.--n]="dia()" [style.--c]="dias().length || 6">
          @if (dias().length) { <span class="edi-ind"></span> }
          @for (f of dias(); track f.getTime(); let n = $index) {
            <button type="button" class="edi-chip edi-dia" [attr.aria-pressed]="dia() === n" (click)="elegirDia(n)">
              <small>{{ nombreDia(f) }}</small>{{ f.getDate() }}
            </button>
          }
        </div>
        <div class="edi-lbl">Hora</div>
        <div class="edi-horas">
          @for (h of horas(); track dia() + h; let n = $index) {
            <button type="button" class="edi-chip edi-hora" [style.--k]="n" [attr.aria-pressed]="hora() === h" (click)="hora.set(h)">{{ h }}</button>
          }
        </div>
        <p class="edi-res" [class.sw]="cambiando()">{{ resumen() }}</p>
        <a class="btn edi-wa" [class.edi-off]="!hora()" [href]="wa()" target="_blank" rel="noopener" [attr.aria-disabled]="!hora()">Enviar por WhatsApp</a>
      </aside>
    </div>`,
})
export class HeroAgenda {
  private readonly store = inject(LandingStore);
  readonly datos = input.required<DatosSeccion>();
  protected readonly d = computed(() => this.datos());
  protected readonly t = computed(() => resaltar(this.d()['titulo'], 2));

  protected readonly esp = signal(0);
  protected readonly dia = signal(0);
  protected readonly hora = signal('');
  protected readonly cambiando = signal(false);
  /** Los días dependen de la fecha de hoy: se calculan en el navegador (el servidor no sabe en qué huso está el visitante) */
  protected readonly dias = signal<Date[]>([]);

  protected readonly especialidades = computed(() => this.store.itemsDe('servicio').map((i) => i.nombre).slice(0, 4));
  protected readonly horas = computed(() => (lista(this.d()['horas']).length ? lista(this.d()['horas']) : HORAS).slice(0, 9));
  protected readonly stats = computed(() => {
    const s = this.d()['stat'];
    const propia = s && s.valor !== '' && s.valor != null && s.texto ? [{ prefijo: s.prefijo ?? '', valor: +s.valor, texto: s.texto }] : [];
    const equipo = this.store.itemsDe('miembro').length;
    const servicios = this.store.itemsDe('servicio').length;
    return [...propia, ...(equipo ? [{ prefijo: '', valor: equipo, texto: equipo === 1 ? 'especialista' : 'especialistas' }] : []),
      ...(servicios ? [{ prefijo: '', valor: servicios, texto: servicios === 1 ? 'servicio' : 'servicios' }] : [])].slice(0, 3);
  });

  private readonly plantilla = computed(() => this.d()['boton']?.mensaje ?? 'Hola, quisiera agendar una cita.');
  private readonly mensaje = computed(() => {
    const f = this.dias()[this.dia()];
    if (!f || !this.hora()) return this.plantilla();
    const esp = this.especialidades()[this.esp()];
    return `Hola, quisiera una cita${esp ? ' de ' + esp.toLowerCase() : ''} el ${NOMBRES_DIA[f.getDay()]} ${f.getDate()} a las ${this.hora()}.`;
  });
  protected readonly resumen = computed(() => (this.hora() ? this.mensaje() : 'Elige una hora para armar tu mensaje.'));
  protected readonly wa = computed(() => this.store.wa(this.mensaje()));

  protected nombreDia = (f: Date) => NOMBRES_DIA[f.getDay()];

  constructor() {
    afterNextRender(() => {
      const hoy = new Date(), lista6: Date[] = [];
      for (let i = 1; lista6.length < 6; i++) {
        const f = new Date(hoy);
        f.setDate(hoy.getDate() + i);
        if (f.getDay() !== 0) lista6.push(f); // sin domingos
      }
      this.dias.set(lista6);
    });
  }

  protected elegirDia(n: number): void {
    this.dia.set(n);
    this.cambiar(() => this.hora.set(''));
  }

  /** Cambia el texto del resumen con un desenfoque corto, para ocultar el salto entre dos textos */
  private cambiar(fn: () => void): void {
    this.cambiando.set(true);
    setTimeout(() => { fn(); this.cambiando.set(false); }, 110);
  }
}
