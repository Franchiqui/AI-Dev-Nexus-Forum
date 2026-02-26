import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AudioEditState } from '@/types';

type AudioEditorProps = {
  audioUrl: string;
  onSave: (editState: AudioEditState) => void;
  onCancel: () => void;
};

type ExtendedAudioEditState = AudioEditState & {
  playbackRate: number;
  trimStart: number;
  trimEnd: number;
};

export default function AudioEditor({ audioUrl, onSave, onCancel }: AudioEditorProps) {
  const [editState, setEditState] = useState < ExtendedAudioEditState > ({
    volume: 0,
    fadeInDuration: 0,
    fadeOutDuration: 0,
    playbackRate: 1,
    trimStart: 0,
    trimEnd: 0,
  });
  const audioRef = useRef < HTMLAudioElement > (null);
  const [duration, setDuration] = useState(0);

  const targetVolume = Math.min(1, Math.max(0, Math.pow(10, (editState.volume || 0) / 20)));

  const handleVolumeChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, volume: value[0] }));
  };

  const handlePause = () => { };

  const handleFadeInChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, fadeInDuration: value[0] }));
  };

  const handleFadeOutChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, fadeOutDuration: value[0] }));
  };

  const handlePlaybackRateChange = (value: number[]) => {
    setEditState(prev => ({ ...prev, playbackRate: value[0] }));
  };

  const handleTrimStartChange = (value: number[]) => {
    const maxDur = duration || 600;
    const newStart = Math.min(Math.max(0, value[0]), maxDur);
    setEditState(prev => ({ ...prev, trimStart: newStart, trimEnd: Math.max(prev.trimEnd, newStart) }));
  };

  const handleTrimEndChange = (value: number[]) => {
    const maxDur = duration || 600;
    const newEnd = Math.min(Math.max(0, value[0]), maxDur);
    setEditState(prev => ({ ...prev, trimEnd: Math.max(newEnd, prev.trimStart) }));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = targetVolume;
      const rate = Math.max(0.25, editState.playbackRate || 1);
      audioRef.current.playbackRate = rate;
    }
  }, [targetVolume, editState.playbackRate]);

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const getClipTimes = () => {
    const clipStart = Math.max(0, editState.trimStart || 0);
    const clipEnd = editState.trimEnd && editState.trimEnd > clipStart
      ? editState.trimEnd
      : (duration || 0);
    return { clipStart, clipEnd };
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const { clipStart } = getClipTimes();
    audio.currentTime = clipStart;

    if (editState.fadeInDuration > 0) {
      const start = performance.now();
      const fadeIn = () => {
        const elapsed = (performance.now() - start) / 1000;
        const factor = Math.min(1, elapsed / editState.fadeInDuration);
        audio.volume = targetVolume * factor;
        if (factor < 1 && !audio.paused) requestAnimationFrame(fadeIn);
      };
      audio.volume = 0;
      requestAnimationFrame(fadeIn);
    } else {
      audio.volume = targetVolume;
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    const { clipStart, clipEnd } = getClipTimes();
    const endTime = clipEnd > clipStart ? clipEnd : duration;
    if (editState.fadeOutDuration > 0) {
      const remaining = endTime - audio.currentTime;
      if (remaining <= editState.fadeOutDuration) {
        const factor = Math.max(0, remaining / editState.fadeOutDuration);
        audio.volume = targetVolume * factor;
      }
    }
    if (endTime > 0 && audio.currentTime >= endTime) {
      audio.pause();
      audio.currentTime = endTime;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="w-full"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-purple-400 font-semibold">
          Inicio: <span className="text-purple-200">{formatTime(editState.trimStart)}</span>
        </Label>
        <Slider
          min={0}
          max={Math.max(duration || 0, editState.trimEnd || 0, 60)}
          step={0.1}
          value={[editState.trimStart]}
          onValueChange={handleTrimStartChange}
        />
        <Label className="text-purple-400 font-semibold">
          Fin: <span className="text-purple-200">{formatTime(editState.trimEnd)}</span>
        </Label>
        <Slider
          min={0}
          max={Math.max(duration || 0, editState.trimEnd || 0, 60)}
          step={0.1}
          value={[editState.trimEnd]}
          onValueChange={handleTrimEndChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speed" className="text-purple-400 font-semibold">
          Velocidad: <span className="text-purple-200">{editState.playbackRate.toFixed(2)}x</span>
        </Label>
        <Slider
          id="speed"
          min={0.25}
          max={2}
          step={0.05}
          value={[editState.playbackRate]}
          onValueChange={handlePlaybackRateChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="volume" className="text-purple-400 font-semibold">
          Volumen: <span className="text-purple-200">{editState.volume}dB</span>
        </Label>
        <Slider
          id="volume"
          min={-50}
          max={50}
          step={1}
          value={[editState.volume]}
          onValueChange={handleVolumeChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fadeIn" className="text-purple-400 font-semibold">
          Fade In: <span className="text-purple-200">{editState.fadeInDuration}s</span>
        </Label>
        <Slider
          id="fadeIn"
          min={0}
          max={10}
          step={0.5}
          value={[editState.fadeInDuration]}
          onValueChange={handleFadeInChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fadeOut" className="text-purple-400 font-semibold">
          Fade Out: <span className="text-purple-200">{editState.fadeOutDuration}s</span>
        </Label>
        <Slider
          id="fadeOut"
          min={0}
          max={10}
          step={0.5}
          value={[editState.fadeOutDuration]}
          onValueChange={handleFadeOutChange}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(editState)}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}