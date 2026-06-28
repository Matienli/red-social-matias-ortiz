import { Component, HostListener, inject } from '@angular/core';
import { ImageViewerService } from '../../services/image-viewer';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
})
export class ImageViewer {
  readonly viewer = inject(ImageViewerService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.viewer.visible()) {
      this.viewer.close();
    }
  }

  close(): void {
    this.viewer.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('image-viewer-backdrop')) {
      this.close();
    }
  }
}
