import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Modal } from './shared/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
