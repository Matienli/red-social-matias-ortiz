import { Injectable, signal } from '@angular/core';

export interface ModalData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  confirm?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  readonly visible = signal(false);
  readonly data = signal<ModalData>({ title: '', message: '', type: 'info' });

  private confirmResolver: ((value: boolean) => void) | null = null;

  open(data: ModalData): void {
    this.data.set({ type: 'info', ...data, confirm: false });
    this.visible.set(true);
  }

  confirm(data: Omit<ModalData, 'confirm'>): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmResolver = resolve;
      this.data.set({
        type: 'info',
        confirmLabel: 'Sí, extender',
        cancelLabel: 'No',
        ...data,
        confirm: true,
      });
      this.visible.set(true);
    });
  }

  close(): void {
    this.visible.set(false);
    if (this.confirmResolver) {
      this.confirmResolver(false);
      this.confirmResolver = null;
    }
  }

  resolveConfirm(result: boolean): void {
    this.visible.set(false);
    this.confirmResolver?.(result);
    this.confirmResolver = null;
  }
}
