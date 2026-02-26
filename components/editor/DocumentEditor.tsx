'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type DocumentEditorProps = {
  documentUrl: string;
  onClose: () => void;
  isTextDocument?: boolean;
  initialContent?: string;
  onSaveContent?: (content: string) => void;
  isSaving?: boolean;
  isContentLoading?: boolean;
  fileName?: string;
};

export default function DocumentEditor({
  documentUrl,
  onClose,
  isTextDocument,
  initialContent = '',
  onSaveContent,
  isSaving,
  isContentLoading,
  fileName
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setCopied(false);
  }, [initialContent]);

  if (isTextDocument) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{fileName || 'Documento de texto'}</h3>
          <p className="text-sm text-gray-500">Edita el contenido directamente y guarda los cambios.</p>
        </div>
        {isContentLoading ? (
          <div className="py-16 text-center text-gray-400">Cargando contenido...</div>
        ) : (
          <textarea
            className="w-full h-96 bg-gray-900 text-white border border-gray-700 rounded-lg p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setCopied(false);
            }}
          />
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(content);
                setCopied(true);
              } catch (error) {
                console.error('No se pudo copiar el contenido', error);
              }
            }}
            disabled={isContentLoading}
          >
            {copied ? 'Copiado' : 'Copiar todo'}
          </Button>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSaveContent && onSaveContent(content)}
              disabled={!onSaveContent || isSaving || isContentLoading}
            >
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Vista previa del documento. Para ediciones avanzadas, descargue el archivo.
        </p>
        <iframe
          src={documentUrl}
          className="w-full h-96 border rounded"
          title="Document preview"
        />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
