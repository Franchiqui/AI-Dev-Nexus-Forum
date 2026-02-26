import { useEffect, useRef, useState } from 'react';
import { TimelineState, TimelineClip } from '@/types';

interface TimelinePlayerProps {
  timeline: TimelineState;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
}

export default function TimelinePlayer({ timeline, currentTime, isPlaying, onTimeUpdate }: TimelinePlayerProps) {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Obtener todos los clips que deberían estar reproduciéndose en el tiempo actual
  const getActiveClips = (time: number): TimelineClip[] => {
    return timeline.tracks.flatMap(track => 
      track.clips.filter(clip => 
        time >= clip.startTime && time < clip.startTime + clip.duration
      )
    );
  };

  // Sincronizar todos los elementos multimedia
  const syncMedia = (time: number) => {
    const activeClips = getActiveClips(time);
    const activeAudioClips = activeClips.filter(clip => clip.type === 'audio');

    console.log('=== SYNC MEDIA ===');
    console.log('Time:', time.toFixed(3));
    console.log('Active clips:', activeClips.length);
    console.log('Audio clips:', activeAudioClips.length);
    console.log('Is playing:', isPlaying);

    // Pausar todos los elementos primero
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    
    // Pausar todos los audios
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Reproducir solo los clips activos
    activeClips.forEach(clip => {
      const clipLocalTime = time - clip.startTime;
      
      if (clip.type === 'video' && clip.mediaFileId && videoRefs.current[clip.id]) {
        const video = videoRefs.current[clip.id];
        video.currentTime = clipLocalTime;
        // Silenciar video si hay clips de audio activos
        video.muted = activeAudioClips.length > 0;
        if (isPlaying) {
          video.play().catch(e => console.log('Video play failed:', e));
        }
      } else if (clip.type === 'audio' && clip.mediaFileId && audioRefs.current[clip.id]) {
        const audio = audioRefs.current[clip.id];
        
        // Verificar si el track está muteado y el estado de reproducción
        const track = timeline.tracks.find(t => t.clips.some(c => c.id === clip.id));
        const isTrackMuted = track?.isMuted || false;
        const trackVolume = track?.volume || 1.0;
        
        // Configurar volumen del clip
        audio.volume = isTrackMuted ? 0 : trackVolume * 0.3; // Reducir volumen a 30% para evitar distorsión
        
        const shouldPlay = !isTrackMuted && isPlaying;
        console.log('Audio clip details:', {
          clipId: clip.id,
          shouldPlay,
          trackMuted: isTrackMuted,
          trackVolume,
          finalVolume: audio.volume,
          currentTime: audio.currentTime.toFixed(3),
          targetTime: clipLocalTime.toFixed(3),
          readyState: audio.readyState,
          paused: audio.paused,
          src: audio.src
        });
        
        if (shouldPlay) {
          // Establecer currentTime solo una vez al inicio
          if (audio.currentTime === 0) {
            console.log('Setting audio currentTime to:', clipLocalTime.toFixed(3));
            audio.currentTime = clipLocalTime;
          }
          
          // Intentar reproducir solo si no está reproduciendo
          if (audio.readyState >= 1 && audio.paused) { 
            console.log('Attempting to play audio...');
            audio.play().then(() => {
              console.log('Audio play SUCCESS');
            }).catch(e => {
              console.log('Audio play FAILED:', e);
            });
          } else if (audio.readyState >= 1 && !audio.paused) {
            console.log('Audio already playing');
          } else {
            console.log('Audio not ready, readyState:', audio.readyState);
          }
        }
      }
    });
  };

  // Crear elementos multimedia para cada clip
  useEffect(() => {
    const allClips = timeline.tracks.flatMap(track => track.clips);
    console.log('Creating media elements for clips:', allClips.length);
    
    allClips.forEach(clip => {
      if (clip.mediaFileId) {
        if (clip.type === 'video' && !videoRefs.current[clip.id]) {
          const video = document.createElement('video');
          video.src = clip.mediaFileId;
          video.muted = true; // Silenciar videos para evitar eco
          video.preload = 'auto';
          videoRefs.current[clip.id] = video;
          console.log('Created video element for clip:', clip.id);
        } else if (clip.type === 'audio' && !audioRefs.current[clip.id]) {
          const audio = document.createElement('audio');
          audio.src = clip.mediaFileId;
          audio.crossOrigin = 'anonymous'; // Permitir CORS
          audio.preload = 'auto'; // Cargar completamente el audio
          // Configurar volumen inicial
          audio.volume = 0.8; // Volumen moderado para evitar distorsión
          audioRefs.current[clip.id] = audio;
          console.log('Created audio element for clip:', clip.id);
          
          // Agregar evento para detectar cuando el audio está listo
          audio.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded for clip:', clip.id, 'duration:', audio.duration);
          });
          
          // Agregar evento para detectar cuando puede reproducirse
          audio.addEventListener('canplay', () => {
            console.log('Audio can play for clip:', clip.id);
          });
          
          // Agregar evento para detectar cuando se carga completamente
          audio.addEventListener('canplaythrough', () => {
            console.log('Audio can playthrough for clip:', clip.id, 'duration:', audio.duration);
          });
          
          // Agregar evento para detectar errores
          audio.addEventListener('error', (e) => {
            console.error('Audio clip error:', clip.id, e);
            console.error('Audio error details:', audio.error);
            console.error('Audio src:', clip.mediaFileId);
          });
        }
      }
    });

    return () => {
      // Limpiar elementos que ya no se necesitan
      Object.values(videoRefs.current).forEach(video => {
        if (video) video.pause();
      });
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) audio.pause();
      });
    };
  }, [timeline.tracks]);

  // Manejar la reproducción
  useEffect(() => {
    if (isPlaying) {
      const animate = (timestamp: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = timestamp;
        }

        const deltaTime = (timestamp - lastTimeRef.current) / 1000;
        const newTime = Math.min(currentTime + deltaTime, timeline.duration);
        
        // Limitar el deltaTime para evitar sincronización demasiado rápida
        const limitedDeltaTime = Math.min(deltaTime, 0.1); // Máximo 100ms por frame
        
        onTimeUpdate(newTime);
        syncMedia(newTime);

        if (newTime < timeline.duration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Detener reproducción al final
          onTimeUpdate(0);
          syncMedia(0);
        }
        
        lastTimeRef.current = timestamp;
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      syncMedia(currentTime);
      lastTimeRef.current = 0;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, timeline.duration]);

  // Sincronizar cuando cambia el tiempo manualmente
  useEffect(() => {
    if (!isPlaying) {
      syncMedia(currentTime);
    }
  }, [currentTime, isPlaying]);

  // Este componente no renderiza nada visible, solo maneja la reproducción
  return null;
}
