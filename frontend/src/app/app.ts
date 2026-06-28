import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './shared/modal/modal';
import { ImageViewer } from './shared/image-viewer/image-viewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Modal, ImageViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
