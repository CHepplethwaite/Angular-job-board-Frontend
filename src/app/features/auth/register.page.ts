import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, RegisterRequest } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('password2');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  
  confirmPassword?.setErrors(null);
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a [routerLink]="['/auth/login']" class="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to existing account
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                formControlName="username"
                [class.border-red-300]="showError('username')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter username"
              />
              @if (showError('username')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('username') }}</p>
              }
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                [class.border-red-300]="showError('email')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter email"
              />
              @if (showError('email')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('email') }}</p>
              }
            </div>

            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">First Name (Optional)</label>
              <input
                id="first_name"
                type="text"
                formControlName="first_name"
                [class.border-red-300]="showError('first_name')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name (Optional)</label>
              <input
                id="last_name"
                type="text"
                formControlName="last_name"
                [class.border-red-300]="showError('last_name')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                [class.border-red-300]="showError('password')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
              />
              @if (showError('password')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('password') }}</p>
              }
              <p class="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            <div>
              <label for="password2" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="password2"
                type="password"
                formControlName="password2"
                [class.border-red-300]="showError('password2')"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
              />
              @if (showError('password2')) {
                <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('password2') }}</p>
              }
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              type="checkbox"
              formControlName="terms"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Terms of Service</a>
              and
              <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
            </label>
          </div>
          @if (showError('terms')) {
            <p class="text-sm text-red-600">{{ getErrorMessage('terms') }}</p>
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

          <div>
            <button
              type="submit"
              [disabled]="loading() || registerForm.invalid"
              [class.opacity-50]="loading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.authService.loading;
  readonly error = this.authService.authError;
  
  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      first_name: ['', [
        Validators.maxLength(30)
      ]],
      last_name: ['', [
        Validators.maxLength(150)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
      ]],
      password2: ['', [
        Validators.required
      ]],
      terms: [false, [
        Validators.requiredTrue
      ]]
    }, { validators: passwordMatchValidator });

    // Clear any previous errors
    this.authService.clearError();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const registerData: RegisterRequest = this.registerForm.value;
    
    this.authService.register(registerData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Show success message and redirect to login
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: true }
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          // Error is already handled by auth service
        }
      });
  }

  showError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return 'This field is required';
    }
    
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    }
    
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    
    if (control.errors['pattern']) {
      if (controlName === 'username') {
        return 'Username can only contain letters, numbers and underscores';
      }
      if (controlName === 'password') {
        return 'Password must contain at least one letter and one number';
      }
    }
    
    if (control.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    if (control.errors['requiredTrue']) {
      return 'You must accept the terms and conditions';
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