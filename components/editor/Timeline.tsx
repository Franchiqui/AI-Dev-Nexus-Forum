import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TimelineState, TimelineTrack, TimelineClip, TrackType } from '@/types';
import { Play, Pause, Plus, Volume2, VolumeX, Lock, Unlock, Eye, EyeOff, Scissors, Trash2, Copy, ClipboardPaste, ChevronLeft, ChevronRight, SkipBack, SkipForward, ArrowLeftToLine, Undo2, Redo2, Zap } from 'lucide-react';

interface TimelineProps {
  timeline: TimelineState;
  onTimelineChange: (timeline: TimelineState) => void;
  onAddTrack: (type: TrackType) => void;
  onAddClip: (trackId: string, clip: Omit<TimelineClip, 'id' | 'trackId'>) => void;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  onDeleteClip: (clipId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onSnapToStart?: (trackId: string) => void;
  onSplitClip?: (clipId: string, splitTime: number) => void;
  onCopyClip?: (clipId: string) => void;
  onPasteClip?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSeek?: (time: number) => void;
  onSelectClip?: (clipId: string | null) => void;
  selectedClipId?: string | null;
  onPlayPause?: (isPlaying: boolean) => void;
}

const TRACK_HEIGHT = 60;
const TRACK_COLORS = {
  video: 'bg-blue-500/20 border-blue-500',
  audio: 'bg-green-500/20 border-green-500',
  text: 'bg-purple-500/20 border-purple-500'
};

const CLIP_COLORS = {
  video: 'bg-blue-500',
  audio: 'bg-green-500',
  text: 'bg-purple-500'
};

export default function Timeline({
  timeline,
  onTimelineChange,
  onAddTrack,
  onAddClip,
  onUpdateClip,
  onDeleteClip,
  onDeleteTrack,
  onSnapToStart,
  onSplitClip,
  onCopyClip,
  onPasteClip,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSeek,
  onSelectClip,
  selectedClipId: externalSelectedClipId,
  onPlayPause
}: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalSelectedClip, setInternalSelectedClip] = useState<string | null>(null);
  const selectedClip = externalSelectedClipId !== undefined ? externalSelectedClipId : internalSelectedClip;

  const setSelectedClip = (id: string | null) => {
    if (externalSelectedClipId !== undefined) {
      onSelectClip?.(id);
    } else {
      setInternalSelectedClip(id);
      onSelectClip?.(id);
    }
  };

  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const headersContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const pixelsPerSecond = timeline.zoom;
  const totalWidth = Math.max(timeline.duration * pixelsPerSecond, 1500);

  // Función para mover el tiempo (seek)
  const handleJump = (seconds: number) => {
    const newTime = Math.max(0, Math.min(timeline.duration, timeline.currentTime + seconds));
    onTimelineChange({ ...timeline, currentTime: newTime });
    if (onSeek) onSeek(newTime);
  };

  // Función para dividir el clip seleccionado
  const handleSplit = () => {
    if (!selectedClip || !onSplitClip) return;
    onSplitClip(selectedClip, timeline.currentTime);
  };

  // Función para copiar
  const handleCopy = () => {
    if (selectedClip && onCopyClip) {
      onCopyClip(selectedClip);
    }
  };

  // Función para pegar
  const handlePaste = () => {
    if (onPasteClip) {
      onPasteClip();
    }
  };

  // Función para silenciar el clip seleccionado
  const handleToggleMuteSelected = () => {
    if (!selectedClip || !onUpdateClip) return;
    const clip = timeline.tracks.flatMap(track => track.clips).find(c => c.id === selectedClip);
    if (clip) {
      onUpdateClip(selectedClip, { volume: clip.volume === 0 ? 1 : 0 });
    }
  };

  // Función para borrar el clip seleccionado
  const handleDeleteSelected = () => {
    if (selectedClip) {
      onDeleteClip(selectedClip);
      setSelectedClip(null);
    }
  };

  // Sincronizar scroll horizontal (ruler) y vertical (headers)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollTop } = e.currentTarget;
    
    const ruler = document.getElementById('timeline-ruler');
    if (ruler) ruler.scrollLeft = scrollLeft;
    
