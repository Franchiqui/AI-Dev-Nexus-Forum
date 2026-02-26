import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ImageEditState } from '@/types';

type ImageEditorProps = {
  imageUrl: string;
  onSave: (editState: ImageEditState) => void;
  onCancel: () => void;
};

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [editState, setEditState] = useState<ImageEditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
  });

  const handleSliderChange = (key: keyof ImageEditState, value: number[]) => {
    setEditState(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const handleSave = () => {
    onSave(editState);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="border rounded-lg p-2 bg-gray-50">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="max-h-64 mx-auto"
              style={{
                filter: `brightness(${100 + editState.brightness}%) contrast(${100 + editState.contrast}%) saturate(${100 + editState.saturation}%) hue-rotate(${editState.hue}deg) blur(${editState.blur}px)`
              }}
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="brightness">Brillo: {editState.brightness}</Label>
            <Slider
              id="brightness"
              min={-100}
              max={100}
              step={1}
              value={[editState.brightness]}
              onValueChange={(value) => handleSliderChange('brightness', value)}
            />
          </div>
          <div>
            <Label htmlFor="contrast">Contraste: {editState.contrast}</Label>
            <Slider
              id="contrast"
              min={-100}
              max={100}
              step={1}
              value={[editState.contrast]}
              onValueChange={(value) => handleSliderChange('contrast', value)}
            />
          </div>
          <div>
            <Label htmlFor="saturation">Saturación: {editState.saturation}</Label>
            <Slider
              id="saturation"
              min={-100}
              max={100}
              step={1}
              value={[editState.saturation]}
              onValueChange={(value) => handleSliderChange('saturation', value)}
            />
          </div>
          <div>
            <Label htmlFor="hue">Tono: {editState.hue}</Label>
            <Slider
              id="hue"
              min={-180}
              max={180}
              step={1}
              value={[editState.hue]}
              onValueChange={(value) => handleSliderChange('hue', value)}
            />
          </div>
          <div>
            <Label htmlFor="blur">Desenfoque: {editState.blur}</Label>
            <Slider
              id="blur"
              min={0}
              max={100}
              step={1}
              value={[editState.blur]}
              onValueChange={(value) => handleSliderChange('blur', value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
