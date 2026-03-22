import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Rotas principais da aplicação HospitalAO.
 *
 * Lazy loading: cada módulo só é descarregado quando
 * o utilizador navega para essa secção pela primeira vez.
 * Reduz o tempo de carregamento inicial da aplicação.
 *
 * Guards:
 *   authGuard — verifica se o utilizador está autenticado
 *   roleGuard — verifica se o utilizador tem o perfil necessário
 */
export const routes: Routes = [

  // Redirecionar a raiz para o dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Autenticação — sem layout e sem guard
  // (o utilizador ainda não está logado)
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(m => m.authRoutes),
  },

  // Todas as rotas protegidas dentro do layout principal
  // (barra lateral, cabeçalho, etc.)
  {
    path: '',
    // Layout principal com sidebar e header
    // Será criado no Sprint 1 (módulo de auth)
    loadComponent: () =>
      import('./shared/components/layout/layout.component')
        .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.routes')
            .then(m => m.dashboardRoutes),
        title: 'Dashboard — HospitalAO',
      },

      {
        path: 'pacientes',
        loadChildren: () =>
          import('./modules/pacientes/pacientes.routes')
            .then(m => m.pacientesRoutes),
        title: 'Pacientes — HospitalAO',
      },

      {
        path: 'recepcao',
        loadChildren: () =>
          import('./modules/recepcao/recepcao.routes')
            .then(m => m.recepcaoRoutes),
        title: 'Receção — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCAO', 'ENFERMEIRO'] },
      },

      {
        path: 'triagem',
        loadChildren: () =>
          import('./modules/triagem/triagem.routes')
            .then(m => m.triagemRoutes),
        title: 'Triagem — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ENFERMEIRO', 'MEDICO'] },
      },

      {
        path: 'consultas',
        loadChildren: () =>
          import('./modules/consultas/consultas.routes')
            .then(m => m.consultasRoutes),
        title: 'Consultas — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MEDICO'] },
      },

      {
        path: 'internamento',
        loadChildren: () =>
          import('./modules/internamento/internamento.routes')
            .then(m => m.internamentoRoutes),
        title: 'Internamento — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MEDICO', 'ENFERMEIRO'] },
      },

      {
        path: 'laboratorio',
        loadChildren: () =>
          import('./modules/laboratorio/laboratorio.routes')
            .then(m => m.laboratorioRoutes),
        title: 'Laboratório — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MEDICO', 'LABORATORIO'] },
      },

      {
        path: 'farmacia',
        loadChildren: () =>
          import('./modules/farmacia/farmacia.routes')
            .then(m => m.farmaciaRoutes),
        title: 'Farmácia — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'FARMACIA', 'MEDICO'] },
      },

      {
        path: 'faturacao',
        loadChildren: () =>
          import('./modules/faturacao/faturacao.routes')
            .then(m => m.faturacaoRoutes),
        title: 'Faturação — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'FINANCEIRO'] },
      },

      {
        path: 'relatorios',
        loadChildren: () =>
          import('./modules/relatorios/relatorios.routes')
            .then(m => m.relatoriosRoutes),
        title: 'Relatórios — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GESTOR', 'FINANCEIRO'] },
      },

      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/admin/admin.routes')
            .then(m => m.adminRoutes),
        title: 'Administração — HospitalAO',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },

    ],
  },

  // Página de acesso negado (403)
  {
    path: 'acesso-negado',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent),
    title: 'Acesso Negado — HospitalAO',
  },

  // Qualquer rota desconhecida → dashboard
  {
    path: '**',
    redirectTo: 'dashboard',
  },

];