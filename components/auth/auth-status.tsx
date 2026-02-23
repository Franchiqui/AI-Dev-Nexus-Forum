'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, User, LogOut, Settings, LogIn, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authPaths } from '@/lib/auth-config';

export interface AuthStatusPaths {
  login: string;
  register: string;
  home: string;
  profile: string;
  settings: string;
}

export interface AuthStatusProps {
  /** Rutas personalizadas para los enlaces de autenticación */
  paths?: Partial<AuthStatusPaths>;
}

export default function AuthStatus({ paths }: AuthStatusProps) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // Combinar rutas personalizadas con las predeterminadas
  const resolvedPaths: AuthStatusPaths = {
    login: paths?.login ?? authPaths.login,
    register: paths?.register ?? authPaths.register,
    home: paths?.home ?? authPaths.home,
    profile: paths?.profile ?? authPaths.profile,
    settings: paths?.settings ?? authPaths.settings,
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={resolvedPaths.login} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Iniciar sesión</span>
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={resolvedPaths.register} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Registrarse</span>
          </Link>
        </Button>
      </div>
    );
  }

  const user = session.user;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || ''} alt={user?.name || 'Usuario'} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={resolvedPaths.profile} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={resolvedPaths.settings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onClick={() => signOut({ callbackUrl: resolvedPaths.home })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="hidden md:flex flex-col">
        <span className="text-sm font-medium">{user?.name}</span>
        <span className="text-xs text-muted-foreground">{user?.email}</span>
      </div>
    </div>
  );
}
