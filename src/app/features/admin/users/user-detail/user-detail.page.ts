import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'admin-user-detail-page',
  template: `
    <h3>User Detail</h3>
    <p>User ID: {{ userId }}</p>
  `,
})
export class AdminUserDetailPage {
  userId: string | null;

  constructor(private route: ActivatedRoute) {
    this.userId = this.route.snapshot.paramMap.get('id');
  }
}
