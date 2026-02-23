"use client";

import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import { useLanguage } from './LanguageContext';
import { format } from 'date-fns';
import { Play, Image } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video';
  user: string;
  username: string;
  created: string;
  file?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  pb: any;
  onImageLoad?: () => void;
  onDeleteMessage: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, pb, onImageLoad, onDeleteMessage }: MessageListProps) {
  const { t } = useLanguage();
  const [longPressMessageId, setLongPressMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const startLongPressTimer = (messageId: string, clientX: number, clientY: number) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMessageId(messageId);
      setContextMenuPosition({ x: clientX, y: clientY });
    }, 500); // 500ms for long press
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePressStart = (messageId: string, e: React.MouseEvent | React.TouchEvent) => {
    clearLongPressTimer();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startLongPressTimer(messageId, clientX, clientY);
  };

  const handlePressEnd = () => {
    clearLongPressTimer();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default context menu
    if (longPressMessageId) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDeleteClick = () => {
    if (longPressMessageId) {
      onDeleteMessage(longPressMessageId);
      setLongPressMessageId(null);
      setContextMenuPosition(null);
    }
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'text':
        return <p className="text-sm">{message.content}</p>;

      case 'image':
        return (
          <div className="space-y-2">
            {message.file && (
              <div className="relative">
                <img
                  src={`${pb.baseUrl}/api/files/messages/${message.id}/${message.file}`}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '200px' }}
                  onLoad={onImageLoad}
                />
              </div>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-2">
            {message.file && (
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-3">
                <div className="flex-shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.chat.audioMessage}</p>
                  <audio controls className="w-full mt-1">
                    <source src={`${pb.baseUrl}/api/files/messages/${message.id}/${message.file}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            {message.file && (
              <div className="relative">
                <video controls className="max-w-full h-auto rounded-lg" style={{ maxHeight: '200px' }}>
                  <source src={`${pb.baseUrl}/api/files/messages/${message.id}/${message.file}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">{t.chat.noMessages}</p>
          <p className="text-sm">{t.chat.noMessagesDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.user === currentUserId;

        return (
          <div
            key={message.id}
            className={cn(
              "flex",
              isOwnMessage ? "justify-end" : "justify-start",
              longPressMessageId === message.id && "bg-blue-200"
            )}
            onMouseDown={(e) => handlePressStart(message.id, e)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd} // Clear on mouse leave
            onTouchStart={(e) => handlePressStart(message.id, e)}
            onTouchEnd={handlePressEnd}
            onContextMenu={handleContextMenu}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-lg",
                isOwnMessage
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {!isOwnMessage && (
                <p className={cn(
                  "text-xs font-medium mb-1",
                  isOwnMessage ? "text-primary-foreground/80" : "text-primary"
                )}>
                  {message.username}
                </p>
              )}

              {renderMessageContent(message)}

              <p className={cn(
                "text-xs mt-2",
                isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {format(new Date(message.created), 'HH:mm')}
              </p>
            </div>
          </div>
        );
      })}

      {longPressMessageId && contextMenuPosition && (
        <div
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid gray',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks from closing menu immediately
        >
          <button
            onClick={handleDeleteClick}
            style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
