import { Component, inject, OnInit, DestroyRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { formatProfileForDisplay, getAvatarUrl } from '../../shared/models/profile.model';
import { User } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
          <!-- Profile Header -->
          <div class="bg-white shadow rounded-lg mb-8">
            <div class="px-6 py-8 sm:p-10">
              <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                  <img
                    [src]="avatarUrl()"
                    alt="Profile picture"
                    class="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div class="mt-4 text-center">
                    <label class="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        #fileInput
                        (change)="onFileSelected($event)"
                      />
                      <span class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Change photo
                      </span>
                    </label>
                  </div>
                </div>
                
                <div class="flex-1">
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ user()?.first_name }} {{ user()?.last_name }}
                  </h1>
                  <p class="text-sm text-gray-500">@{{ user()?.username }}</p>
                  <p class="mt-1 text-sm text-gray-500">{{ user()?.email }}</p>
                  
                  <div class="mt-4 flex items-center space-x-4">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-1 text-sm text-gray-600">
                        Member since {{ formatDate(user()?.date_joined) }}
                      </span>
                    </div>
                    
                    <div class="flex items-center">
                      <div class="h-2 w-2 rounded-full bg-green-400"></div>
                      <span class="ml-1 text-sm text-gray-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-8 sm:p-10">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>
              
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="first_name" class="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div class="mt-1">
                      <input
                        type="text"
                        id="first_name"
                        formControlName="first_name"
                        [class.border-red-300]="showError('first_name')"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      @if (showError('first_name')) {
                        <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('first_name') }}</p>
                      }
                    </div>
                  </div>

                  <div>
                    <label for="last_name" class="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div class="mt-1">
                      <input
                        type="text"
                        id="last_name"
                        formControlName="last_name"
                        [class.border-red-300]="showError('last_name')"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      @if (showError('last_name')) {
                        <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('last_name') }}</p>
                      }
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="email" class="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div class="mt-1">
                      <input
                        type="email"
                        id="email"
                        formControlName="email"
                        [class.border-red-300]="showError('email')"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      @if (showError('email')) {
                        <p class="mt-1 text-sm text-red-600">{{ getErrorMessage('email') }}</p>
                      }
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="phone" class="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <div class="mt-1">
                      <input
                        type="tel"
                        id="phone"
                        formControlName="phone"
                        [class.border-red-300]="showError('phone')"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="bio" class="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div class="mt-1">
                      <textarea
                        id="bio"
                        rows="3"
                        formControlName="bio"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                    <p class="mt-2 text-sm text-gray-500">
                      Brief description for your profile.
                    </p>
                  </div>
                </div>

                @if (error()) {
                  <div class="mt-6 rounded-md bg-red-50 p-4">
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

                @if (success()) {
                  <div class="mt-6 rounded-md bg-green-50 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">{{ success() }}</h3>
                      </div>
                    </div>
                  </div>
                }

                <div class="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    (click)="onCancel()"
                    class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="loading() || profileForm.invalid"
                    [class.opacity-50]="loading()"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
                  >
                    @if (loading()) {
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.userService.loading;
  readonly error = this.userService.userError;
  
  private readonly userData = signal<User | null>(null);
  readonly user = this.userData.asReadonly();
  readonly avatarUrl = computed(() => getAvatarUrl(this.userData() as any));
  
  readonly success = signal<string | null>(null);

  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.maxLength(30)]],
      last_name: ['', [Validators.maxLength(150)]],
      email: ['', [Validators.email]],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.userData.set(user);
          this.profileForm.patchValue({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || '',
            bio: user.bio || ''
          });
        },
        error: (error) => {
          console.error('Failed to load profile:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    const formData = this.profileForm.value;
    
    this.userService.updateProfile(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.userData.set(response.user);
          this.success.set('Profile updated successfully');
          this.clearMessages();
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.success.set(null);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.userService.setError('Please select an image file');

      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.userService.setError('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    this.userService.updateProfile({ avatar: file })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.userData.set(response.user);
          this.success.set('Profile picture updated successfully');
          this.clearMessages();
        },
        error: (error) => {
          console.error('Failed to update avatar:', error);
        }
      });
  }

  onCancel(): void {
    // Reset form to original values
    if (this.userData()) {
      this.profileForm.patchValue({
        first_name: this.userData()!.first_name,
        last_name: this.userData()!.last_name,
        email: this.userData()!.email,
        phone: this.userData()!.phone || '',
        bio: this.userData()!.bio || ''
      });
    }
  }

  showError(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) {
      return 'This field is required';
    }
    
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    }
    
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    
    return 'Invalid value';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.success.set(null);
      this.userService.clearError();
    }, 5000);
  }
}