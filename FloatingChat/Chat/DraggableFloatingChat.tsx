"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Move } from 'lucide-react';
import { ChatSizeProvider } from './ChatSizeContext';

interface DraggableFloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DraggableFloatingChat({ isOpen, onClose, children }: DraggableFloatingChatProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Default position instead of centering
  const [size, setSize] = useState({ width: 400, height: 600 }); // Default size
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatRef.current) {
      const isMobile = window.innerWidth < 768; // md breakpoint

      if (isMobile) {
        setPosition({ x: 0, y: 0 });
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }
      // Removed the centering logic to prevent repositioning when resizing
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (isMobile || e.button !== 0) return;

    const target = e.target as HTMLElement;
    
    // Check if we're resizing from edges
    if (target.classList.contains('resize-edge')) {
      const direction = target.getAttribute('data-direction');
      if (direction) {
        setIsResizing(true);
        setResizeDirection(direction);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: size.width,
          height: size.height
        });
        e.preventDefault();
        return;
      }
    }
    
    // Check if we're dragging
    if (target.closest('.cursor-grab')) {
      if (chatRef.current) {
        const rect = chatRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setIsDragging(true);
        e.preventDefault();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't allow dragging on mobile
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (isMobile) return;

    const target = e.target as HTMLElement;

    // Check if we're resizing from edges
    if (target.classList.contains('resize-edge')) {
      const direction = target.getAttribute('data-direction');
      if (direction) {
        const touch = e.touches[0];
        setIsResizing(true);
        setResizeDirection(direction);
        setResizeStart({
          x: touch.clientX,
          y: touch.clientY,
          width: size.width,
          height: size.height
        });
        e.preventDefault();
        return;
      }
    }
    
    // Check if we're dragging
    if (target.closest('.cursor-grab')) {
      if (chatRef.current) {
        const touch = e.touches[0];
        const rect = chatRef.current.getBoundingClientRect();
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        });
        setIsDragging(true);
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 0);

        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));

        setPosition({
          x: clampedX,
          y: clampedY
        });
      } else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const minWidth = 300;
        const minHeight = 400;
        const maxWidth = window.innerWidth - 50;
        const maxHeight = window.innerHeight - 50;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = position.x;
        let newY = position.y;
        
        // Handle different resize directions
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minWidth, Math.min(resizeStart.width + deltaX, maxWidth));
        }
        if (resizeDirection.includes('w')) {
          const delta = Math.min(deltaX, resizeStart.width - minWidth);
          newWidth = resizeStart.width - delta;
          newX = position.x + delta;
          if (newWidth < minWidth) {
            newX = position.x + (resizeStart.width - minWidth);
            newWidth = minWidth;
          }
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minHeight, Math.min(resizeStart.height + deltaY, maxHeight));
        }
        if (resizeDirection.includes('n')) {
          const delta = Math.min(deltaY, resizeStart.height - minHeight);
          newHeight = resizeStart.height - delta;
          newY = position.y + delta;
          if (newHeight < minHeight) {
            newY = position.y + (resizeStart.height - minHeight);
            newHeight = minHeight;
          }
        }
        
        // Apply new size and position
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeDirection, resizeStart, position, size]);

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className="fixed z-50 bg-white dark:bg-gray-800 md:rounded-lg shadow-2xl md:border border-gray-200 dark:border-gray-700 flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Invisible resize edges */}
      <div 
        className="resize-edge absolute w-2 h-full bg-transparent cursor-w-resize left-0 top-0"
        data-direction="w"
      />
      <div 
        className="resize-edge absolute w-2 h-full bg-transparent cursor-e-resize right-0 top-0"
        data-direction="e"
      />
      <div 
        className="resize-edge absolute h-2 w-full bg-transparent cursor-n-resize top-0 left-0"
        data-direction="n"
      />
      <div 
        className="resize-edge absolute h-2 w-full bg-transparent cursor-s-resize bottom-0 left-0"
        data-direction="s"
      />
      <div 
        className="resize-edge absolute w-3 h-3 bg-transparent cursor-nw-resize top-0 left-0"
        data-direction="nw"
      />
      <div 
        className="resize-edge absolute w-3 h-3 bg-transparent cursor-ne-resize top-0 right-0"
        data-direction="ne"
      />
      <div 
        className="resize-edge absolute w-3 h-3 bg-transparent cursor-sw-resize bottom-0 left-0"
        data-direction="sw"
      />
      <div 
        className="resize-edge absolute w-3 h-3 bg-transparent cursor-se-resize bottom-0 right-0"
        data-direction="se"
      />
      
      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatSizeProvider width={size.width} height={size.height}>
          {children}
        </ChatSizeProvider>
      </div>
    </div>
  );
}