import { Injectable, signal } from '@angular/core';

export interface ModalData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  readonly visible = signal(false);
  readonly data = signal<ModalData>({ title: '', message: '', type: 'info' });

  open(data: ModalData): void {
    this.data.set({ type: 'info', ...data });
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }
}
