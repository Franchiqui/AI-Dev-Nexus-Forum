'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnlineUsersState {
  count: number;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
    lastSeen: Date;
  }>;
  lastUpdated: Date | null;
  setOnlineUsers: (count: number) => void;
  updateOnlineUsers: (users: Array<{ id: string; name: string; avatar?: string }>) => void;
  addOnlineUser: (user: { id: string; name: string; avatar?: string }) => void;
  removeOnlineUser: (userId: string) => void;
  clearOnlineUsers: () => void;
  incrementOnlineUsers: () => void;
  decrementOnlineUsers: () => void;
}

const useOnlineUsersStore = create<OnlineUsersState>()(
  persist(
    (set, get) => ({
      count: 0,
      users: [],
      lastUpdated: null,

      setOnlineUsers: (count: number) =>
        set({
          count,
          lastUpdated: new Date(),
        }),

      updateOnlineUsers: (users) =>
        set({
          count: users.length,
          users: users.map((user) => ({
            ...user,
            lastSeen: new Date(),
          })),
          lastUpdated: new Date(),
        }),

      addOnlineUser: (user) => {
        const currentUsers = get().users;
        const userExists = currentUsers.some((u) => u.id === user.id);

        if (!userExists) {
          set({
            count: get().count + 1,
            users: [
              ...currentUsers,
              {
                ...user,
                lastSeen: new Date(),
              },
            ],
            lastUpdated: new Date(),
          });
        }
      },

      removeOnlineUser: (userId) => {
        const currentUsers = get().users;
        const userExists = currentUsers.some((u) => u.id === userId);

        if (userExists) {
          set({
            count: Math.max(0, get().count - 1),
            users: currentUsers.filter((user) => user.id !== userId),
            lastUpdated: new Date(),
          });
        }
      },

      clearOnlineUsers: () =>
        set({
          count: 0,
          users: [],
          lastUpdated: new Date(),
        }),

      incrementOnlineUsers: () =>
        set((state) => ({
          count: state.count + 1,
          lastUpdated: new Date(),
        })),

      decrementOnlineUsers: () =>
        set((state) => ({
          count: Math.max(0, state.count - 1),
          lastUpdated: new Date(),
        })),
    }),
    {
      name: 'online-users-storage',
      partialize: (state) => ({
        count: state.count,
        users: state.users,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useOnlineUsersStore;
