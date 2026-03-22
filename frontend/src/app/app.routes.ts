import { Routes } from '@angular/router';

/**
 * Rotas do Sprint 0 — apenas uma página de placeholder.
 * As rotas reais serão adicionadas no Sprint 1.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/home/home.component')
        .then(m => m.HomeComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];