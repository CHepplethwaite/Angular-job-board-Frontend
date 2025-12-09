import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

import { AdminDashboardPage } from '../../dashboard/dashboard.page';
import { AdminUsersPage } from '../../features/admin/users/users.page';
import { AdminUserDetailPage } from '../admin/users/user-detail/user-detail.page';
import { AdminVerificationPage } from '../admin/verification/verification.page';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardPage,
    canActivate: [adminGuard],
  },
  {
    path: 'users',
    component: AdminUsersPage,
    canActivate: [adminGuard],
  },
  {
    path: 'users/:id',
    component: AdminUserDetailPage,
    canActivate: [adminGuard],
  },
  {
    path: 'verification',
    component: AdminVerificationPage,
    canActivate: [adminGuard],
  },
];
