"use client";

import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { useLanguage } from './LanguageContext';
import { usePocketBase } from './PocketBaseContext';
import { User, Circle } from 'lucide-react';

export function ConnectedUsers() {
  const { t } = useLanguage();
  const { connectedUsers } = usePocketBase();

  return (
    <div className="w-64 border-l border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">{t.chat.online}</h3>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {connectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="relative">
                <User className="w-5 h-5 text-gray-500" />
                <Circle
                  className={`absolute -top-1 -right-1 w-3 h-3 ${user.online ? 'text-green-500' : 'text-gray-400'}`}
                  fill={user.online ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </div>
              <span className="ml-2 text-sm text-gray-900">{user.username}</span>
              {!user.online && user.lastSeen && (
                <span className="text-xs text-gray-500 ml-auto">
                  {new Date(user.lastSeen).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
