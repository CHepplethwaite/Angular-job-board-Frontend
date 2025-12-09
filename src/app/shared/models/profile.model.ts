import { BaseUser } from './user.model';
import { environment } from '../../../environments/environment';

export interface Profile extends BaseUser {
  profile: {
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
    social_links?: SocialLinks;
    preferences?: UserPreferences;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  two_factor_auth: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  email_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile?: {
    phone?: string;
    avatar?: File;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    bio?: string;
    date_of_birth?: string;
    gender?: 'M' | 'F' | 'O' | '';
    website?: string;
    social_links?: SocialLinks;
    preferences?: Partial<UserPreferences>;
  };
}

export interface ProfileStats {
  total_logins: number;
  last_login_ip?: string;
  login_count_30d: number;
  total_orders?: number;
  total_spent?: number;
  achievements?: string[];
  badges?: string[];
}

export interface ProfileActivity {
  id: number;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper functions
export function getAvatarUrl(profile: Profile | null): string {
  if (!profile?.profile?.avatar) {
    return '/assets/images/default-avatar.png';
  }
  
  if (profile.profile.avatar.startsWith('http')) {
    return profile.profile.avatar;
  }
  
  return `${environment.apiUrl}${profile.profile.avatar}`;
}

export function getProfileCompletion(profile: Profile): number {
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.email,
    profile.profile?.phone,
    profile.profile?.address,
    profile.profile?.city,
    profile.profile?.country,
  ];
  
  const completed = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((completed / fields.length) * 100);
}

export function formatProfileForDisplay(profile: Profile): any {
  return {
    ...profile,
    full_name: `${profile.first_name} ${profile.last_name}`.trim(),
    avatar_url: getAvatarUrl(profile),
    profile_completion: getProfileCompletion(profile),
    member_since: new Date(profile.date_joined).toLocaleDateString(),
    last_seen: profile.last_login 
      ? new Date(profile.last_login).toLocaleDateString()
      : 'Never'
  };
}