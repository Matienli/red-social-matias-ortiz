import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageViewerService {
  readonly visible = signal(false);
  readonly src = signal<string | null>(null);
  readonly alt = signal('');

  open(src: string, alt = ''): void {
    this.src.set(src);
    this.alt.set(alt);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.src.set(null);
    this.alt.set('');
  }
}
