import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Pos } from './pages/pos/pos';

@Component({
  selector: 'app-root',
  imports: [Pos],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
