import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./pages/transactions/transactions.component').then(
        (m) => m.TransactionsComponent,
      ),
  },
  {
    path: 'cases',
    loadComponent: () =>
      import('./pages/cases/cases.component').then((m) => m.CasesComponent),
  },
  {
    path: 'investigation',
    loadComponent: () =>
      import('./pages/investigation/investigation.component').then(
        (m) => m.InvestigationComponent,
      ),
  },

  {
    path: 'cases/:id',
    loadComponent: () =>
      import('./pages/cases/case-detail/case-detail.component').then(
        (m) => m.CaseDetailComponent,
      ),
  },

  {
    path: 'transactions/:id',
    loadComponent: () =>
      import('./pages/transaction-details/transaction-details.component').then(
        (m) => m.TransactionDetailsComponent,
      ),
  },
];
