'use client';

import AssistantChat from '@/components/assistant/assistant-chat';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/error-boundary';

const DynamicDashboard = dynamic(() => import('@/components/dashboard/user-dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function AsistenteIAPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Asistente IA</h1>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 min-h-[400px]">
          <ErrorBoundary>
            <AssistantChat />
          </ErrorBoundary>
        </div>
        <div className="col-span-1 min-h-[400px]">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <DynamicDashboard />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}