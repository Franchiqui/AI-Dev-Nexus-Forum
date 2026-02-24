'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/error-boundary';

const DynamicForumSection = dynamic(() => import('@/components/forum/forum-section'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicAISandbox = dynamic(() => import('@/components/sandbox/ai-sandbox'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicTrendsPanel = dynamic(() => import('@/components/trends/trends-panel'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicModelZoo = dynamic(() => import('@/components/model-zoo/model-zoo'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicChallengesSection = dynamic(() => import('@/components/challenges/challenges-section'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicAssistantChat = dynamic(() => import('@/components/assistant/assistant-chat'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicNetworkingSection = dynamic(() => import('@/components/networking/networking-section'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const DynamicDashboard = dynamic(() => import('@/components/dashboard/user-dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 pb-24">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI-Dev Nexus Forum
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Conectando mentes, construyendo el futuro de la IA
          </p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicForumSection />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicAISandbox />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicModelZoo />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicChallengesSection />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicTrendsPanel />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicAssistantChat />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicNetworkingSection />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <DynamicDashboard />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-blue-400">2.5K+</div>
              <div className="text-gray-400">Desarrolladores</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-purple-400">150+</div>
              <div className="text-gray-400">Modelos Publicados</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-green-400">45</div>
              <div className="text-gray-400">Retos Completados</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400">12</div>
              <div className="text-gray-400">Colaboraciones Activas</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
