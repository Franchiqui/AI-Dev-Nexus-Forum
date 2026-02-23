'use client';

import { type AuthStatusPaths } from '@/components/auth/auth-status';

export interface AuthPaths {
  home: string;
  login: string;
  register: string;
  profile: string;
  settings: string;
  logout: string;
}

export const authPaths: AuthPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  settings: '/auth/settings',
  logout: '/auth/logout',
};

export interface AuthConfig {
  paths: AuthPaths;
  sessionCookieName: string;
  sessionMaxAge: number;
  protectedRoutes: string[];
  publicRoutes: string[];
}

export const authConfig: AuthConfig = {
  paths: authPaths,
  sessionCookieName: 'auth-session',
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 días en segundos
  protectedRoutes: [
    '/dashboard',
    '/auth/profile',
    '/auth/settings',
    '/api/protected',
  ],
  publicRoutes: [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth',
  ],
};

export function isProtectedRoute(path: string): boolean {
  return authConfig.protectedRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

export function isPublicRoute(path: string): boolean {
  return authConfig.publicRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

export function getAuthRedirectPath(
  currentPath: string,
  defaultRedirect: string = authPaths.home
): string {
  if (isProtectedRoute(currentPath)) {
    return `${authPaths.login}?redirect=${encodeURIComponent(currentPath)}`;
  }
  return defaultRedirect;
}

export function validateAuthPaths(paths: Partial<AuthStatusPaths>): AuthStatusPaths {
  return {
    login: paths.login || authPaths.login,
    register: paths.register || authPaths.register,
    home: paths.home || authPaths.home,
    profile: paths.profile || authPaths.profile,
    settings: paths.settings || authPaths.settings,
  };
}

export default authConfig;
