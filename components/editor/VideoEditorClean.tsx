import { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoEditState, TimelineState, TimelineTrack, TimelineClip, TrackType, TextClip } from '@/types';
import Timeline from './Timeline';
import TimelinePlayer from './TimelinePlayer';
import TimelinePreview from './TimelinePreview';
import FileUploader from '@/components/ui/file-uploader';
import VideoTextEditor from './VideoTextEditor';
import TextOverlay from './TextOverlay';
import { Upload, Plus, FileVideo, FileAudio, FileImage, X, Volume2, VolumeX, Settings, Scissors, Type, Check, Download, FolderOpen, Loader2, Film, Save, Folder, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

type VideoEditorProps = {
  videoUrl: string;
  initialEditState?: VideoEditState;
  projectFile?: File;
  onSave: (editState: VideoEditState) => void;
  onCancel: () => void;
  onLoadProject?: (projectData: any) => void;
};

export default function VideoEditorNew({ videoUrl, initialEditState, projectFile, onSave, onCancel, onLoadProject }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'audio' | 'image'>('video');
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [projectInputRef, setProjectInputRef] = useState<HTMLInputElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFileName, setExportFileName] = useState('');
  const [exportFormat, setExportFormat] = useState('webm');
  const [exportQuality, setExportQuality] = useState('high');
  const [videoDuration, setVideoDuration] = useState(0);
  const [playerZoom, setPlayerZoom] = useState(100);
  const [timelineHeight, setTimelineHeight] = useState(320); // Altura inicial por defecto
  const [isResizingTimeline, setIsResizingTimeline] = useState(false);

  const handlePlayerZoom = (delta: number) => {
    setPlayerZoom(prev => Math.max(50, Math.min(400, prev + delta)));
  };

  const resetPlayerZoom = () => setPlayerZoom(100);

  // Lógica para redimensionar la línea de tiempo
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isResizingTimeline) return;
      
      // Calcular nueva altura (la diferencia desde el fondo de la pantalla)
      const newHeight = window.innerHeight - e.clientY;
      // Limitar la altura mínima y máxima
      setTimelineHeight(Math.max(150, Math.min(window.innerHeight * 0.7, newHeight)));
    };

    const handleGlobalMouseUp = () => {
      setIsResizingTimeline(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingTimeline) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizingTimeline]);

  // Función para formatear tiempo a MM:SS
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cargar proyecto si se proporciona un archivo de proyecto
  useEffect(() => {
    if (projectFile) {
      loadProjectFromFile(projectFile);
    }
  }, [projectFile]);

  const loadProjectFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text);
      
      // Validar que sea un proyecto válido
      if (projectData.version && projectData.editState) {
        setEditState(projectData.editState);
        
        // Notificar que se cargó un proyecto
        if (onLoadProject) {
          onLoadProject(projectData);
        }
        
        console.log('Proyecto cargado exitosamente:', projectData);
      } else {
        console.error('El archivo no es un proyecto válido');
      }
    } catch (error) {
      console.error('Error al cargar el proyecto:', error);
    }
  };

  const handleLoadProject = () => {
    if (projectInputRef) {
      projectInputRef.click();
    }
  };

  const handleProjectFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadProjectFromFile(file);
    }
  };
  const [editState, setEditState] = useState<VideoEditState>(() => {
    const defaultTimeline = {
      duration: 60,
      currentTime: 0,
      zoom: 100,
      tracks: [
        {
          id: 'video-1',
          type: 'video' as TrackType,
          name: 'Vídeo Principal',
          clips: [],
          isLocked: false
        },
        {
          id: 'audio-1',
          type: 'audio' as TrackType,
          name: 'Audio Principal',
          clips: [],
          isMuted: false,
          isLocked: false,
          volume: 1
        },
        {
          id: 'text-1',
          type: 'text' as TrackType,
          name: 'Texto/Superposiciones',
          clips: [],
          isLocked: false
        }
      ]
    };

    if (!initialEditState) {
      return {
        trimStart: 0,
        trimEnd: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
        textClips: [],
        timeline: defaultTimeline
      };
    }

    return {
      ...initialEditState,
      timeline: initialEditState.timeline || defaultTimeline,
      textClips: initialEditState.textClips || []
    };
  });

  // Funciones de manejo de estado
  const handleTrimStartChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, trimStart: value[0] }));
  };

  const handleTrimEndChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, trimEnd: value[0] }));
  };

  const handleEffectChange = (key: keyof Pick<VideoEditState, 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur'>) => (value: number[]) => {
    setEditState(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleTimelineChange = (timeline: TimelineState) => {
    saveToHistory({ ...editState, timeline });
  };

  const handleTimelinePlayPause = (isPlaying: boolean) => {
    setIsTimelinePlaying(isPlaying);
  };

  // Funciones para manejar textos
  const handleAddTextClip = (clip: Omit<TextClip, 'id'>) => {
    const newClip: TextClip = {
      ...clip,
      id: `text-${Date.now()}`,
    };
    saveToHistory({
      ...editState,
      textClips: [...(editState.textClips || []), newClip]
    });
    
    // También añadir a la línea de tiempo
    if (editState.timeline) {
      const textTrack = editState.timeline.tracks.find(track => track.type === 'text');
      if (textTrack) {
        const timelineClip: TimelineClip = {
          id: newClip.id,
          trackId: textTrack.id,
          type: 'text',
          startTime: clip.startTime,
          duration: clip.duration,
          text: clip.text,
          fontSize: clip.fontSize,
          fontFamily: clip.fontFamily,
          color: clip.color,
          backgroundColor: clip.backgroundColor,
          position: clip.position,
          opacity: clip.opacity / 100,
        };
        handleAddClip(textTrack.id, timelineClip);
      }
    }
  };

  const handleUpdateTextClip = (id: string, updates: Partial<TextClip>) => {
    saveToHistory({
      ...editState,
      textClips: (editState.textClips || []).map(clip => 
        clip.id === id ? { ...clip, ...updates } : clip
      )
    });
    
    // También actualizar en la línea de tiempo
    if (editState.timeline) {
      const textTrack = editState.timeline.tracks.find(track => track.type === 'text');
      if (textTrack) {
        const clip = textTrack.clips.find(c => c.id === id);
        if (clip) {
          const updatedClip = {
            ...clip,
            ...updates,
            opacity: updates.opacity !== undefined ? updates.opacity / 100 : clip.opacity,
          };
          handleUpdateClip(id, updatedClip);
        }
      }
    }
  };

  const handleDeleteTextClip = (id: string) => {
    saveToHistory({
      ...editState,
      textClips: (editState.textClips || []).filter(clip => clip.id !== id)
    });
    
    // También eliminar de la línea de tiempo
    if (editState.timeline) {
      const textTrack = editState.timeline.tracks.find(track => track.type === 'text');
      if (textTrack) {
        handleDeleteClip(id);
      }
    }
  };

  const handleSave = () => {
    // Crear objeto de proyecto con toda la información de edición
    const projectData = {
      version: '1.0',
      videoUrl: videoUrl,
      editState: editState,
      timestamp: new Date().toISOString(),
      metadata: {
        duration: videoRef.current?.duration || 0,
        resolution: {
          width: videoRef.current?.videoWidth || 0,
          height: videoRef.current?.videoHeight || 0
        }
      }
    };

    // Crear blob con los datos del proyecto
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
      type: 'application/json' 
    });
    
    // Crear URL para descarga
    const url = URL.createObjectURL(blob);
    
    // Crear enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_project_${Date.now()}.nexus`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // También guardar en el estado actual (para compatibilidad)
    onSave(editState);
    
    // Mostrar mensaje de éxito
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const handleExportVideo = () => {
    setShowExportDialog(true);
    // Generar nombre por defecto basado en la fecha y hora actual
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    setExportFileName(`video_editado_${timestamp}`);
  };

  const startExportProcess = () => {
    setShowExportDialog(false);
    performActualExport();
  };

  const performActualExport = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Iniciar estado de exportación
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Preparando exportación...');

    // Crear un canvas para renderizar el video con todos los efectos
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // Configurar el canvas al tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Función para renderizar frame con todos los efectos y textos
    const renderFrame = (currentTime: number, videoElement?: HTMLVideoElement, shouldSeek: boolean = true) => {
      // Usar el video proporcionado o el video principal por defecto
      const currentVideo = videoElement || video;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Guardar estado del contexto
      ctx.save();
      
      // Aplicar filtros de video (brillo, contraste, saturación, matiz, desenfoque)
      const filters = [];
      
      if (editState.brightness && editState.brightness !== 0) {
        filters.push(`brightness(${100 + editState.brightness}%)`);
      }
      if (editState.contrast && editState.contrast !== 0) {
        filters.push(`contrast(${100 + editState.contrast}%)`);
      }
      if (editState.saturation && editState.saturation !== 0) {
        filters.push(`saturate(${100 + editState.saturation}%)`);
      }
      if (editState.hue && editState.hue !== 0) {
        filters.push(`hue-rotate(${editState.hue}deg)`);
      }
      if (editState.blur && editState.blur !== 0) {
        filters.push(`blur(${editState.blur}px)`);
      }
      
      // Aplicar filtros al contexto
      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
      }
      
      // Obtener todos los clips de video activos en el tiempo actual de la línea de tiempo
      const activeVideoClips = (editState.timeline?.tracks || [])
        .flatMap(track => track.clips)
        .filter(clip => 
          clip.type === 'video' && 
          clip.mediaFileId && 
          currentTime >= clip.startTime && 
          currentTime < clip.startTime + clip.duration
        );
      
      console.log('=== RENDER FRAME ===');
      console.log('Current time:', currentTime.toFixed(3));
      console.log('Active video clips:', activeVideoClips.length);
      
      // Renderizar cada clip de video activo
      if (activeVideoClips.length > 0) {
        activeVideoClips.forEach(clip => {
          const clipLocalTime = currentTime - clip.startTime;
          
          // Para el video principal, usar el videoElement proporcionado
          if (clip.id.includes('main-video') && currentVideo) {
            const duration = currentVideo.duration;
            const startTime = editState.trimStart || 0;
            const endTime = editState.trimEnd || duration;
            
            // Si el tiempo actual está dentro del rango de recorte
            if (currentTime >= startTime && currentTime <= endTime) {
              // Solo buscar si se solicita explícitamente
              if (shouldSeek && Math.abs(currentVideo.currentTime - currentTime) > 0.1) {
                currentVideo.currentTime = currentTime;
              }
              
              // Dibujar el frame del video principal
              ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
            }
          } else {
            // Para clips adicionales, buscar o crear el elemento de video
            let clipVideo = (clip as any)._videoElement;
            
            if (!clipVideo) {
              clipVideo = document.createElement('video');
              clipVideo.src = clip.mediaFileId;
              clipVideo.crossOrigin = 'anonymous';
              clipVideo.muted = true;
              clipVideo.preload = 'auto';
              clipVideo.style.display = 'none';
              document.body.appendChild(clipVideo);
              (clip as any)._videoElement = clipVideo;
              
              console.log('Created video element for clip:', clip.id);
            }
            
            // Sincronizar el tiempo del clip
            const targetTime = clipLocalTime;
            if (Math.abs(clipVideo.currentTime - targetTime) > 0.1) {
              clipVideo.currentTime = targetTime;
            }
            
            // Dibujar el frame del clip
            if (clipVideo.readyState >= 2) {
              ctx.drawImage(clipVideo, 0, 0, canvas.width, canvas.height);
              console.log('Drew frame for clip:', clip.id, 'at time:', targetTime.toFixed(3));
            }
          }
        });
      } else {
        // Fallback: dibujar el video principal si no hay clips activos
        const duration = currentVideo.duration;
        const startTime = editState.trimStart || 0;
        const endTime = editState.trimEnd || duration;
        
        if (currentTime >= startTime && currentTime <= endTime) {
          if (shouldSeek && Math.abs(currentVideo.currentTime - currentTime) > 0.1) {
            currentVideo.currentTime = currentTime;
          }
          
          ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
        }
      }
      
      // Restaurar estado del contexto para los textos (sin filtros)
      ctx.restore();
      
      // Dibujar textos activos en el tiempo actual
      const activeTexts = (editState.textClips || []).filter(clip => 
        currentTime >= clip.startTime && 
        currentTime < clip.startTime + clip.duration
      );

      activeTexts.forEach(textClip => {
        // Configurar estilo del texto
        ctx.font = `${textClip.fontSize}px ${textClip.fontFamily}`;
        ctx.fillStyle = textClip.color;
        ctx.textAlign = textClip.textAlign || 'center';
        ctx.textBaseline = 'middle';
        
        // Calcular posición según alineación
        const baseX = (textClip.position.x / 100) * canvas.width;
        const y = (textClip.position.y / 100) * canvas.height;
        
        // Ajustar posición X según alineación
        let x = baseX;
        if (textClip.textAlign === 'center') {
          x = baseX;
        } else if (textClip.textAlign === 'left') {
          x = baseX;
        } else if (textClip.textAlign === 'right') {
          x = baseX;
        }
        
        // Aplicar opacidad
        ctx.globalAlpha = textClip.opacity / 100;
        
        // Dibujar fondo si hay color de fondo
        if (textClip.backgroundColor && textClip.backgroundColor !== 'transparent') {
          const lines = textClip.text.split('\n');
          const lineHeight = textClip.fontSize * 1.2;
          const padding = 8;
          
          // Calcular el ancho máximo entre todas las líneas
          let maxWidth = 0;
          lines.forEach(line => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxWidth) {
              maxWidth = metrics.width;
            }
          });
          
          const totalHeight = lines.length * lineHeight;
          ctx.fillStyle = textClip.backgroundColor;
          
          // Calcular posición del fondo según alineación
          let bgX = x;
          if (textClip.textAlign === 'center') {
            bgX = x - maxWidth / 2 - padding;
          } else if (textClip.textAlign === 'left') {
            bgX = x - padding;
          } else if (textClip.textAlign === 'right') {
            bgX = x - maxWidth - padding;
          }
          
          // Calcular posición Y para el fondo (centrar verticalmente el bloque completo)
          const bgY = y - totalHeight / 2 - padding;
          
          ctx.fillRect(
            bgX,
            bgY,
            maxWidth + padding * 2,
            totalHeight + padding * 2
          );
          ctx.fillStyle = textClip.color; // Restaurar color del texto
        }
        
        // Dibujar texto con soporte para múltiples líneas
        const lines = textClip.text.split('\n');
        const lineHeight = textClip.fontSize * 1.2; // 120% del tamaño de fuente para espaciado entre líneas
        const totalHeight = lines.length * lineHeight;
        
        // Calcular posición Y inicial para centrar verticalmente el bloque de texto
        let startY = y - (totalHeight - lineHeight) / 2;
        
        lines.forEach((line, index) => {
          if (line.trim()) { // Solo dibujar líneas que no estén vacías
            ctx.fillText(line, x, startY + (index * lineHeight));
          }
        });
        
        ctx.globalAlpha = 1; // Restaurar opacidad
      });
    };

    // Crear un video temporal para exportación (completamente aislado)
    const exportVideo = document.createElement('video');
    exportVideo.crossOrigin = 'anonymous'; // IMPORTANTE: Antes del src
    exportVideo.src = video.src;
    exportVideo.muted = false;
    exportVideo.volume = 1;
    exportVideo.style.display = 'none'; // Ocultar pero añadir al DOM
    document.body.appendChild(exportVideo);
    
    // Iniciar exportación
    const stream = canvas.captureStream(30); // 30 FPS
    
    // Añadir audio de todos los clips activos al stream
    let audioContext: AudioContext | null = null;
    let destination: MediaStreamAudioDestinationNode | null = null;
    const audioSources: MediaElementAudioSourceNode[] = [];
    const clipAudioElements: HTMLAudioElement[] = [];
    
    // Obtener todos los clips de audio activos de la línea de tiempo
    const activeAudioClips = (editState.timeline?.tracks || [])
      .flatMap(track => track.clips)
      .filter(clip => 
        clip.type === 'audio' && 
        clip.mediaFileId
      );

    try {
      // Crear AudioContext para mezclar audio
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      destination = audioContext.createMediaStreamDestination();
      
      // Añadir audio del video principal
      const videoStream = (exportVideo as any).captureStream ? (exportVideo as any).captureStream() : 
                         (exportVideo as any).mozCaptureStream ? (exportVideo as any).mozCaptureStream() : null;
      
      if (videoStream && videoStream.getAudioTracks().length > 0) {
        videoStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
          stream.addTrack(track);
          console.log('Pista de audio principal añadida');
        });
      } else {
        // Fallback: usar AudioContext para el video principal
        const videoAudioSource = audioContext.createMediaElementSource(exportVideo);
        videoAudioSource.connect(destination);
        audioSources.push(videoAudioSource);
        console.log('Audio principal añadido mediante AudioContext');
      }
      
      console.log('=== AUDIO EXPORT ===');
      console.log('Active audio clips:', activeAudioClips.length);
      
      // Crear elementos de audio para cada clip y añadirlos al stream
      activeAudioClips.forEach(clip => {
        const audio = document.createElement('audio');
        audio.src = clip.mediaFileId!;
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        audio.style.display = 'none';
        document.body.appendChild(audio);
        clipAudioElements.push(audio);
        
        // Configurar volumen basado en el track
        const track = editState.timeline?.tracks.find(t => t.clips.some(c => c.id === clip.id));
        const isTrackMuted = track?.isMuted || false;
        const trackVolume = track?.volume || 1.0;
        const clipVolume = clip.volume || 1.0;
        
        audio.volume = isTrackMuted ? 0 : trackVolume * clipVolume * 0.5; // Reducir para evitar distorsión
        
        // Crear fuente de audio para este clip
        if (audioContext && destination) {
          const audioSource = audioContext.createMediaElementSource(audio);
          audioSource.connect(destination);
          audioSources.push(audioSource);
        }
        
        console.log('Audio clip prepared for export:', {
          clipId: clip.id,
          volume: audio.volume,
          trackMuted: isTrackMuted,
          trackVolume,
          clipVolume
        });
      });
      
      // Añadir el stream de audio mezclado al stream principal
      if (destination) {
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
          console.log('Pista de audio mezclada añadida al stream');
        });
      }
      
    } catch (error) {
      console.warn('Error configurando audio para exportación:', error);
    }
    
    // Determinar el MIME type soportado con mayor compatibilidad
    const getBestMimeType = () => {
      const candidates = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=h264,aac',
        'video/mp4',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];

      for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log('MIME Type seleccionado para exportación:', type);
          return type;
        }
      }
      return '';
    };

    const mimeType = getBestMimeType();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: exportQuality === 'high' ? 5000000 : 2500000
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    // Función para iniciar la grabación
    const startRecording = async () => {
      setExportStatus('Iniciando grabación...');
      
      // Asegurar que el AudioContext esté activo si se está usando
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Calcular duración del video exportado (considerando recortes)
      const startTime = editState.trimStart || 0;
      const endTime = editState.trimEnd || exportVideo.duration;
      const exportDuration = endTime - startTime;
      
      // Configurar video temporal para exportación
      exportVideo.currentTime = startTime;
      
      // Esperar a que el video esté listo en la posición inicial
      const onReady = () => {
        // Pequeño retardo para asegurar que los buffers de audio estén listos
        setTimeout(() => {
          // Manejador para cuando se detiene la grabación
          mediaRecorder.onstop = () => {
            setExportStatus('Procesando video final...');
            
            // Usar el MIME type real detectado por el recorder o el sugerido
            const finalMimeType = mediaRecorder.mimeType || mimeType || 'video/webm';
            const blob = new Blob(chunks, { type: finalMimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            // Forzar extensión .mp4 si el usuario lo pidió y el navegador lo soporta,
            // de lo contrario usar la extensión del MIME type real
            const actualExt = finalMimeType.includes('mp4') ? 'mp4' : 'webm';
            a.download = `${exportFileName}.${actualExt}`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExportProgress(100);
            setExportStatus('Exportación completada');
            
            // Limpiar recursos
            if (audioContext) audioContext.close();
            if (exportVideo.parentNode) {
              document.body.removeChild(exportVideo);
            }
            
            // Limpiar elementos de audio de clips
            clipAudioElements.forEach(audio => {
              if (audio.parentNode) {
                document.body.removeChild(audio);
              }
            });
            
            // Limpiar elementos de video adicionales creados para renderFrame
            (editState.timeline?.tracks || [])
              .flatMap(track => track.clips)
              .filter(clip => clip.type === 'video' && !clip.id.includes('main-video'))
              .forEach(clip => {
                const videoElement = (clip as any)._videoElement;
                if (videoElement && videoElement.parentNode) {
                  document.body.removeChild(videoElement);
                }
                delete (clip as any)._videoElement;
              });
            
            setTimeout(() => {
              setIsExporting(false);
              setExportProgress(0);
              setExportStatus('');
            }, 2000);
          };

          mediaRecorder.start();
          exportVideo.play();
          
          let lastUpdateTimestamp = 0;
          let lastReportedProgress = -1;

          const renderLoop = () => {
            if (mediaRecorder.state === 'inactive') return;

            const currentTime = exportVideo.currentTime;
            
            // Renderizar frame actual SIN buscar (dejar que el video fluya)
            renderFrame(currentTime, exportVideo, false);
            
            // Sincronizar clips de audio adicionales
            clipAudioElements.forEach((audio, index) => {
              const clip = activeAudioClips[index];
              if (clip && audio) {
                const clipLocalTime = currentTime - clip.startTime;
                
                // Verificar si el clip debería estar activo
                const shouldBeActive = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
                
                if (shouldBeActive) {
                  // Sincronizar el tiempo del audio
                  if (Math.abs(audio.currentTime - clipLocalTime) > 0.1) {
                    audio.currentTime = clipLocalTime;
                  }
                  
                  // Reproducir si está pausado
                  if (audio.paused && audio.readyState >= 2) {
                    audio.play().catch(e => console.log('Audio clip play failed:', e));
                  }
                } else {
                  // Pausar si no debería estar activo
                  if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                  }
                }
              }
            });
            
            // Actualizar progreso de forma controlada
            const elapsed = currentTime - startTime;
            const rawProgress = exportDuration > 0 ? (elapsed / exportDuration) * 100 : 0;
            const progress = Math.max(0, Math.min(rawProgress, 99));
            
            const now = Date.now();
            const progressInt = Math.floor(progress);
            
            // Actualizar solo cada 100ms o cuando cambie el porcentaje entero
            if (now - lastUpdateTimestamp > 100 || progressInt > lastReportedProgress) {
              setExportProgress(progress);
              setExportStatus(`Exportando: ${progressInt}%`);
              lastUpdateTimestamp = now;
              lastReportedProgress = progressInt;
            }
            
            if (currentTime >= endTime || exportVideo.ended) {
              mediaRecorder.stop();
              exportVideo.pause();
              
              // Pausar todos los clips de audio
              clipAudioElements.forEach(audio => {
                if (audio && !audio.paused) {
                  audio.pause();
                }
              });
            } else {
              requestAnimationFrame(renderLoop);
            }
          };
          
          requestAnimationFrame(renderLoop);
        }, 300); // 300ms de "buffering" manual
      };

      if (exportVideo.readyState >= 2) {
        onReady();
      } else {
        exportVideo.addEventListener('canplay', onReady, { once: true });
      }
    };

    // Iniciar grabación cuando el video temporal esté listo
    setExportStatus('Cargando video temporal...');
    
    if (exportVideo.readyState >= 2) {
      startRecording();
    } else {
      exportVideo.addEventListener('loadeddata', startRecording, { once: true });
      exportVideo.load();
    }
  };

  const handleSplitClip = (clipId: string, splitTime: number) => {
    if (!editState.timeline) return;

    setEditState(prev => {
      const timeline = prev.timeline!;
      const newTracks = timeline.tracks.map(track => {
        const clipIndex = track.clips.findIndex(c => c.id === clipId);
        if (clipIndex === -1) return track;

        const clip = track.clips[clipIndex];
        
        // Verificar si el splitTime cae dentro del clip
        if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) {
          return track;
        }

        const firstPartDuration = splitTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;

        const firstPart: TimelineClip = {
          ...clip,
          id: `${clip.id}-1`,
          duration: firstPartDuration
        };

        const secondPart: TimelineClip = {
          ...clip,
          id: `${clip.id}-2`,
          startTime: splitTime,
          duration: secondPartDuration
        };

        const newClips = [...track.clips];
        newClips.splice(clipIndex, 1, firstPart, secondPart);

        return { ...track, clips: newClips };
      });

      return {
        ...prev,
        timeline: { ...timeline, tracks: newTracks }
      };
    });
  };

  const [clipboardClip, setClipboardClip] = useState<TimelineClip | null>(null);
  const [history, setHistory] = useState<VideoEditState[]>([]);
  const [future, setFuture] = useState<VideoEditState[]>([]);

  // Función para guardar el estado actual en el historial antes de un cambio
  const saveToHistory = (newState: VideoEditState) => {
    setHistory(prev => [...prev, editState].slice(-50)); // Guardar últimos 50 pasos
    setFuture([]); // Al hacer un cambio nuevo, limpiamos el futuro
    setEditState(newState);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    
    setFuture(prev => [editState, ...prev]);
    setHistory(newHistory);
    setEditState(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setHistory(prev => [...prev, editState]);
    setFuture(newFuture);
    setEditState(next);
  };

  const handleCopyClip = (clipId: string) => {
    const clip = editState.timeline?.tracks
      .flatMap(t => t.clips)
      .find(c => c.id === clipId);
    
    if (clip) {
      setClipboardClip({ ...clip });
      console.log('Clip copiado:', clip.id);
    }
  };

  const handlePasteClip = (targetTrackId?: string) => {
    if (!clipboardClip || !editState.timeline) return;

    setEditState(prev => {
      const timeline = prev.timeline!;
      const currentTime = timeline.currentTime;
      
      // Intentar pegar en la pista original o en la primera compatible
      const targetTrack = timeline.tracks.find(t => 
        targetTrackId ? t.id === targetTrackId : t.type === clipboardClip.type
      );

      if (!targetTrack) return prev;

      const newClip: TimelineClip = {
        ...clipboardClip,
        id: `clip-copy-${Date.now()}`,
        trackId: targetTrack.id,
        startTime: currentTime
      };

      const newTracks = timeline.tracks.map(t => 
        t.id === targetTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
      );

      return {
        ...prev,
        timeline: { ...timeline, tracks: newTracks }
      };
    });
  };

  const handleDeleteTrack = (trackId: string) => {
    if (!editState.timeline) return;
    
    setEditState(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline!,
        tracks: prev.timeline!.tracks.filter(t => t.id !== trackId)
      }
    }));
  };

  const handleSnapToStart = (trackId: string) => {
    if (!editState.timeline) return;

    setEditState(prev => {
      const timeline = prev.timeline!;
      const newTracks = timeline.tracks.map(track => {
        if (track.id !== trackId || track.clips.length === 0) return track;

        // 1. Encontrar el clip que empieza antes
        const firstClipStart = Math.min(...track.clips.map(c => c.startTime));
        
        // 2. Calcular cuánto hay que mover (offset negativo)
        const offset = -firstClipStart;

        // 3. Mover todos los clips de esa pista
        const newClips = track.clips.map(clip => ({
          ...clip,
          startTime: Math.max(0, clip.startTime + offset)
        }));

        return { ...track, clips: newClips };
      });

      return {
        ...prev,
        timeline: { ...timeline, tracks: newTracks }
      };
    });
  };

  const handleFileUpload = (files: File[]) => {
    if (!editState.timeline) return;

    console.log('=== FILE UPLOAD ===');
    console.log('Files received:', files.length);
    files.forEach((file, index) => {
      console.log(`File ${index}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    });

    files.forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      
      // Para audio, usar la duración real del archivo si es posible
      const getAudioDuration = (file: File, callback: (duration: number) => void) => {
        const audio = document.createElement('audio');
        audio.src = fileUrl;
        audio.addEventListener('loadedmetadata', () => {
          callback(audio.duration);
        });
        audio.addEventListener('error', () => {
          // Si no se puede obtener la duración, usar un valor por defecto
          callback(5);
        });
      };

      const trackType: TrackType = uploadType === 'image' ? 'video' : uploadType;
      let targetTrack = editState.timeline?.tracks.find(track => track.type === trackType);
      
      if (!targetTrack) {
        handleAddTrack(trackType);
        targetTrack = editState.timeline?.tracks.find(track => track.type === trackType);
      }

      if (targetTrack) {
        let thumbnailUrl = fileUrl;
        let duration = uploadType === 'video' ? 10 : uploadType === 'audio' ? 5 : 3; // Duración por defecto
        
        // Si es audio, intentar obtener la duración real
        if (uploadType === 'audio') {
          getAudioDuration(file, (realDuration) => {
            duration = realDuration;
            console.log(`Real audio duration for ${file.name}: ${realDuration}s`);
            addClipWithThumbnail();
          });
        } else {
          addClipWithThumbnail();
        }
        
        function addClipWithThumbnail() {
          // Calcular el tiempo de inicio (al final del timeline actual)
          const currentDuration = editState.timeline?.duration || 0;
          
          const newClip: Omit<TimelineClip, 'id' | 'trackId'> = {
            type: trackType,
            startTime: currentDuration, // Colocar al final
            duration: duration,
            thumbnailUrl: thumbnailUrl,
            mediaFileId: fileUrl,
            ...(uploadType === 'image' && {
              text: file.name.replace(/\.[^/.]+$/, ""),
              fontSize: 24,
              fontFamily: 'Arial',
              color: '#ffffff',
              backgroundColor: 'transparent'
            })
          };
          
          console.log('Creating clip:', {
            type: trackType,
            fileName: file.name,
            fileSize: file.size,
            duration: duration,
            thumbnailUrl: thumbnailUrl
          });
          
          handleAddClip(targetTrack!.id, newClip);
        }
      }
    });
    setIsUploaderOpen(false);
  };

  const generateVideoThumbnail = (videoUrl: string, callback: (thumbnail: string) => void) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    
    video.onloadeddata = () => {
      video.currentTime = 1;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(thumbnailUrl);
      } else {
        callback(videoUrl);
      }
    };
    
    video.onerror = () => {
      callback(videoUrl);
    };
  };

  const openUploader = (type: 'video' | 'audio' | 'image') => {
    setUploadType(type);
    setIsUploaderOpen(true);
  };

  const handleAddTrack = (type: TrackType) => {
    if (!editState.timeline) return;
    
    const newTrack: TimelineTrack = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${editState.timeline.tracks.filter(t => t.type === type).length + 1}`,
      clips: [],
      isLocked: false
    };
    
    if (type === 'audio') {
      newTrack.isMuted = false;
      newTrack.volume = 1;
    }
    
    setEditState(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline!,
        tracks: [...prev.timeline!.tracks, newTrack]
      }
    }));
  };

  const handleAddClip = (trackId: string, clip: Omit<TimelineClip, 'id' | 'trackId'>) => {
    if (!editState.timeline) return;
    
    const newClip: TimelineClip = {
      ...clip,
      id: `clip-${Date.now()}`,
      trackId
    };
    
    setEditState(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline!,
        tracks: prev.timeline!.tracks.map(track =>
          track.id === trackId
            ? { ...track, clips: [...track.clips, newClip] }
            : track
        )
      }
    }));
  };

  const handleUpdateClip = (clipId: string, updates: Partial<TimelineClip>) => {
    if (!editState.timeline) return;
    
    setEditState(prev => {
      const timeline = prev.timeline!;
      
      // Si hay cambio de pista (trackId)
      if (updates.trackId) {
        let movedClip: TimelineClip | null = null;
        
        // 1. Quitar el clip de su pista actual
        const tracksAfterRemoval = timeline.tracks.map(track => {
          const clip = track.clips.find(c => c.id === clipId);
          if (clip) {
            movedClip = { ...clip, ...updates };
            return { ...track, clips: track.clips.filter(c => c.id !== clipId) };
          }
          return track;
        });

        if (!movedClip) return prev;

        // 2. Añadir el clip a la nueva pista
        const finalTracks = tracksAfterRemoval.map(track => {
          if (track.id === updates.trackId) {
            return { ...track, clips: [...track.clips, movedClip!] };
          }
          return track;
        });

        return {
          ...prev,
          timeline: { ...timeline, tracks: finalTracks }
        };
      }

      // Comportamiento normal (mismo track)
      return {
        ...prev,
        timeline: {
          ...timeline,
          tracks: timeline.tracks.map(track => ({
            ...track,
            clips: track.clips.map(clip =>
              clip.id === clipId ? { ...clip, ...updates } : clip
            )
          }))
        }
      };
    });
  };

  const handleDeleteClip = (clipId: string) => {
    if (!editState.timeline) return;
    
    setEditState(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline!,
        tracks: prev.timeline!.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        }))
      }
    }));
  };

  const filterStyle = useMemo(() => {
    const brightness = 1 + (editState.brightness ?? 0) / 100;
    const contrast = 1 + (editState.contrast ?? 0) / 100;
    const saturation = 1 + (editState.saturation ?? 0) / 100;
    const hue = editState.hue ?? 0;
    const blur = editState.blur ?? 0;

    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) hue-rotate(${hue}deg) blur(${blur}px)`;
  }, [editState.brightness, editState.contrast, editState.saturation, editState.hue, editState.blur]);

  // Efecto para ajustar la duración de la línea de tiempo al clip más largo
  useEffect(() => {
    if (!editState.timeline) return;

    const allClips = editState.timeline.tracks.flatMap(t => t.clips);
    if (allClips.length === 0) return;

    // Calcular el tiempo final más lejano
    const maxEndTime = allClips.reduce((max, clip) => {
      const clipEnd = clip.startTime + clip.duration;
      return clipEnd > max ? clipEnd : max;
    }, 0);

    // Solo actualizar si hay una diferencia significativa (evitar bucles infinitos)
    if (Math.abs(editState.timeline.duration - maxEndTime) > 0.1 && maxEndTime > 0) {
      setEditState(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline!,
          duration: maxEndTime
        }
      }));
    }
  }, [editState.timeline?.tracks]);

  // Efectos para el video principal
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Pausar video por defecto y no silenciar
    video.muted = false;
    video.volume = 1.0;
    video.pause(); // Pausar inmediatamente

    const handleLoadedMetadata = () => {
      const duration = video.duration || 60;
      setVideoDuration(duration);
      
      setEditState(prev => {
        const newTracks = [...(prev.timeline?.tracks || [])];
        
        // 1. Gestionar clip de vídeo
        const videoTrackIndex = newTracks.findIndex(t => t.type === 'video');
        if (videoTrackIndex !== -1 && newTracks[videoTrackIndex].clips.length === 0) {
          const mainVideoClip: TimelineClip = {
            id: `main-video-${Date.now()}`,
            trackId: newTracks[videoTrackIndex].id,
            type: 'video',
            startTime: 0,
            duration: duration,
            thumbnailUrl: videoUrl,
            mediaFileId: videoUrl
          };
          newTracks[videoTrackIndex] = { ...newTracks[videoTrackIndex], clips: [mainVideoClip] };
        }

        // 2. Gestionar clip de audio (Desconectar audio del vídeo a su propia pista)
        const audioTrackIndex = newTracks.findIndex(t => t.type === 'audio');
        if (audioTrackIndex !== -1 && newTracks[audioTrackIndex].clips.length === 0) {
          const mainAudioClip: TimelineClip = {
            id: `main-audio-${Date.now()}`,
            trackId: newTracks[audioTrackIndex].id,
            type: 'audio',
            startTime: 0,
            duration: duration,
            mediaFileId: videoUrl // Usamos la misma fuente pero tratada como audio
          };
          newTracks[audioTrackIndex] = { ...newTracks[audioTrackIndex], clips: [mainAudioClip] };
        }

        return {
          ...prev,
          trimEnd: duration,
          timeline: {
            ...prev.timeline!,
            duration: duration,
            tracks: newTracks
          }
        };
      });
      video.pause();
    };

    // Agregar evento para cuando el video puede reproducirse
    const handleCanPlay = () => {
      console.log('Video can play');
      // Asegurar que el video esté pausado
      video.pause();
      console.log('Video paused on canplay');
    };

    // Agregar evento para detectar errores
    const handleError = (e: Event) => {
      console.error('Video error:', e);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !editState.timeline) return;

    let lastUpdateTime = 0;
    const updateInterval = 100;

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateTime > updateInterval) {
        setEditState(prev => ({
          ...prev,
          timeline: {
            ...prev.timeline!,
            currentTime: video.currentTime
          }
        }));
        lastUpdateTime = now;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !editState.timeline || !video.paused) return;

    if (Math.abs(video.currentTime - editState.timeline.currentTime) > 0.1) {
      video.currentTime = editState.timeline.currentTime;
    }
  }, [editState.timeline?.currentTime]);

  // Get the current video source based on timeline position
  const getCurrentVideoSource = () => {
    if (!editState.timeline) return videoUrl;
    
    const currentTime = editState.timeline.currentTime;
    const activeVideoClips = editState.timeline.tracks
      .flatMap(track => track.clips)
      .filter(clip => 
        clip.type === 'video' && 
        clip.mediaFileId && 
        currentTime >= clip.startTime && 
        currentTime < clip.startTime + clip.duration
      );
    
    // Return the first active video clip's source, or fallback to original
    return activeVideoClips.length > 0 ? activeVideoClips[0].mediaFileId! : videoUrl;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !editState.timeline) return;

    // Buscar la pista de audio principal de forma estable
    const tracks = editState.timeline.tracks || [];
    const audioTrack = tracks.find(track => track.type === 'audio');
    
    video.muted = audioTrack ? (audioTrack.isMuted ?? false) : false;
    video.volume = audioTrack ? (audioTrack.volume ?? 1) : 1;

    // Sincronizar reproducción
    if (isTimelinePlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isTimelinePlaying && !video.paused) {
      video.pause();
    }
  }, [editState.timeline, isTimelinePlaying]);

  // Handle video source changes when timeline position changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const newSource = getCurrentVideoSource();
    if (video.src !== newSource) {
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;
      
      video.src = newSource;
      
      // Restore playback state after source change
      video.onloadeddata = () => {
        video.currentTime = currentTime;
        if (wasPlaying) {
          video.play().catch(() => {});
        }
      };
    }
  }, [editState.timeline?.currentTime]);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      {/* Header con título y botones de acción */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Editor de Video</h1>
          {showSavedMessage && (
            <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-1 rounded-md border border-green-700/50">
              <Check className="w-4 h-4" />
              <span className="text-sm">Cambios guardados correctamente</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-lg"
          >
            Cerrar Editor
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleLoadProject}
            className="border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-lg"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Cargar Proyecto
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleExportVideo}
            className="border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Video Editado
          </Button>
          <Button 
            variant="ghost"
            onClick={handleSave}
            className="border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-lg"
          >
            Guardar Proyecto
          </Button>
        </div>
        
        {/* Input oculto para cargar proyectos */}
        <input
          ref={setProjectInputRef}
          type="file"
          accept=".nexus"
          onChange={handleProjectFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Contenedor principal - Layout flexible */}
      <div className="flex-1 flex">
        {/* Panel izquierdo - Controles de edición */}
        <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Controles de Edición
            </h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <Tabs defaultValue="trim" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-2 mt-4 bg-transparent">
                <TabsTrigger 
                  value="trim" 
                  className="flex items-center gap-1 py-2 px-3 border-emerald-500/50 border bg-gradient-to-b from-white/[0.05] to-transparent text-white data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-500/40 data-[state=active]:to-emerald-900/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 transition-all"
                >
                  <Scissors className="w-3 h-3" />
                  Recortar
                </TabsTrigger>
                <TabsTrigger 
                  value="effects" 
                  className="flex items-center gap-1 py-2 px-3 border-emerald-500/50 border bg-gradient-to-b from-white/[0.05] to-transparent text-white data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-500/40 data-[state=active]:to-emerald-900/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 transition-all"
                >
                  <Volume2 className="w-3 h-3" />
                  Efectos
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="flex items-center gap-1 py-2 px-3 border-emerald-500/50 border bg-gradient-to-b from-white/[0.05] to-transparent text-white data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-500/40 data-[state=active]:to-emerald-900/20 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 transition-all"
                >
                  <Type className="w-3 h-3" />
                  Texto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trim" className="space-y-6 mt-16">
                {/* Información del video */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Duración total:</span>
                      <span className="text-emerald-400 font-mono">
                        {formatTime(videoDuration)}
                      </span>
                    </div>
                    {editState.trimStart !== undefined && editState.trimEnd !== undefined && (
                      <div className="flex justify-between items-center mt-1">
                        <span>Duración recortada:</span>
                        <span className="text-blue-400 font-mono">
                          {formatTime(editState.trimEnd - editState.trimStart)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-emerald-400 block mb-2">
                    Inicio - {formatTime(editState.trimStart || 0)}
                  </label>
                  <Slider
                    value={[editState.trimStart || 0]}
                    max={videoDuration || 100}
                    step={0.1}
                    onValueChange={handleTrimStartChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-emerald-300 mt-1">
                    <span>0:00</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-emerald-400 block mb-2">
                    Fin - {formatTime(editState.trimEnd || videoDuration)}
                  </label>
                  <Slider
                    value={[editState.trimEnd || videoDuration]}
                    max={videoDuration || 100}
                    step={0.1}
                    onValueChange={handleTrimEndChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-emerald-300 mt-1">
                    <span>0:00</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                </div>

                {/* Botones de acceso rápido */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditState(prev => ({
                        ...prev,
                        trimStart: 0,
                        trimEnd: videoDuration
                      }));
                    }}
                    className="text-xs border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-md"
                  >
                    Restablecer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Recortar últimos 10 segundos
                      const newEnd = Math.max(0, videoDuration - 10);
                      setEditState(prev => ({
                        ...prev,
                        trimEnd: newEnd
                      }));
                    }}
                    className="text-xs border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-md"
                    disabled={videoDuration <= 10}
                  >
                    -10s final
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="effects" className="space-y-6 mt-16">
                <div>
                  <label className="text-sm font-medium flex justify-between text-emerald-400 mb-2">
                    Brillo
                    <span className="text-xs text-emerald-300">{editState.brightness} %</span>
                  </label>
                  <Slider
                    value={[editState.brightness ?? 0]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={handleEffectChange('brightness')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex justify-between text-emerald-400 mb-2">
                    Contraste
                    <span className="text-xs text-emerald-300">{editState.contrast} %</span>
                  </label>
                  <Slider
                    value={[editState.contrast ?? 0]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={handleEffectChange('contrast')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex justify-between text-emerald-400 mb-2">
                    Saturación
                    <span className="text-xs text-emerald-300">{editState.saturation} %</span>
                  </label>
                  <Slider
                    value={[editState.saturation ?? 0]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={handleEffectChange('saturation')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex justify-between text-emerald-400 mb-2">
                    Matiz
                    <span className="text-xs text-emerald-300">{editState.hue}°</span>
                  </label>
                  <Slider
                    value={[editState.hue ?? 0]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={handleEffectChange('hue')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex justify-between text-emerald-400 mb-2">
                    Desenfoque
                    <span className="text-xs text-emerald-300">{editState.blur} px</span>
                  </label>
                  <Slider
                    value={[editState.blur ?? 0]}
                    min={0}
                    max={20}
                    step={0.5}
                    onValueChange={handleEffectChange('blur')}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-16">
                <VideoTextEditor
                  textClips={editState.textClips || []}
                  onAddTextClip={handleAddTextClip}
                  onUpdateTextClip={handleUpdateTextClip}
                  onDeleteTextClip={handleDeleteTextClip}
                  currentTime={editState.timeline?.currentTime || 0}
                  videoDuration={editState.timeline?.duration || 60}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Panel central - Reproductor de video */}
        <div className="flex-1 bg-black flex flex-col">
          <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-white font-semibold">Reproductor Principal</h2>
            
            {/* Controles de Zoom del Reproductor */}
            <div className="flex items-center space-x-3 bg-gray-900/80 p-1.5 rounded-xl border border-white/10 shadow-lg">
              <Button size="sm" variant="ghost" onClick={() => handlePlayerZoom(-10)} className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Reducir vista">
                <ZoomOut className="w-5 h-5" />
              </Button>
              <button 
                onClick={resetPlayerZoom}
                className="text-[11px] font-black text-emerald-500 hover:text-emerald-400 min-w-[45px] transition-colors"
                title="Restablecer vista (100%)"
              >
                {playerZoom}%
              </button>
              <Button size="sm" variant="ghost" onClick={() => handlePlayerZoom(10)} className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Ampliar vista">
                <ZoomIn className="w-5 h-5" />
              </Button>
              <div className="w-px h-5 bg-gray-700 mx-1" />
              <Button size="sm" variant="ghost" onClick={() => setPlayerZoom(200)} className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" title="Zoom 200%">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
            <div 
              className="w-full max-w-4xl relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${playerZoom / 100})` }}
            >
              <video
                ref={videoRef}
                src={getCurrentVideoSource()}
                className="w-full h-full object-contain bg-black rounded-lg shadow-2xl"
                style={{ filter: filterStyle, maxHeight: '600px' }}
              />
              <TextOverlay
                textClips={editState.textClips || []}
                currentTime={editState.timeline?.currentTime || 0}
              />
            </div>
          </div>
        </div>

        {/* Panel derecho - Controles de medios */}
        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Archivos
            </h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              <Button
                onClick={() => openUploader('video')}
                variant="ghost"
                className="w-full flex items-center space-x-2 border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-md"
              >
                <FileVideo className="w-4 h-4" />
                <span>Añadir Vídeo</span>
              </Button>
              
              <Button
                onClick={() => openUploader('audio')}
                variant="ghost"
                className="w-full flex items-center space-x-2 border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-md"
              >
                <FileAudio className="w-4 h-4" />
                <span>Añadir Audio</span>
              </Button>
              
              <Button
                onClick={() => openUploader('image')}
                variant="ghost"
                className="w-full flex items-center space-x-2 border-emerald-500/80 border bg-gradient-to-b from-white/[0.08] to-transparent text-white hover:bg-white/[0.15] transition-all shadow-md"
              >
                <FileImage className="w-4 h-4" />
                <span>Añadir Imagen</span>
              </Button>
            </div>

            {/* Timeline preview compacto */}
            {editState.timeline && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Preview Timeline</h4>
                <div className="bg-black rounded-lg overflow-hidden" style={{ height: '120px' }}>
                  <TimelinePreview 
                    timeline={editState.timeline}
                    isPlaying={isTimelinePlaying}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor inferior - Timeline con redimensionamiento */}
      <div 
        className="bg-gray-900 border-t border-gray-800 flex flex-col overflow-visible z-20 relative"
        style={{ height: `${timelineHeight}px` }}
      >
        {/* Manija para redimensionar (Resizer) mejorada */}
        <div 
          className="absolute -top-2 left-0 right-0 h-4 cursor-row-resize z-[100] group"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingTimeline(true);
          }}
        >
          {/* Línea visual de indicador */}
          <div className={`w-full h-[2px] transition-colors duration-200 mt-2 ${isResizingTimeline ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-transparent group-hover:bg-emerald-500/50'}`} />
        </div>

        <div className="flex-1 relative"> 
          {editState.timeline && (
            <div className="absolute inset-0">
              <Timeline
                timeline={editState.timeline}
                onTimelineChange={handleTimelineChange}
                onAddTrack={handleAddTrack}
                onAddClip={handleAddClip}
                onUpdateClip={handleUpdateClip}
                onDeleteClip={handleDeleteClip}
                onDeleteTrack={handleDeleteTrack}
                onSnapToStart={handleSnapToStart}
                onSplitClip={handleSplitClip}
                onCopyClip={handleCopyClip}
                onPasteClip={handlePasteClip}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={history.length > 0}
                canRedo={future.length > 0}
                onSeek={(time) => {
                  if (videoRef.current) videoRef.current.currentTime = time;
                }}
                onPlayPause={handleTimelinePlayPause}
              />
            </div>
          )}
        </div>
      </div>
          
          {/* TimelinePlayer para manejar la reproducción */}
          {editState.timeline && (
            <TimelinePlayer
              timeline={editState.timeline}
              currentTime={editState.timeline.currentTime}
              isPlaying={isTimelinePlaying}
              onTimeUpdate={(time) => {
                setEditState(prev => ({
                  ...prev,
                  timeline: prev.timeline ? {
                    ...prev.timeline,
                    currentTime: time
                  } : undefined
                }));
              }}
            />
          )}

      {/* Modal para subir archivos */}
      {isUploaderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Añadir {uploadType === 'video' ? 'Vídeo' : uploadType === 'audio' ? 'Audio' : 'Imagen'}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setIsUploaderOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <FileUploader
              onFilesSelected={handleFileUpload}
              accept={uploadType === 'video' ? 'video/*' : uploadType === 'audio' ? 'audio/*' : 'image/*'}
              multiple={true}
              maxSize={200}
            />
          </div>
        </div>
      )}

      {/* Diálogo de configuración de exportación */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Save className="w-5 h-5" />
                Configurar Exportación
              </h3>
              <button
                onClick={() => setShowExportDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nombre del archivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del archivo
              </label>
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="video_editado"
              />
            </div>

            {/* Formato del archivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formato del archivo
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="webm">WebM (recomendado para web)</option>
                <option value="mp4">MP4 (compatible con todos los dispositivos)</option>
              </select>
            </div>

            {/* Calidad del video */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Calidad del video
              </label>
              <select
                value={exportQuality}
                onChange={(e) => setExportQuality(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="high">Alta (1080p, 30 FPS)</option>
                <option value="medium">Media (720p, 30 FPS)</option>
                <option value="low">Baja (480p, 25 FPS)</option>
              </select>
            </div>

            {/* Información del archivo */}
            <div className="mb-6 p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400 space-y-1">
                <p>• El archivo se guardará como: <span className="text-white font-mono">{exportFileName}.{exportFormat}</span></p>
                <p>• Se creará una copia con todas las ediciones aplicadas</p>
                <p>• El video original no será modificado</p>
                <p>• El archivo se descargará en tu carpeta de Descargas</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={startExportProcess}
                className="flex-1"
                disabled={!exportFileName.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                Iniciar Exportación
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de progreso de exportación */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <Film className="w-8 h-8 text-blue-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              Exportando Video
            </h3>
            
            <p className="text-gray-300 text-center mb-6">
              {exportStatus}
            </p>
            
            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progreso</span>
                <span className="text-sm text-gray-400">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="text-center text-sm text-gray-400">
              <p>El video se está procesando frame por frame</p>
              <p>Esto puede tardar varios minutos...</p>
            </div>
            
            {/* Botón para cancelar (opcional) */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsExporting(false)}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Cancelar exportación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
