import { inject, Injectable } from '@angular/core';
import { Auth } from './auth.service';
import { supabase } from './supabase.client';

const MAX_ENTRADA = 15 * 1024 * 1024; // 15 MB antes de comprimir
const MAX_SALIDA = 3 * 1024 * 1024; // límite del bucket
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

/** Sube imágenes al bucket `media/<tenant_id>/…`. */
@Injectable({ providedIn: 'root' })
export class ImagenesService {
  private readonly auth = inject(Auth);

  /** Foto o logo: se reduce y se guarda como WebP. Devuelve la URL pública (o lanza un Error con mensaje listo para mostrar). */
  async subir(archivo: File, ladoMax = 1400): Promise<string> {
    this.validar(archivo);
    const bmp = await createImageBitmap(archivo);
    const escala = Math.min(1, ladoMax / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * escala);
    const h = Math.round(bmp.height * escala);
    const blob = await this.dibujar(bmp, w, h, 0, 0, bmp.width, bmp.height, 'image/webp', 0.82);
    return this.guardar(blob, 'webp');
  }

  /**
   * Icono de la pestaña: recorte cuadrado centrado de 256×256 en PNG (el formato que mejor aceptan
   * navegadores y Google para los favicons).
   */
  async subirIcono(archivo: File): Promise<string> {
    this.validar(archivo);
    const bmp = await createImageBitmap(archivo);
    const lado = Math.min(bmp.width, bmp.height);
    const blob = await this.dibujar(bmp, 256, 256, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 'image/png');
    return this.guardar(blob, 'png', 'icono-');
  }

  private validar(archivo: File): void {
    if (!TIPOS.includes(archivo.type)) throw new Error('Usa una imagen JPG, PNG o WebP.');
    if (archivo.size > MAX_ENTRADA) throw new Error('La imagen pesa más de 15 MB.');
  }

  private dibujar(bmp: ImageBitmap, w: number, h: number, sx: number, sy: number, sw: number, sh: number,
                  tipo: string, calidad?: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, sx, sy, sw, sh, 0, 0, w, h);
    bmp.close();
    return new Promise((ok, fallo) =>
      canvas.toBlob((b) => (b ? ok(b) : fallo(new Error('No se pudo procesar la imagen.'))), tipo, calidad));
  }

  private async guardar(blob: Blob, ext: 'webp' | 'png', prefijo = ''): Promise<string> {
    const tenant = this.auth.perfil()?.tenant_id;
    if (!tenant || !supabase) throw new Error('No hay sesión.');
    if (blob.size > MAX_SALIDA) throw new Error('La imagen sigue siendo muy pesada (máx. 3 MB).');

    const ruta = `${tenant}/${prefijo}${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(ruta, blob, {
      contentType: `image/${ext}`, cacheControl: '31536000',
    });
    if (error) throw new Error('No se pudo subir la imagen. Intenta de nuevo.');
    return supabase.storage.from('media').getPublicUrl(ruta).data.publicUrl;
  }
}
