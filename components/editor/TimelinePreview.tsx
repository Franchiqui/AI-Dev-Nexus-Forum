import { useEffect, useRef } from 'react';
import { TimelineState, TimelineClip } from '@/types';

interface TimelinePreviewProps {
  timeline: TimelineState;
  isPlaying: boolean;
}

export default function TimelinePreview({ timeline, isPlaying }: TimelinePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const imageRefs = useRef<{ [key: string]: HTMLImageElement }>({});

  // Obtener todos los clips que deberían estar visibles en el tiempo actual
  const getActiveClips = (time: number): TimelineClip[] => {
    return timeline.tracks
      .filter(track => track.type === 'video' || track.type === 'text') // Solo video y texto para preview
      .flatMap(track => 
        track.clips.filter(clip => 
          time >= clip.startTime && time < clip.startTime + clip.duration
        )
      )
      .sort((a, b) => {
        // Ordenar por tipo: video primero, luego texto
        if (a.type === 'video' && b.type === 'text') return -1;
        if (a.type === 'text' && b.type === 'video') return 1;
        return 0;
      });
  };

  // Dibujar frame actual
  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const activeClips = getActiveClips(timeline.currentTime);

    activeClips.forEach(clip => {
      const clipLocalTime = timeline.currentTime - clip.startTime;

      if (clip.type === 'video' && clip.mediaFileId) {
        const video = videoRefs.current[clip.id];
        if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA
          video.currentTime = clipLocalTime;
          
          // Dibujar video centrado
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (videoAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }
          
          ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
        }
      } else if (clip.type === 'text' && clip.text) {
        // Dibujar texto
        ctx.fillStyle = clip.color || '#ffffff';
        ctx.font = `${clip.fontSize || 24}px ${clip.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Agregar fondo si está especificado
        if (clip.backgroundColor) {
          const textMetrics = ctx.measureText(clip.text);
          const padding = 10;
          ctx.fillStyle = clip.backgroundColor;
          ctx.fillRect(
            (canvas.width - textMetrics.width) / 2 - padding,
            (canvas.height - (clip.fontSize || 24)) / 2 - padding,
            textMetrics.width + padding * 2,
            (clip.fontSize || 24) + padding * 2
          );
          ctx.fillStyle = clip.color || '#ffffff';
        }
        
        ctx.fillText(clip.text, canvas.width / 2, canvas.height / 2);
      } else if (clip.type === 'video' && clip.thumbnailUrl) {
        // Mostrar thumbnail si el video no está cargado
        const img = imageRefs.current[clip.id];
        if (img && img.complete) {
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }
          
          ctx.globalAlpha = 0.7; // Semi-transparente para indicar que es thumbnail
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.globalAlpha = 1.0;
        }
      }
    });
  };

  // Preparar elementos multimedia
  useEffect(() => {
    const allClips = timeline.tracks.flatMap(track => track.clips);
    
    allClips.forEach(clip => {
      if (clip.mediaFileId && clip.type === 'video' && !videoRefs.current[clip.id]) {
        const video = document.createElement('video');
        video.src = clip.mediaFileId;
        video.muted = true;
        video.preload = 'auto';
        videoRefs.current[clip.id] = video;
      }
      
      if (clip.thumbnailUrl && clip.type === 'video' && !imageRefs.current[clip.id]) {
        const img = document.createElement('img');
        img.src = clip.thumbnailUrl;
        imageRefs.current[clip.id] = img;
      }
    });

    return () => {
      // Limpiar recursos
      Object.values(videoRefs.current).forEach(video => {
        if (video) video.pause();
      });
    };
  }, [timeline.tracks]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      drawFrame();
      if (isPlaying) {
        animationId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animate();
    } else {
      drawFrame(); // Dibujar frame estático si no está reproduciendo
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, timeline.currentTime]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={180}
      className="w-full h-full object-contain"
    />
  );
}
