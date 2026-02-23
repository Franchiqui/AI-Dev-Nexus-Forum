"use client";

import { createContext, useContext } from 'react';

interface ChatSizeContextType {
  width: number;
  height: number;
}

const ChatSizeContext = createContext<ChatSizeContextType | undefined>(undefined);

export function ChatSizeProvider({ 
  children, 
  width, 
  height 
}: { 
  children: React.ReactNode; 
  width: number; 
  height: number;
}) {
  return (
    <ChatSizeContext.Provider value={{ width, height }}>
      {children}
    </ChatSizeContext.Provider>
  );
}

export function useChatSize() {
  const context = useContext(ChatSizeContext);
  if (context === undefined) {
    throw new Error('useChatSize must be used within a ChatSizeProvider');
  }
  return context;
}