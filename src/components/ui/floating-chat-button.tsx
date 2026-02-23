"use client";

import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, ReactNode } from 'react';

interface FloatingChatButtonProps {
  onClick?: () => void;
  children: ReactNode;
}

export function FloatingChatButton({ onClick, children }: FloatingChatButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasWindowDimensions, setHasWindowDimensions] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      const buttonHeight = buttonRef.current.offsetHeight;
      // Position above the original FloatingButton (database button)
      const initialX = window.innerWidth - buttonWidth - 20;
      const initialY = window.innerHeight - buttonHeight - 90; // 20 (bottom margin) + 56 (button height) + 14 (some spacing)
      setPosition({ x: initialX, y: initialY });
      setHasWindowDimensions(true); // Set true when dimensions are obtained
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  useEffect(() => {
    if (buttonRef.current) {
      requestAnimationFrame(updatePosition);
    }
  }, [buttonRef.current]);

  const buttonClass = 'h-14 w-14 shadow-lg border-2 border-black dark:border-white text-foreground flex items-center justify-center p-0';


  return (
    <div
      ref={buttonRef}
      className="fixed z-50" // z-index 50 to be above other content, but below iframe overlays
      style={{ ...{ left: position.x, top: position.y }, visibility: hasWindowDimensions ? 'visible' : 'hidden' }}
    >
      <Button
        className={buttonClass}
        size="icon"
        variant="ghost"
        onClick={onClick}
        style={{ borderRadius: '50%', width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}
      >
        {children}
      </Button>
    </div>
  );
}