"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChatWindow } from './ChatWindow';
import { AuthForm } from './AuthForm';
import { PocketBaseProvider } from './PocketBaseContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ProfileSettings } from './ProfileSettings';
import { MessageSquare, Settings, X } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { useChatSize } from './ChatSizeContext';

interface FloatingChatConfig {
  pocketbaseUrl: string;
  theme?: 'light' | 'dark';
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

interface FloatingChatProps {
  config: FloatingChatConfig;
  isOpen?: boolean;
  onClose?: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

interface FloatingChatContentProps extends FloatingChatProps {
}

function FloatingChatContent({ config, isOpen = true, onClose, isAuthenticated, setIsAuthenticated }: FloatingChatContentProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<'chat' | 'profile'>('chat');
  const { height: containerHeight } = useChatSize();

  if (!isOpen) {
    return null;
  }

  const handleBackToChat = () => {
    setView('chat');
  };

  // Calculate chat window height based on container size
  const chatWindowStyle = containerHeight 
    ? { height: `${containerHeight - 100}px` } // Subtract header height
    : { height: '625px' };

  return (
    <div className={cn(
      "h-full w-full flex flex-col bg-background text-foreground"
    )}>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-primary dark:bg-[#14532d] text-primary-foreground rounded-t-lg select-none cursor-grab"
        )}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">{t.chat.title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <LanguageSelector />
          <ThemeToggle />
          {view === 'chat' ? (
            <button
              onClick={() => setView('profile')}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
              aria-label="Profile settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleBackToChat}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
              aria-label="Back to chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'profile' ? (
          <ProfileSettings onClose={handleBackToChat} />
        ) : isAuthenticated ? (
          <ChatWindow onLogout={() => setIsAuthenticated(false)} style={chatWindowStyle} />
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />
          </div>
        )}
      </div>
    </div>
  );
}

export function FloatingChat({ config, isOpen, onClose, isAuthenticated, setIsAuthenticated }: FloatingChatProps) {
  return (
    <PocketBaseProvider url={config.pocketbaseUrl}>
      <LanguageProvider>
        <FloatingChatContent config={config} isOpen={isOpen} onClose={onClose} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      </LanguageProvider>
    </PocketBaseProvider>
  );
}