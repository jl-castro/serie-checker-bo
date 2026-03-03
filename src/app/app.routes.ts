import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'scanner'
  },
  {
    path: 'scanner',
    loadComponent: () =>
      import('./features/scanner/scanner.component').then(
        (m) => m.ScannerComponent
      )
  },
  {
    path: 'manual',
    loadComponent: () =>
      import('./features/manual-input/manual-input.component').then(
        (m) => m.ManualInputComponent
      )
  },
  {
    path: 'batch',
    loadComponent: () =>
      import('./features/batch/batch.component').then((m) => m.BatchComponent)
  }
];