    if (headersContainerRef.current) {
      headersContainerRef.current.scrollTop = scrollTop;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    onPlayPause?.(newPlayingState);
  };

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    
    onTimelineChange({
      ...timeline,
      currentTime: Math.max(0, Math.min(time, timeline.duration))
    });
  };

  const handleClipMouseDown = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    setSelectedClip(clipId);
    setDraggedClip(clipId);
    setIsDragging(true);
    setDragStartX(e.clientX);
    
    const clip = timeline.tracks.flatMap(track => track.clips).find(c => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.startTime);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedClip || !timelineRef.current) return;

    // Movimiento Horizontal (Tiempo)
    const deltaX = e.clientX - dragStartX;
    const deltaTime = deltaX / pixelsPerSecond;
    
    // Movimiento Vertical (Pista)
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const trackIndex = Math.floor(relativeY / 80); // 80px es la altura de cada pista (h-20)
    
    const targetTrack = timeline.tracks[Math.max(0, Math.min(timeline.tracks.length - 1, trackIndex))];
    const clip = timeline.tracks.flatMap(track => track.clips).find(c => c.id === draggedClip);
    
    if (clip) {
      const newStartTime = Math.max(0, dragStartTime + deltaTime);
      const maxStartTime = timeline.duration - clip.duration;
      
      const updates: Partial<TimelineClip> = {
        startTime: Math.min(newStartTime, maxStartTime)
      };

      // Si la pista ha cambiado, añadir trackId a las actualizaciones
      if (targetTrack && targetTrack.id !== clip.trackId) {
        // Opcional: Solo permitir cambio si el tipo de pista coincide (audio a audio, etc)
        // if (targetTrack.type === clip.type) {
        updates.trackId = targetTrack.id;
        // }
      }
      
      onUpdateClip(draggedClip, updates);
    }
  }, [isDragging, draggedClip, dragStartX, pixelsPerSecond, timeline, onUpdateClip]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedClip(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleTrackMute = (trackId: string) => {
    const updatedTracks = timeline.tracks.map(track =>
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    );
    
    onTimelineChange({
      ...timeline,
      tracks: updatedTracks
    });
  };

  const toggleTrackLock = (trackId: string) => {
    const updatedTracks = timeline.tracks.map(track =>
      track.id === trackId ? { ...track, isLocked: !track.isLocked } : track
    );
    
    onTimelineChange({
      ...timeline,
      tracks: updatedTracks
    });
  };

  const renderTimeRuler = () => {
    const markers = [];
    const interval = pixelsPerSecond >= 100 ? 1 : pixelsPerSecond >= 50 ? 2 : 5;
    
    for (let i = 0; i <= timeline.duration; i += interval) {
      const x = i * pixelsPerSecond;
      markers.push(
        <div
          key={i}
          className="absolute top-0 h-4 border-l border-gray-600"
          style={{ left: `${x}px` }}
        >
          <span className="absolute top-4 text-xs text-gray-400 -translate-x-1/2">
            {formatTime(i)}
          </span>
        </div>
      );
    }
    
    return markers;
  };

  const renderClip = (clip: TimelineClip) => {
    if (!clip) return null;
    const x = Math.max(0, clip.startTime * pixelsPerSecond);
    const width = Math.max(10, clip.duration * pixelsPerSecond);
    const color = CLIP_COLORS[clip.type] || 'bg-gray-500';
    
    return (
      <div
        key={clip.id}
        className={`absolute h-[68px] ${color} rounded-md cursor-move border-2 shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] overflow-hidden group/clip ${
          selectedClip === clip.id ? 'border-white z-20 ring-4 ring-white/20' : 'border-white/10 z-10'
        } ${clip.type === 'text' ? 'flex items-center justify-center text-white font-black text-sm px-3' : ''}`}
        style={{
          left: `${x}px`,
          width: `${width}px`,
          top: '6px'
        }}
        onMouseDown={(e) => handleClipMouseDown(e, clip.id)}
      >
        {/* Botón de eliminar individual */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClip(clip.id);
            if (selectedClip === clip.id) setSelectedClip(null);
          }}
          className="absolute top-1 right-1 z-30 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover/clip:opacity-100 transition-all duration-200 shadow-xl"
          title="Eliminar clip"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Indicador de silenciado (Si el volumen es 0) */}
        {clip.volume === 0 && (
          <div className="absolute top-1 left-1 z-20 text-red-500 bg-black/40 p-0.5 rounded shadow-lg" title="Clip silenciado">
            <VolumeX className="w-3.5 h-3.5" />
          </div>
        )}

        {clip.type === 'text' ? (
          <span className="truncate drop-shadow-lg uppercase tracking-wider">{clip.text || 'Texto'}</span>
        ) : (
          <div className="relative w-full h-full group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10" />
            {clip.thumbnailUrl ? (
              <img 
                src={clip.thumbnailUrl} 
                alt="Clip"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">{clip.type}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-black/70 text-[10px] text-white px-2 py-1 font-black flex justify-between items-center border-t border-white/5">
              <div className="flex items-center gap-1 truncate max-w-[60%]">
                {(clip.transitionIn?.type && clip.transitionIn.type !== 'none') && <Zap className="w-2.5 h-2.5 text-emerald-400" />}
                <span className="truncate">{clip.id.slice(-6).toUpperCase()}</span>
                {(clip.transitionOut?.type && clip.transitionOut.type !== 'none') && <Zap className="w-2.5 h-2.5 text-emerald-400" />}
              </div>
              <span className="bg-white/10 px-1 rounded">{clip.duration.toFixed(1)}s</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-800 shadow-2xl overflow-hidden">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020617;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 6px;
          border: 2px solid #020617;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* 1. Toolbar Superior */}
      <div className="flex items-center justify-between px-8 py-3 bg-gray-900 border-b border-gray-800 h-16 flex-shrink-0 z-50 shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Controles de Navegación */}
          <div className="flex items-center bg-gray-950/50 p-1 rounded-full border border-white/10 shadow-inner mr-2">
            <Button size="sm" variant="ghost" onClick={() => handleJump(-1)} className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white" title="-1 segundo">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleJump(-0.033)} className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white" title="-1 frame">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              className={`rounded-full h-11 w-11 p-0 transition-all active:scale-90 border border-white/10 shadow-xl mx-1 ${
                isPlaying ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </Button>

            <Button size="sm" variant="ghost" onClick={() => handleJump(0.033)} className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white" title="+1 frame">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleJump(1)} className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white" title="+1 segundo">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-10 w-px bg-gray-800" />
          
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Posición</span>
            <div className="text-2xl font-mono text-white font-black leading-none flex items-baseline">
              {formatTime(timeline.currentTime)}
            </div>
          </div>
          
          <div className="flex bg-gray-800/50 p-1 rounded-xl border border-white/5 ml-4">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onUndo}
              disabled={!canUndo}
              className={`h-9 w-9 p-0 text-white transition-all ${canUndo ? 'hover:bg-blue-500/20 hover:text-blue-400' : 'opacity-30'}`}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onRedo}
              disabled={!canRedo}
              className={`h-9 w-9 p-0 text-white transition-all ${canRedo ? 'hover:bg-blue-500/20 hover:text-blue-400' : 'opacity-30'}`}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSplit}
              disabled={!selectedClip}
              className={`h-9 w-9 p-0 text-white transition-all ${selectedClip ? 'hover:bg-blue-500/20 hover:text-blue-400' : 'opacity-30'}`}
              title="Cortar clip seleccionado (Tijeras)"
            >
              <Scissors className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCopy}
              disabled={!selectedClip}
              className={`h-9 w-9 p-0 text-white transition-all ${selectedClip ? 'hover:bg-blue-500/20 hover:text-blue-400' : 'opacity-30'}`}
              title="Copiar clip seleccionado"
            >
              <Copy className="w-5 h-5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handlePaste}
              className="h-9 w-9 p-0 text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
              title="Pegar clip en la posición actual"
            >
              <ClipboardPaste className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleToggleMuteSelected}
              disabled={!selectedClip}
              className={`h-9 w-9 p-0 text-white transition-all ${selectedClip ? 'hover:bg-blue-500/20 hover:text-blue-400' : 'opacity-30'}`}
              title="Silenciar/Activar clip seleccionado"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-gray-700 mx-1 self-center" />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDeleteSelected}
              disabled={!selectedClip}
              className={`h-9 w-9 p-0 text-white transition-all ${selectedClip ? 'hover:bg-red-500/20 hover:text-red-400' : 'opacity-30'}`}
              title="Borrar clip seleccionado"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex bg-gray-950 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <Button size="sm" variant="ghost" onClick={() => onAddTrack('video')} className="h-8 text-[11px] text-blue-400 hover:bg-blue-500/10 font-black px-4 tracking-widest">
              + VÍDEO
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAddTrack('audio')} className="h-8 text-[11px] text-emerald-400 hover:bg-emerald-500/10 font-black px-4 tracking-widest">
              + AUDIO
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAddTrack('text')} className="h-8 text-[11px] text-violet-400 hover:bg-violet-500/10 font-black px-4 tracking-widest">
              + TEXTO
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-950 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Zoom</span>
            <input
              type="range"
              min="50"
              max="600"
              value={pixelsPerSecond}
              onChange={(e) => onTimelineChange({ ...timeline, zoom: Number(e.target.value) })}
              className="w-32 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Área de Timeline Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Cabeceras de Pistas (Fijas a la izquierda) */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 z-40 flex flex-col shadow-[10px_0_15px_rgba(0,0,0,0.3)]">
          {/* Espacio para alinear con el Ruler */}
          <div className="h-10 bg-gray-800 border-b border-gray-700 w-full flex items-center px-4">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pistas / Capas</span>
          </div>
          
          <div 
            ref={headersContainerRef}
            className="flex-1 overflow-hidden no-scrollbar"
            onWheel={(e) => {
              if (tracksContainerRef.current) {
                tracksContainerRef.current.scrollTop += e.deltaY;
              }
            }}
          >
            {(timeline.tracks || []).map((track) => (
              <div key={track.id} className="h-20 border-b border-gray-800 flex flex-col justify-center px-4 group hover:bg-gray-800/80 transition-colors bg-gray-900">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-gray-100 truncate uppercase tracking-tight">{track.name}</span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {track.type === 'audio' && (
                      <button onClick={() => toggleTrackMute(track.id)} className="text-gray-400 hover:text-emerald-400 p-1 bg-black/20 rounded">
                        {track.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => toggleTrackLock(track.id)} className="text-gray-400 hover:text-amber-400 p-1 bg-black/20 rounded">
                      {!track.isLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    {/* Botón Snap al inicio */}
                    {onSnapToStart && (
                      <button 
                        onClick={() => onSnapToStart(track.id)} 
                        className="text-gray-400 hover:text-blue-400 p-1 bg-black/20 rounded"
                        title="Traer clips al inicio"
                      >
                        <ArrowLeftToLine className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Botón para borrar pista (Solo secundarias) */}
                    {onDeleteTrack && !['video-1', 'audio-1', 'text-1'].includes(track.id) && (
                      <button 
                        onClick={() => onDeleteTrack(track.id)} 
                        className="text-gray-400 hover:text-red-500 p-1 bg-black/20 rounded"
                        title="Eliminar pista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${track.type === 'video' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : track.type === 'audio' ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'}`} />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{track.type}</span>
                  </div>
                  <span className="text-[9px] text-gray-600 font-mono">ID: {track.id.slice(-4)}</span>
                </div>
              </div>
            ))}
            {/* Relleno inferior para permitir scroll */}
            <div className="h-40" />
          </div>
        </div>

        {/* Contenido de Pistas y Ruler (Con Scroll) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
          
          {/* Ruler */}
          <div id="timeline-ruler" className="h-10 bg-gray-800 border-b border-gray-700 overflow-hidden no-scrollbar relative flex-shrink-0 z-20">
            <div className="relative h-full" style={{ width: `${totalWidth}px` }}>
              {renderTimeRuler()}
            </div>
          </div>

          {/* Área de Clips (Scrollable) */}
          <div 
            ref={tracksContainerRef}
            className="flex-1 overflow-auto custom-scrollbar relative" 
            onScroll={handleScroll}
          >
            <div 
              ref={timelineRef}
              className="relative min-h-full" 
              style={{ 
                width: `${totalWidth}px`,
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: `100% 80px, ${pixelsPerSecond}px 100%`
              }}
              onClick={handleTimelineClick}
            >
              {/* Playhead Line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-40 pointer-events-none"
                style={{ left: `${timeline.currentTime * pixelsPerSecond}px` }}
              >
                <div className="absolute top-0 -left-[6px] w-3.5 h-3.5 bg-red-500 rotate-45 shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-white/20" />
              </div>

              {/* Grid Horizontal / Tracks Content */}
              <div className="flex flex-col">
                {(timeline.tracks || []).map((track) => (
                  <div
                    key={track.id}
                    className={`h-20 border-b border-gray-800/80 relative group transition-colors ${
                      track.isLocked ? 'bg-gray-900/60' : 'bg-gray-900/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Visual de fondo de pista */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-gray-800 to-transparent" />
                    
                    {/* Clips de la pista */}
                    {(track.clips || []).map(renderClip)}
                  </div>
                ))}
              </div>
              
              {/* Espacio para nuevas pistas */}
              <div className="h-40 w-full bg-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

