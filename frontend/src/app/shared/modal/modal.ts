import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly modal = inject(ModalService);

  close(): void {
    this.modal.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
