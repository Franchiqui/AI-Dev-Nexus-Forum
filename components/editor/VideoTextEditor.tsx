import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Type, Palette, Clock, Move, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimelineClip } from '@/types';

interface VideoTextClip {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  startTime: number;
  duration: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
}

interface VideoTextEditorProps {
  textClips: VideoTextClip[];
  onAddTextClip: (clip: Omit<VideoTextClip, 'id'>) => void;
  onUpdateTextClip: (id: string, updates: Partial<VideoTextClip>) => void;
  onDeleteTextClip: (id: string) => void;
  currentTime: number;
  videoDuration: number;
}

const FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Palatino',
];

const DEFAULT_COLORS = [
  '#FFFFFF', // Blanco
  '#000000', // Negro
  '#FF0000', // Rojo
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarillo
  '#FF00FF', // Magenta
  '#00FFFF', // Cian
];

// ResizableTextarea component
const ResizableTextarea = ({ value, onChange, placeholder, className, textAlign = 'left' }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState(60);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${height}px`;
    }
  }, [height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(40, Math.min(200, startHeight + deltaY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full resize-none p-2 text-sm bg-gray-950 border-gray-600 text-white placeholder:text-gray-500 focus:border-emerald-500 transition-colors rounded-md ${className}`}
        style={{ 
          height: `${height}px`,
          textAlign: textAlign
        }}
      />
      <div
        className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize ${isResizing ? 'bg-emerald-500' : 'bg-gray-600'} rounded-tl-md opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center`}
        onMouseDown={handleMouseDown}
        title="Arrastra para redimensionar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10L10 2M10 6V2H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default function VideoTextEditor({
  textClips,
  onAddTextClip,
  onUpdateTextClip,
  onDeleteTextClip,
  currentTime,
  videoDuration,
}: VideoTextEditorProps) {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const [newTextClip, setNewTextClip] = useState({
    text: '',
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: { x: 50, y: 50 }, // Porcentaje
    startTime: currentTime,
    duration: 5,
    opacity: 100,
    textAlign: 'center' as 'left' | 'center' | 'right',
  });

  const selectedClip = textClips.find(clip => clip.id === selectedClipId);

  const handleAddNewClip = () => {
    if (!newTextClip.text.trim()) {
      toast({
        title: 'Error',
        description: 'El texto no puede estar vacío',
        variant: 'destructive',
      });
      return;
    }

    onAddTextClip(newTextClip);
    setNewTextClip({
      ...newTextClip,
      text: '',
      startTime: currentTime,
    });
    setIsAddingNew(false);
    
    toast({
      title: 'Texto añadido',
      description: 'El texto se ha añadido al video',
    });
  };

  const handleUpdateSelectedClip = (updates: Partial<VideoTextClip>) => {
    if (!selectedClipId) return;
    onUpdateTextClip(selectedClipId, updates);
  };

  const handleDeleteSelectedClip = () => {
    if (!selectedClipId) return;
    onDeleteTextClip(selectedClipId);
    setSelectedClipId(null);
    
    toast({
      title: 'Texto eliminado',
      description: 'El texto se ha eliminado del video',
    });
  };

  const getActiveTextClips = () => {
    return textClips.filter(clip => 
      currentTime >= clip.startTime && 
      currentTime < clip.startTime + clip.duration
    );
  };

  return (
    <div className="space-y-2">
      {/* Lista de textos existentes */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Textos en el Video ({textClips.length})
          </Label>
          <Button
            size="sm"
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir Texto
          </Button>
        </div>

        <div className="space-y-1 max-h-24 overflow-y-auto">
          {textClips.map((clip) => {
            const isActive = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
            return (
              <div
                key={clip.id}
                className={`flex items-center justify-between p-1 rounded-md border cursor-pointer transition-colors ${
                  selectedClipId === clip.id 
                    ? 'border-primary bg-primary/10' 
                    : isActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedClipId(clip.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">
                    {clip.text.length > 20 ? clip.text.substring(0, 20) + '...' : clip.text}
                  </span>
                  {isActive && (
                    <span className="text-xs bg-green-500 text-white px-1 rounded">Activo</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {clip.startTime.toFixed(1)}s - {(clip.startTime + clip.duration).toFixed(1)}s
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSelectedClip();
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          {textClips.length === 0 && (
            <div className="text-center py-2 text-muted-foreground text-sm">
              No hay textos en el video. Haz clic en "Añadir Texto" para empezar.
            </div>
          )}
        </div>
      </div>

      {/* Formulario para añadir nuevo texto */}
      {isAddingNew && (
        <div className="space-y-2 p-2 bg-transparent">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Añadir Nuevo Texto</h4>
          
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="new-text" className="text-xs text-green-400 font-bold mb-2 block uppercase">Texto</Label>
              <ResizableTextarea
                value={newTextClip.text}
                onChange={(value) => setNewTextClip({ ...newTextClip, text: value })}
                placeholder="Escribe tu texto aquí..."
                className="border"
                textAlign={newTextClip.textAlign}
              />
            </div>

            <div>
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Alineación</Label>
              <div className="flex gap-1 bg-black/20 p-2 rounded-lg border border-white/5">
                <Button
                  size="sm"
                  variant={newTextClip.textAlign === 'left' ? 'default' : 'outline'}
                  onClick={() => setNewTextClip({ ...newTextClip, textAlign: 'left' })}
                  className="flex-1"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={newTextClip.textAlign === 'center' ? 'default' : 'outline'}
                  onClick={() => setNewTextClip({ ...newTextClip, textAlign: 'center' })}
                  className="flex-1"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={newTextClip.textAlign === 'right' ? 'default' : 'outline'}
                  onClick={() => setNewTextClip({ ...newTextClip, textAlign: 'right' })}
                  className="flex-1"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Fuente</Label>
                <Select value={newTextClip.fontFamily} onValueChange={(value: string) => setNewTextClip({ ...newTextClip, fontFamily: value })}>
                  <SelectTrigger className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {FONTS.map(font => (
                      <SelectItem key={font} value={font} className="focus:bg-emerald-500 focus:text-white">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Tamaño</Label>
                <Input
                  type="number"
                  min="8"
                  max="120"
                  value={newTextClip.fontSize}
                  onChange={(e) => setNewTextClip({ ...newTextClip, fontSize: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Color Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTextClip.color}
                    onChange={(e) => setNewTextClip({ ...newTextClip, color: e.target.value })}
                    className="w-10 h-10 p-0 border border-gray-600 cursor-pointer rounded-lg bg-gray-950"
                  />
                  <Input
                    value={newTextClip.color}
                    onChange={(e) => setNewTextClip({ ...newTextClip, color: e.target.value })}
                    className="text-sm flex-1 bg-gray-950 border-gray-600 text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Color Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTextClip.backgroundColor}
                    onChange={(e) => setNewTextClip({ ...newTextClip, backgroundColor: e.target.value })}
                    className="w-10 h-10 p-0 border border-gray-600 cursor-pointer rounded-lg bg-gray-950"
                  />
                  <Input
                    value={newTextClip.backgroundColor}
                    onChange={(e) => setNewTextClip({ ...newTextClip, backgroundColor: e.target.value })}
                    className="text-sm flex-1 bg-gray-950 border-gray-600 text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Inicio (s)</Label>
                <Input
                  type="number"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={newTextClip.startTime}
                  onChange={(e) => setNewTextClip({ ...newTextClip, startTime: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Duración (s)</Label>
                <Input
                  type="number"
                  min="0.1"
                  max={videoDuration - newTextClip.startTime}
                  step="0.1"
                  value={newTextClip.duration}
                  onChange={(e) => setNewTextClip({ ...newTextClip, duration: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Posición</Label>
              <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-500 uppercase font-black">X: {newTextClip.position.x}%</Label>
                  <Slider
                    value={[newTextClip.position.x]}
                    onValueChange={([value]) => setNewTextClip({ ...newTextClip, position: { ...newTextClip.position, x: value } })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-500 uppercase font-black">Y: {newTextClip.position.y}%</Label>
                  <Slider
                    value={[newTextClip.position.y]}
                    onValueChange={([value]) => setNewTextClip({ ...newTextClip, position: { ...newTextClip.position, y: value } })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-white/5">
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase text-center">Opacidad: {newTextClip.opacity}%</Label>
              <Slider
                value={[newTextClip.opacity]}
                onValueChange={([value]) => setNewTextClip({ ...newTextClip, opacity: value })}
                min={0}
                max={100}
                step={5}
                className="w-full px-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNewClip}>
              Añadir Texto
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Editor de texto seleccionado */}
      {selectedClip && !isAddingNew && (
        <div className="space-y-2 p-2 bg-transparent">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Editar Texto Seleccionado</h4>
          
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="edit-text" className="text-xs text-green-400 font-bold mb-2 block uppercase">Texto</Label>
              <ResizableTextarea
                value={selectedClip.text}
                onChange={(value) => handleUpdateSelectedClip({ text: value })}
                placeholder="Escribe tu texto aquí..."
                className="border"
                textAlign={selectedClip.textAlign}
              />
            </div>

            <div>
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Alineación</Label>
              <div className="flex gap-1 bg-black/20 p-2 rounded-lg border border-white/5">
                <Button
                  size="sm"
                  variant={selectedClip.textAlign === 'left' ? 'default' : 'outline'}
                  onClick={() => handleUpdateSelectedClip({ textAlign: 'left' })}
                  className="flex-1"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedClip.textAlign === 'center' ? 'default' : 'outline'}
                  onClick={() => handleUpdateSelectedClip({ textAlign: 'center' })}
                  className="flex-1"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedClip.textAlign === 'right' ? 'default' : 'outline'}
                  onClick={() => handleUpdateSelectedClip({ textAlign: 'right' })}
                  className="flex-1"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Fuente</Label>
                <Select value={selectedClip.fontFamily} onValueChange={(value: string) => handleUpdateSelectedClip({ fontFamily: value })}>
                  <SelectTrigger className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {FONTS.map(font => (
                      <SelectItem key={font} value={font} className="focus:bg-emerald-500 focus:text-white">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Tamaño</Label>
                <Input
                  type="number"
                  min="8"
                  max="120"
                  value={selectedClip.fontSize}
                  onChange={(e) => handleUpdateSelectedClip({ fontSize: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Color Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedClip.color}
                    onChange={(e) => handleUpdateSelectedClip({ color: e.target.value })}
                    className="w-10 h-10 p-0 border border-gray-600 cursor-pointer rounded-lg bg-gray-950"
                  />
                  <Input
                    value={selectedClip.color}
                    onChange={(e) => handleUpdateSelectedClip({ color: e.target.value })}
                    className="text-sm flex-1 bg-gray-950 border-gray-600 text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Color Fondo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedClip.backgroundColor}
                    onChange={(e) => handleUpdateSelectedClip({ backgroundColor: e.target.value })}
                    className="w-10 h-10 p-0 border border-gray-600 cursor-pointer rounded-lg bg-gray-950"
                  />
                  <Input
                    value={selectedClip.backgroundColor}
                    onChange={(e) => handleUpdateSelectedClip({ backgroundColor: e.target.value })}
                    className="text-sm flex-1 bg-gray-950 border-gray-600 text-white font-mono focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Inicio (s)</Label>
                <Input
                  type="number"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={selectedClip.startTime}
                  onChange={(e) => handleUpdateSelectedClip({ startTime: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Duración (s)</Label>
                <Input
                  type="number"
                  min="0.1"
                  max={videoDuration - selectedClip.startTime}
                  step="0.1"
                  value={selectedClip.duration}
                  onChange={(e) => handleUpdateSelectedClip({ duration: Number(e.target.value) })}
                  className="text-sm bg-gray-950 border-gray-600 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase">Posición</Label>
              <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-500 uppercase font-black">X: {selectedClip.position.x}%</Label>
                  <Slider
                    value={[selectedClip.position.x]}
                    onValueChange={([value]) => handleUpdateSelectedClip({ position: { ...selectedClip.position, x: value } })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-500 uppercase font-black">Y: {selectedClip.position.y}%</Label>
                  <Slider
                    value={[selectedClip.position.y]}
                    onValueChange={([value]) => handleUpdateSelectedClip({ position: { ...selectedClip.position, y: value } })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-black/20 p-3 rounded-lg border border-white/5">
              <Label className="text-xs text-green-400 font-bold mb-2 block uppercase text-center">Opacidad: {selectedClip.opacity}%</Label>
              <Slider
                value={[selectedClip.opacity]}
                onValueChange={([value]) => handleUpdateSelectedClip({ opacity: value })}
                min={0}
                max={100}
                step={5}
                className="w-full px-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDeleteSelectedClip}>
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar Texto
            </Button>
          </div>
        </div>
      )}

      {/* Textos activos actualmente */}
      {getActiveTextClips().length > 0 && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="text-xs text-green-800">
            <strong>Textos activos ahora:</strong> {getActiveTextClips().map(clip => clip.text).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
