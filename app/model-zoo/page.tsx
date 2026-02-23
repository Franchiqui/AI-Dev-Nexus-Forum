'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/error-boundary';

const DynamicModelZoo = dynamic(() => import('@/components/model-zoo/model-zoo'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function ModelZooPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Model Zoo
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Explora, prueba y despliega modelos de IA pre-entrenados de la comunidad
          </p>
        </section>

        {/* Main Content */}
        <div className="mb-16">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <DynamicModelZoo />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-blue-400">150+</div>
              <div className="text-gray-400">Modelos Disponibles</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-purple-400">45K+</div>
              <div className="text-gray-400">Descargas Totales</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-green-400">89</div>
              <div className="text-gray-400">Contribuidores</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400">12</div>
              <div className="text-gray-400">Frameworks</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
