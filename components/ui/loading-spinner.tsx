'use client';

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-blue-400 border-t-transparent",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingSpinnerWithOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function LoadingSpinnerInline() {
  return (
    <div className="inline-flex items-center justify-center">
      <LoadingSpinner size="sm" />
    </div>
  );
}

export function LoadingSpinnerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="text-center space-y-6">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI-Dev Nexus Forum
          </h2>
          <p className="text-gray-400">Cargando experiencia colaborativa...</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinnerGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 animate-pulse"
        >
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-800/50 rounded"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
