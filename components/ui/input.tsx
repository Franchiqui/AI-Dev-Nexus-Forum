'use client';

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const inputVariants = cva(
  'flex w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        search: 'rounded-full pl-10 pr-4 bg-gray-800 border-gray-600 focus:border-blue-400',
        chat: 'rounded-full border-blue-500/30 bg-gray-800/50 backdrop-blur-sm',
        code: 'font-mono border-purple-500/30 bg-gray-900 focus:border-purple-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
        xl: 'h-14 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  animated?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      loading = false,
      animated = false,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = React.useId();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const animationVariants = {
      focused: {
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        scale: 1.01,
      },
      unfocused: {
        boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
        scale: 1,
      },
    };

    const InputElement = (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            inputVariants({ variant, size }),
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus-visible:ring-red-500',
            animated && 'transition-shadow duration-300',
            className
          )}
          ref={ref}
          disabled={disabled || loading}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {(rightIcon || loading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-blue-500"
              />
            ) : (
              rightIcon
            )}
          </div>
        )}
        {animated && isFocused && variant === 'chat' && (
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-400/50"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 1.05, 1.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    );

    const Wrapper = animated ? motion.div : React.Fragment;
    const wrapperProps = animated
      ? {
          animate: isFocused ? 'focused' : 'unfocused',
          variants: animationVariants,
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        }
      : {};

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        {animated ? (
          <Wrapper {...wrapperProps} className="block">
            {InputElement}
          </Wrapper>
        ) : (
          <Wrapper>
            {InputElement}
          </Wrapper>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };