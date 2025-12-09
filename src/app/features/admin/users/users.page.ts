import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'admin-users-page',
  template: `
    <h2>Users</h2>
    <ul>
      <li *ngFor="let user of users">
        <a [routerLink]="['/admin/users', user.id]">
          {{ user.email }}
        </a>
      </li>
    </ul>
  `,
})
export class AdminUsersPage {
  users = [
    { id: 1, email: 'user1@example.com' },
    { id: 2, email: 'user2@example.com' },
  ];
}
