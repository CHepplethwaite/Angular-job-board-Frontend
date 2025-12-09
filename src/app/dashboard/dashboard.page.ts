import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'admin-dashboard-page',
  template: `
    <h1>Admin Dashboard</h1>
    <nav>
      <a routerLink="/admin/users">Users</a> |
      <a routerLink="/admin/verification">Verifications</a>
    </nav>
  `,
})
export class AdminDashboardPage {}
