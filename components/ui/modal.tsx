'use client';

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'default' | 'danger' | 'success' | 'info';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[90vh]',
};

const variantIcons: Record<ModalVariant, React.ReactNode> = {
  default: null,
  danger: <AlertCircle className="h-6 w-6 text-red-500" />,
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
};

const variantBorderColors: Record<ModalVariant, string> = {
  default: 'border-gray-200 dark:border-gray-700',
  danger: 'border-red-200 dark:border-red-700',
  success: 'border-green-200 dark:border-green-700',
  info: 'border-blue-200 dark:border-blue-700',
};

const Modal = React.memo(function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  initialFocusRef,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footer,
  isLoading = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      if (initialFocusRef?.current) {
        setTimeout(() => initialFocusRef.current?.focus(), 100);
      } else if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 100);
        }
      }
    } else {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      if (lastFocusedElementRef.current) {
        setTimeout(() => lastFocusedElementRef.current?.focus(), 100);
      }
    }

    return () => {
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventScroll, initialFocusRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape' && isOpen) {
      onClose();
    }
    
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [closeOnEscape, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
              overlayClassName
            )}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'relative w-full rounded-lg bg-white dark:bg-gray-900 shadow-xl',
                sizeClasses[size],
                variantBorderColors[variant],
                'border',
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
            >
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              {(title || showCloseButton) && (
                <div className={cn(
                  'flex items-center justify-between border-b px-6 py-4',
                  variantBorderColors[variant],
                  headerClassName
                )}>
                  <div className="flex items-center gap-3">
                    {variantIcons[variant]}
                    {title && (
                      <h3
                        id="modal-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                      >
                        {title}
                      </h3>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                      aria-label="Close modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              <div className={cn(
                size === 'full' ? 'overflow-auto' : '',
                contentClassName
              )}>
                {(description && !title) && (
                  <div className="border-b px-6 py-4">
                    <p
                      id="modal-description"
                      className="text-sm text-gray-600 dark:text-gray-300"
                    >
                      {description}
                    </p>
                  </div>
                )}

                <div className={cn('px-6 py-4', bodyClassName)}>
                  {description && title && (
                    <p
                      id="modal-description"
                      className="mb-4 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {description}
                    </p>
                  )}
                  {children}
                </div>

                {footer && (
                  <div className={cn(
                    'border-t px-6 py-4',
                    variantBorderColors[variant]
                  )}>
                    {footer}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
});

Modal.displayName = 'Modal';

export { Modal };