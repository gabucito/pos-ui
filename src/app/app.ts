import { Component, signal } from '@angular/core';
import { Pos } from './pages/pos/pos';

@Component({
  selector: 'app-root',
  imports: [Pos],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pos-ui');
}
