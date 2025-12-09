import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    @if (showHeader()) {
      <header class="bg-white shadow">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold text-gray-900">Django Angular App</h1>
              </div>
            </div>
            
            <div class="flex items-center">
              @if (authService.authenticated()) {
                <div class="ml-4 flex items-center space-x-4">
                  <span class="text-sm text-gray-700">
                    {{ authService.user()?.username }}
                  </span>
                  <button
                    (click)="logout()"
                    class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              }
            </div>
          </div>
        </nav>
      </header>
    }
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  
  readonly showHeader = signal(true);

  ngOnInit(): void {
    // Hide header on auth pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const hideOnRoutes = ['/auth/login', '/auth/register'];
      this.showHeader.set(!hideOnRoutes.some(route => event.url.includes(route)));
    });
  }

  logout(): void {
    this.authService.logout();
  }
}