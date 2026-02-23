"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import PocketBase, { AuthModel } from 'pocketbase';

interface UserStatus {
  avatar: any;
  id: string;
  username: string;
  online: boolean;
  lastSeen?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface PocketBaseContextType {
  pb: PocketBase;
  user: AuthModel | null;
  connectedUsers: UserStatus[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserStatus: (online: boolean) => Promise<void>;
}

const PocketBaseContext = createContext<PocketBaseContextType | null>(null);

export function PocketBaseProvider({ children, url }: { children: React.ReactNode; url: string }) {
  const [pb] = useState(() => {
    const client = new PocketBase(url);
    // Avoid SDK auto-cancelling overlapping requests so manual AbortController controls cancellation.
    client.autoCancellation(false);
    return client;
  });
  const [user, setUser] = useState<AuthModel | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userStatusInitialized = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setUser(pb.authStore.model);
    setIsLoading(false);

    pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, [pb]);

  const updateUserStatus = useCallback(async (online: boolean) => {
    const currentUser = pb.authStore.model;
    if (!currentUser) return;

    try {
      console.log(`Updating user ${currentUser.id} status to online: ${online}`);
      await pb.collection('users').update(currentUser.id, {
        online,
        lastSeen: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  }, [pb]);

  const login = async (email: string, password: string) => {
    await pb.collection('users').authWithPassword(email, password);
  };

  const register = async (email: string, password: string) => {
    // Primero creamos el usuario
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
    });

    // Luego iniciamos sesión
    await pb.collection('users').authWithPassword(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  // Efecto para manejar la conexión/desconexión
  useEffect(() => {
    if (!user) return;

    const setupUserTracking = async () => {
      // Cargar usuarios iniciales
      try {
        const users = await pb.collection('users').getFullList({
          fields: 'id,username,online,lastSeen,avatar,name,email,phone,address'
        });
        console.log('Initial users fetched:', users);
        setConnectedUsers(users.filter(u => u.id !== user.id).map(u => ({
          id: u.id,
          username: u.username,
          online: u.online || false,
          lastSeen: u.lastSeen,
          avatar: u.avatar,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address
        })));
        // Set current user's status to online
        await updateUserStatus(true);
      } catch (err) {
        console.error('Error loading users:', err);
      }

      // Suscribirse a cambios en la colección de usuarios
      try {
        // Clear any existing subscription
        if (subscriptionRef.current) {
          pb.collection('users').unsubscribe('*');
        }

        subscriptionRef.current = pb.collection('users').subscribe('*', (e) => {
          console.log('PocketBase subscription event:', e);
          if (e.record.id === user.id) return; // No actualizar el usuario actual

          setConnectedUsers(prev => {
            const exists = prev.some(u => u.id === e.record.id);
            if (exists) {
              return prev.map(u =>
                u.id === e.record.id
                  ? {
                      ...u,
                      online: e.record.online,
                      lastSeen: e.record.lastSeen,
                      name: e.record.name,
                      email: e.record.email,
                      phone: e.record.phone,
                      address: e.record.address
                    }
                  : u
              );
            }
            return [...prev, {
              id: e.record.id,
              username: e.record.username,
              online: e.record.online || false,
              lastSeen: e.record.lastSeen,
              avatar: e.record.avatar,
              name: e.record.name,
              email: e.record.email,
              phone: e.record.phone,
              address: e.record.address
            }];
          });
        }, { fields: 'id,username,online,lastSeen,avatar,name,email,phone,address' });
        console.log('PocketBase subscription initiated successfully.');
      } catch (err: any) { // Catch the error here
        console.error('Error setting up subscription:', err);
        // Check for 403 ClientResponseError
        if (err.status === 403 && err.response && err.response.code === 403) {
          console.warn('PocketBase 403 error during subscription. Attempting re-authentication on next interaction.');
        }
      }
    };

    setupUserTracking();

    // Limpieza al desmontar
    return () => {
      if (user) {
        updateUserStatus(false);
      }
      if (subscriptionRef.current) {
        try {
          pb.collection('users').unsubscribe('*');
        } catch (err: any) {
          // Ignore missing/invalid client id on teardown; happens if PB was restarted or already disconnected.
          const isClientIdError = err?.status === 404 || err?.message?.toString().includes('client id');
          if (!isClientIdError) {
            console.error('Error unsubscribing from users collection:', err);
          }
        }
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, pb, updateUserStatus]);

  const value = useMemo(() => ({
    pb,
    user,
    connectedUsers,
    login,
    register,
    logout,
    isLoading,
    updateUserStatus
  }), [user, connectedUsers, pb, isLoading, updateUserStatus]);

  return (
    <PocketBaseContext.Provider value={value}>
      {children}
    </PocketBaseContext.Provider>
  );
}

export function usePocketBase() {
  const context = useContext(PocketBaseContext);
  if (!context) {
    throw new Error('usePocketBase must be used within a PocketBaseProvider');
  }
  return context;
}