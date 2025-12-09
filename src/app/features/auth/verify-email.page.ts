import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        @if (verificationStatus === 'pending') {
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify your email
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              We've sent a verification link to your email address.
            </p>
          </div>
          
          <div class="mt-8 space-y-6">
            <p class="text-sm text-gray-600 text-center">
              Didn't receive the email? Check your spam folder or request a new verification link.
            </p>
            
            <form [formGroup]="resendForm" (ngSubmit)="onResend()">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  [class.border-red-300]="showError('email')"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                @if (showError('email')) {
                  <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('email') }}</p>
                }
              </div>
              
              <div class="mt-4">
                <button
                  type="submit"
                  [disabled]="loading() || resendForm.invalid"
                  [class.opacity-50]="loading()"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
                >
                  @if (loading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Resend verification email
                </button>
              </div>
            </form>
          </div>
        }
        
        @if (verificationStatus === 'success') {
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email verified!
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div class="mt-6">
              <a
                [routerLink]="['/auth/login']"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to login
              </a>
            </div>
          </div>
        }
        
        @if (verificationStatus === 'error') {
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification failed
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              {{ errorMessage }}
            </p>
            <div class="mt-6 space-y-3">
              <a
                [routerLink]="['/auth/login']"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to login
              </a>
              <button
                type="button"
                (click)="resetVerification()"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try again
              </button>
            </div>
          </div>
        }

        @if (error()) {
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
              </div>
            </div>
          </div>
        }
        
        <div class="text-center mt-6">
          <a [routerLink]="['/auth/login']" class="font-medium text-indigo-600 hover:text-indigo-500">
            Return to login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerifyEmailPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.authService.loading;
  readonly error = this.authService.authError;

  verificationStatus: 'pending' | 'success' | 'error' = 'pending';
  errorMessage: string = '';
  resendForm: FormGroup;

  constructor() {
    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.authService.clearError();
  }

  ngOnInit(): void {
    // Check if we have verification parameters in the URL
    this.route.queryParams.subscribe(params => {
      const uid = params['uid'];
      const token = params['token'];

      if (uid && token) {
        this.verifyEmail(uid, token);
      } else {
        this.verificationStatus = 'pending';
      }
    });
  }

  verifyEmail(uid: string, token: string): void {
    this.authService.verifyEmail(uid, token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.verificationStatus = 'success';
        },
        error: (error) => {
          this.verificationStatus = 'error';
          this.errorMessage = error.message || 'Verification link is invalid or has expired.';
        }
      });
  }

  onResend(): void {
    if (this.resendForm.invalid) {
      this.markFormGroupTouched(this.resendForm);
      return;
    }

    const email = this.resendForm.get('email')?.value;
    
    this.authService.resendVerificationEmail(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Show success message
          this.authService.setAuthError('Verification email sent successfully');
          setTimeout(() => {
            this.authService.clearError();
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to resend verification email:', error);
        }
      });
  }

  resetVerification(): void {
    this.verificationStatus = 'pending';
    this.router.navigate(['/auth/verify-email']);
  }

  showError(controlName: string): boolean {
    const control = this.resendForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.resendForm.get(controlName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return 'This field is required';
    }
    
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    
    return 'Invalid value';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}