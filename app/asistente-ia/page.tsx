import AssistantChat from '@/components/assistant/assistant-chat';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AsistenteIAPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Asistente IA</h1>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>
      <AssistantChat />
    </div>
  );
}