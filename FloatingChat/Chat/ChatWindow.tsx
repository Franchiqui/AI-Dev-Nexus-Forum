"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { usePocketBase } from './PocketBaseContext';
import { useLanguage } from './LanguageContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LogOut, Users, X, User, Circle } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import '../chat.css';

interface ChatWindowProps {
  onLogout: () => void;
  style?: React.CSSProperties;
}

interface Message {
  target_user: string;
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video';
  user: string;
  username: string;
  created: string;
  file?: string;
  recipient?: string;
  isPrivate?: boolean;
}

type ViewType = 'chat' | 'users' | 'userProfile';

interface User {
  id: string;
  username: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  [key: string]: any; // For any additional properties that might be present
}

// Memoize the user list component to prevent unnecessary re-renders
const UserList = React.memo(({
  connectedUsers,
  handleUserSelect,
  handleUserViewProfile,
  t,
  pb
}: {
  connectedUsers: any[];
  handleUserSelect: (id: string) => void;
  handleUserViewProfile: (user: User) => void;
  t: any;
  pb: any;
}) => (
  <div className="flex-1 user-list-bg p-4">
    {connectedUsers.length > 0 ? (
      <div className="space-y-2">
        {connectedUsers.map((connectedUser) => (
          <div
            key={connectedUser.id}
            className="flex items-center justify-between p-3 rounded-lg user-list-hover transition-colors cursor-pointer user-card-bg"
            onClick={() => handleUserSelect(connectedUser.id as string)}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full avatar-bg flex items-center justify-center overflow-hidden">
                  {connectedUser.avatar ? (
                    <img
                      src={`${pb.baseUrl}/api/files/users/${connectedUser.id}/${connectedUser.avatar}`}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Error loading avatar in user list:', connectedUser.avatar);
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <Circle
                  className={`absolute -bottom-1 -right-1 w-3 h-3 ${connectedUser.online ? 'status-circle-online' : 'status-circle-offline'}`}
                  fill={connectedUser.online ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">{connectedUser.username}</p>
                <p className="text-xs text-muted-foreground">
                  {connectedUser.online ? t.chat.online : `Visto ${connectedUser.lastSeen ? new Date(connectedUser.lastSeen).toLocaleTimeString() : 'recientemente'}`}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUserViewProfile(connectedUser);
              }}
              className="p-2 rounded-full btn-hover-bg transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 user-card-bg rounded-lg">
        <Users className="w-12 h-12 text-muted mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-2">{t.chat.noMessages}</h3>
        <p className="text-muted">{t.chat.noMessagesDescription}</p>
      </div>
    )}
  </div>
));

export function ChatWindow({ onLogout, style }: ChatWindowProps) {
  const { t } = useLanguage();
  const { pb, user, logout, connectedUsers, isLoading: pbIsLoading } = usePocketBase();

  if (pbIsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If not loading but no user, ChatWindow should not render its content.
    // The parent component should handle showing AuthForm.
    return null;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('users');
  const [recipient, setRecipient] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messageListContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    if (messageListContainerRef.current) {
      observer.observe(messageListContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Style for the chat window
  const chatWindowStyle = style ? { ...style } : {};
  const loadMessages = useCallback(async () => {
    try {
      const attempt = async () => {
        return pb.collection('messages').getList(1, 50, {
          sort: '-created',
          expand: 'user,target_user',
          requestKey: null, // disable PocketBase auto-cancel for this call
        });
      };

      let records;
      try {
        records = await attempt();
      } catch (err: any) {
        // Retry once if it looks like an auto-cancel/abort race.
        const isAbort = err?.name === 'AbortError' || (err?.name === 'ClientResponseError' && err?.originalError?.name === 'AbortError');
        if (!isAbort) throw err;
        console.warn('Retrying message load after abort/auto-cancel');
        records = await attempt();
      }

      const formattedMessages = records.items.reverse().map(record => ({
        id: record.id,
        content: record.content,
        type: record.type,
        user: record.user,
        username: record.expand?.user?.username || 'Unknown',
        created: record.created,
        file: record.file,
        target_user: record.target_user,
        target_username: record.expand?.target_user?.username || null
      }));

      setMessages(formattedMessages);
      setIsLoading(false);
    } catch (error: any) {
      // Aborts should already be rare; log non-abort errors only.
      const isAbort = error.name === 'AbortError' || (error.name === 'ClientResponseError' && error.originalError?.name === 'AbortError');
      if (isAbort) {
        console.log('Message loading aborted:', error.message);
      } else {
        console.error('Error loading messages:', error);
      }
      setIsLoading(false);
    }
  }, [pb]);

  // Función para suscribirse a mensajes
  const subscribeToMessages = useCallback(async () => {
    try {
      pb.collection('messages').subscribe('*', (e) => {
        if (e.record) {
          const userRecord = connectedUsers.find(u => u.id === e.record.user);
          const newMessage = {
            id: e.record.id,
            content: e.record.content,
            type: e.record.type,
            user: e.record.user,
            username: userRecord?.username || 'Unknown',
            created: e.record.created,
            file: e.record.file,
            target_user: e.record.target_user,
            target_username: connectedUsers.find(u => u.id === e.record.target_user)?.username || null
          };

          setMessages(prev => [...prev, newMessage]);
        }
      });
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  }, [pb, connectedUsers]);

  // Efecto para cargar mensajes y suscribirse a actualizaciones
  useEffect(() => {
    loadMessages();
    subscribeToMessages();

    return () => {
      pb.collection('messages').unsubscribe('*');
    };
  }, [loadMessages, subscribeToMessages, pb]);

  const sendMessage: (content: string, type?: 'text' | 'image' | 'audio' | 'video', file?: File) => Promise<void> = async (content, type = 'text', file) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      formData.append('user', user?.id || '');

      const data: { [key: string]: any } = {
        content: content,
        type: type,
        user: user?.id || '',
      };

      if (recipient) {
        data.target_user = recipient; // Send as single ID for relation field
      }

      if (file) {
        // If there's a file, we still need to use FormData
        formData.append('content', content);
        formData.append('type', type);
        formData.append('user', user?.id || '');
        if (recipient) {
          formData.append('target_user', recipient);
        }
        formData.append('file', file);
        await pb.collection('messages').create(formData);
      } else {
        await pb.collection('messages').create(data);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  // Handler functions
  const handleUserSelect = (userId: string) => {
    setRecipient(userId);
    setCurrentView('chat');
  };


  const handleBackToUsers = () => {
    console.log("Calling handleBackToUsers. setSelectedUser type:", typeof setSelectedUser);
    setSelectedUser(null);
    setRecipient(null); // Reset recipient when going back to users
    setCurrentView('users');
  };

  const renderUserProfile = () => {
    if (!selectedUser) {
      // Reset states properly when no user is selected
      setRecipient(null);
      setCurrentView('users');
      return null;
    }

    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b border-custom bg-muted/30 dark:bg-gray-800 dark:border-gray-700 flex items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleBackToUsers();
            }}
            className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            aria-label={t.common.back}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h3 className="font-semibold text-foreground dark:text-white">
            {selectedUser.username}
          </h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full avatar-bg flex items-center justify-center mb-2 overflow-hidden">
              {selectedUser.avatar ? (
                <img
                  src={`${pb.baseUrl}/api/files/users/${selectedUser.id}/${selectedUser.avatar}`}
                  alt={selectedUser.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Error loading avatar in profile view:', selectedUser.avatar);
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-2xl">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h4 className="font-medium text-lg">{selectedUser.name || selectedUser.username}</h4>
          </div>
          <div className="space-y-2">
            {selectedUser.email && <p className="text-sm"><span className="font-medium">Email:</span> {selectedUser.email}</p>}
            {selectedUser.phone && <p className="text-sm"><span className="font-medium">Phone:</span> {selectedUser.phone}</p>}
            {selectedUser.address && <p className="text-sm"><span className="font-medium">Address:</span> {selectedUser.address}</p>}
          </div>
          {selectedUser.lastSeen && (
            <p className="text-sm text-muted text-center mt-4">
              {t.chat.lastSeen}: {new Date(selectedUser.lastSeen).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render chat view
  const renderChat = () => {
    if (!recipient) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 user-card-bg rounded-lg">
          <Users className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">{t.chat.selectUserToChat}</h3>
          <p className="text-muted">{t.chat.selectUserToChatDescription}</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full">
        <ScrollArea className="flex-1 p-4 chat-messages-background min-h-[300px]">
          <div ref={messageListContainerRef}>
            <MessageList
              messages={messages.filter(m => (m.user === user?.id && m.target_user === recipient) ||
                (m.user === recipient && m.target_user === user?.id)
              )}
              currentUserId={user?.id}
              pb={pb}
              onImageLoad={scrollToBottom} onDeleteMessage={function (messageId: string): void {
                throw new Error('Function not implemented.');
              } }            />
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t border-custom bg-background p-4 flex-shrink-0">
          <MessageInput onSendMessage={sendMessage} disabled={!recipient} />
        </div>
      </div>
    );
  };

  // Render user list view
  const renderUserList = () => (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-custom bg-muted/30 dark:bg-[#14532d] dark:border-[#1a5f37] text-black dark:text-white">
        <h3 className="font-semibold text-foreground dark:text-white">
          {t.chat.welcome}, {user?.username}
        </h3>
      </div>
      <UserList
        connectedUsers={connectedUsers}
        handleUserSelect={(userId) => {
          setRecipient(userId);
          setCurrentView('chat');
        }}
        handleUserViewProfile={(user) => {
          setSelectedUser(user);
          setCurrentView('userProfile');
        }}
        t={t}
        pb={pb}
      />
    </div>
  );

  // Render the appropriate view based on currentView state
  const renderView = () => {
    switch (currentView) {
      case 'userProfile':
        return renderUserProfile();
      case 'users':
        return renderUserList();
      case 'chat':
      default:
        return renderChat();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0c4a1e] text-foreground" style={chatWindowStyle}>
      <div className="flex items-center border-b border-custom bg-white dark:bg-[#14532d] text-black dark:text-white cursor-grab">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            (currentView === 'chat' || currentView === 'userProfile')
              ? 'border-b-2 border-white text-black dark:text-white'
              : 'text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white'
          }`}
          onClick={() => { setCurrentView('chat'); }}
        >
          {t.chat.title}
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${currentView === 'users'
            ? 'border-b-2 border-white text-black dark:text-white'
            : 'text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white'}`}
          onClick={() => { setCurrentView('users'); }}
        >
          {t.chat.online}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}
