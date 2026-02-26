import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Download, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TextEditorProps = {
  initialContent?: string;
  filename?: string;
  onSave?: (content: string) => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_FONT = 'JetBrains Mono, Menlo, Consolas, monospace';
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_COLOR = '#000000';

export default function TextEditor({
  initialContent = '',
  filename = 'untitled.txt',
  onSave,
  onClose,
  className,
  style,
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [plainText, setPlainText] = useState(initialContent);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [textColor, setTextColor] = useState(DEFAULT_COLOR);
  const { toast } = useToast();

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      editorRef.current.style.color = DEFAULT_COLOR;
    }
    setHtmlContent(initialContent);
    setPlainText(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
  }, [initialContent]);

  const captureSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    if (!editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    selectionRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    if (!selectionRef.current) return null;
    const selection = window.getSelection();
    if (!selection) return null;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
    return selection.getRangeAt(0);
  };

  const applyInlineStyle = (styles: Partial<CSSStyleDeclaration>) => {
    const range = restoreSelection();
    if (!range || range.collapsed) return;

    const span = document.createElement('span');
    Object.assign(span.style, styles);

    const extracted = range.extractContents();
    span.appendChild(extracted);
    range.insertNode(span);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
      selectionRef.current = newRange.cloneRange();
    }

    syncFromDom(true);
  };

  const pushHistory = (snapshot: string) => {
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      const next = [...truncated, snapshot];
      setHistoryIndex(next.length - 1);
      return next;
    });
  };

  const syncFromDom = (push = true) => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    setHtmlContent(html);
    setPlainText(text);
    if (push) pushHistory(html);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(plainText);
    }
    toast({
      title: 'Archivo guardado',
      description: `Se guardó ${filename}`,
    });
  };

  const triggerDownload = (name: string) => {
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name || filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Descarga iniciada',
      description: `Descargando ${name || filename}`,
    });
  };

  const handleDownload = () => {
    triggerDownload(filename);
  };

  const handleSaveAs = () => {
    const newName = window.prompt('Guardar como', filename);
    if (!newName) return;
    triggerDownload(newName.trim());
  };

  const handleUndo = () => {
    if (!editorRef.current || historyIndex === 0) return;
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];
    editorRef.current.innerHTML = snapshot;
    setHistoryIndex(newIndex);
    setHtmlContent(snapshot);
    setPlainText(editorRef.current.innerText || '');
  };

  const handleRedo = () => {
    if (!editorRef.current || historyIndex === history.length - 1) return;
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];
    editorRef.current.innerHTML = snapshot;
    setHistoryIndex(newIndex);
    setHtmlContent(snapshot);
    setPlainText(editorRef.current.innerText || '');
  };

  const handleFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    syncFromDom(true);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFontFamily(value);
    applyInlineStyle({ fontFamily: value });
    syncFromDom(true);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFontSize(value);
    applyInlineStyle({ fontSize: `${value}px` });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextColor(value);
    applyInlineStyle({ color: value });
    syncFromDom(true);
  };

  const handleEditorInput = () => {
    syncFromDom(true);
    captureSelection();
  };

  return (
    <div className={cn('flex flex-col h-full min-h-0 overflow-hidden', className)} style={style}>
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Editor de Texto</h2>
          <p className="text-sm text-muted-foreground">{filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-black"
            onClick={handleUndo}
            disabled={historyIndex === 0}
          >
            <Undo className="h-4 w-4 mr-1" />
            Deshacer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-black"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo className="h-4 w-4 mr-1" />
            Rehacer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-black"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveAs}
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar como
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 px-4 py-3 border-b bg-muted/40">
        <div className="flex flex-col text-sm">
          <Label className="text-xs text-muted-foreground">Fuente</Label>
          <select
            className="mt-1 rounded-md border border-border bg-background px-3 py-1 text-sm text-black"
            value={fontFamily}
            onChange={handleFontFamilyChange}
          >
            <option value={DEFAULT_FONT}>Monoespaciada</option>
            <option value="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">Inter</option>
            <option value="'IBM Plex Serif', Georgia, serif">Serif</option>
            <option value="'Fira Code', Consolas, monospace">Fira Code</option>
          </select>
        </div>

        <div className="flex flex-col text-sm">
          <Label className="text-xs text-muted-foreground">Tamaño</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              min={8}
              max={72}
              step={1}
              value={fontSize}
              onChange={handleFontSizeChange}
              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-black"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>

        <div className="flex flex-col text-sm">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <input
            type="color"
            value={textColor}
            onChange={handleColorChange}
            className="w-12 h-8 p-0 border border-border rounded mt-1"
          />
        </div>
      </div>
      
      <div className="flex-1 p-4 min-h-0 overflow-hidden">
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
          <Label htmlFor="text-editor" className="mb-2">
            Contenido del archivo
          </Label>
          <div
            id="text-editor"
            ref={editorRef}
            contentEditable="true"
            suppressContentEditableWarning={true}
            onInput={handleEditorInput}
            onMouseUp={captureSelection}
            onKeyUp={captureSelection}
            style={{ whiteSpace: 'pre-wrap', color: DEFAULT_COLOR, fontFamily: DEFAULT_FONT, fontSize: DEFAULT_FONT_SIZE }}
            className="flex-1 min-h-0 h-full overflow-auto rounded-md border border-border bg-white px-3 py-2 text-sm leading-relaxed text-black"
          />
        </div>
      </div>
      
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Caracteres: </span>
            <span className="font-medium">{plainText.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Líneas: </span>
            <span className="font-medium">{plainText.split('\n').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
