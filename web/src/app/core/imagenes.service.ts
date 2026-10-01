import { inject, Injectable } from '@angular/core';
import { Auth } from './auth.service';
import { supabase } from './supabase.client';

const MAX_ENTRADA = 15 * 1024 * 1024; // 15 MB antes de comprimir
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

/** Sube imágenes al bucket `media/<tenant_id>/…` comprimidas a WebP. */
@Injectable({ providedIn: 'root' })
export class ImagenesService {
  private readonly auth = inject(Auth);

  /** Devuelve la URL pública. Lanza Error con un mensaje listo para mostrar. */
  async subir(archivo: File, ladoMax = 1400): Promise<string> {
    const tenant = this.auth.perfil()?.tenant_id;
    if (!tenant || !supabase) throw new Error('No hay sesión.');
    if (!TIPOS.includes(archivo.type)) throw new Error('Usa una imagen JPG, PNG o WebP.');
    if (archivo.size > MAX_ENTRADA) throw new Error('La imagen pesa más de 15 MB.');

    const blob = await this.comprimir(archivo, ladoMax);
    if (blob.size > 3 * 1024 * 1024) throw new Error('La imagen sigue siendo muy pesada (máx. 3 MB).');

    const ruta = `${tenant}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from('media').upload(ruta, blob, {
      contentType: 'image/webp', cacheControl: '31536000',
    });
    if (error) throw new Error('No se pudo subir la imagen. Intenta de nuevo.');
    return supabase.storage.from('media').getPublicUrl(ruta).data.publicUrl;
  }

  private async comprimir(archivo: File, ladoMax: number): Promise<Blob> {
    const bmp = await createImageBitmap(archivo);
    const escala = Math.min(1, ladoMax / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * escala);
    const h = Math.round(bmp.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return new Promise((ok, fallo) =>
      canvas.toBlob((b) => (b ? ok(b) : fallo(new Error('No se pudo procesar la imagen.'))), 'image/webp', 0.82));
  }
}
