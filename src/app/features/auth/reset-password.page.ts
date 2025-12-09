import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('new_password');
  const confirmPassword = control.get('confirm_password');
  
  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  
  confirmPassword?.setErrors(null);
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a [routerLink]="['/auth/login']" class="font-medium text-indigo-600 hover:text-indigo-500">
              return to login
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="new_password" class="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="new_password"
                type="password"
                formControlName="new_password"
                [class.border-red-300]="showError('new_password')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
              @if (showError('new_password')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('new_password') }}</p>
              }
              <p class="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            <div>
              <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirm_password"
                type="password"
                formControlName="confirm_password"
                [class.border-red-300]="showError('confirm_password')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
              @if (showError('confirm_password')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('confirm_password') }}</p>
              }
            </div>
          </div>

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

          @if (successMessage()) {
            <div class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">{{ successMessage() }}</h3>
                </div>
              </div>
            </div>
          }

          <div>
            <button
              type="submit"
              [disabled]="loading() || resetPasswordForm.invalid"
              [class.opacity-50]="loading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Reset password
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.authService.loading;
  readonly error = this.authService.authError;
  readonly successMessage = this.authService.authError; // Reusing for simplicity

  resetPasswordForm: FormGroup;
  uid: string = '';
  token: string = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      new_password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
      ]],
      confirm_password: ['', [
        Validators.required
      ]]
    }, { validators: passwordMatchValidator });

    this.authService.clearError();
  }

  ngOnInit(): void {
    // Get uid and token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.uid = params['uid'];
      this.token = params['token'];
      
      if (!this.uid || !this.token) {
        this.authService.setAuthError('Invalid or missing reset parameters');
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    if (!this.uid || !this.token) {
      this.authService.setAuthError('Invalid reset link');
      return;
    }

    const newPassword = this.resetPasswordForm.get('new_password')?.value;
    
    this.authService.confirmPasswordReset(this.uid, this.token, newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Redirect to login after successful reset
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { passwordReset: 'success' }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Password reset failed:', error);
        }
      });
  }

  showError(controlName: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetPasswordForm.get(controlName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return 'This field is required';
    }
    
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    
    if (control.errors['pattern']) {
      return 'Password must contain at least one letter and one number';
    }
    
    if (control.errors['passwordMismatch']) {
      return 'Passwords do not match';
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