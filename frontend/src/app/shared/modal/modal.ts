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

  confirm(): void {
    this.modal.resolveConfirm(true);
  }

  cancel(): void {
    this.modal.resolveConfirm(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modal.data().confirm) {
      return;
    }
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
