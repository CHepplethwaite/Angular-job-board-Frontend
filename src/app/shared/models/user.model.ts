export interface BaseUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface UserProfile extends BaseUser {
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O' | '';
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
}

export interface UserWithPermissions extends BaseUser {
  groups: string[];
  user_permissions: string[];
  permissions: string[];
}

export interface UserListFilters {
  search?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined_after?: string;
  date_joined_before?: string;
  ordering?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  current_password?: string;
}

// Utility types
export type UserRole = 'user' | 'staff' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

// Helper functions
export function getUserFullName(user: BaseUser): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.username;
}

export function getUserInitials(user: BaseUser): string {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  return (first + last).toUpperCase() || user.username[0].toUpperCase();
}

export function getUserRole(user: BaseUser): UserRole {
  if (user.is_superuser) return 'admin';
  if (user.is_staff) return 'staff';
  return 'user';
}

export function getUserStatus(user: BaseUser): UserStatus {
  if (!user.is_active) return 'inactive';
  if (!user.last_login && new Date(user.date_joined) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    return 'pending';
  }
  return 'active';
}