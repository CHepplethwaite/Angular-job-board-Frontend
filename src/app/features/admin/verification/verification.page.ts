import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'admin-verification-page',
  template: `
    <h2>Verification Queue</h2>
    <p>Pending user verifications will appear here.</p>
  `,
})
export class AdminVerificationPage {}
