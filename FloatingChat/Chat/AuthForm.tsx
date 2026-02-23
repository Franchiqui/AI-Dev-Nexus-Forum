"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePocketBase } from './PocketBaseContext';
import { useLanguage } from './LanguageContext';
import { Mail, User, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthFormProps {
  onAuthenticated: () => void;
}

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const { t } = useLanguage();
  const { login, register } = usePocketBase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
      onAuthenticated();
    } catch (err: any) {
      setError(err?.message || t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.passwordConfirm) {
      setPasswordsMatch(false);
      setError(t.auth.passwordsDontMatch);
      return;
    }

    // Add password length validation here
    if (registerForm.password.length < 8) { // PocketBase default min password length is 8
      setError(t.auth.passwordsDontMatch);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setPasswordsMatch(true);

    try {
      await register(registerForm.email, registerForm.password);
      onAuthenticated();
    } catch (err: any) {
      setError(err?.message || t.auth.registrationFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-green-400 mb-2">{t.auth.welcome}</h2>
        <p className="text-gray-600">{t.auth.signInDescription}</p>
      </div>

      <Tabs defaultValue="login" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="flex items-center space-x-2">
            <LogIn className="w-4 h-4" />
            <span>{t.auth.login}</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>{t.auth.register}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{t.auth.email}</span>
              </Label>
              <Input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e: { target: { value: any; }; }) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder={t.auth.enterEmail}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>{t.auth.password}</span>
              </Label>
              <Input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(e: { target: { value: any; }; }) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder={t.auth.enterPassword}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 dark:bg-[#14532d] dark:hover:bg-[#1a5f37] dark:text-white"
              disabled={isLoading}
            >
              {isLoading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{t.auth.email}</span>
              </Label>
              <Input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(e: { target: { value: any; }; }) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder={t.auth.enterEmail}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>{t.auth.password}</span>
              </Label>
              <Input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(e: { target: { value: any; }; }) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                placeholder={t.auth.enterPassword}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                {t.auth.confirmPassword}
              </Label>
              <Input
                id="register-confirm-password"
                type="password"
                value={registerForm.passwordConfirm}
                onChange={(e: { target: { value: any; }; }) =>
                  setRegisterForm({ ...registerForm, passwordConfirm: e.target.value })
                }
                placeholder={t.auth.confirmPassword}
                className={!passwordsMatch ? 'border-red-500' : ''}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2 bg-primary hover:bg-primary/90 dark:bg-[#14532d] dark:hover:bg-[#1a5f37] dark:text-white"
              disabled={isLoading}
            >
              {isLoading ? t.auth.creatingAccount : t.auth.createAccount}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {t.auth.termsText}
        </p>
      </div>
    </div>
  );
}