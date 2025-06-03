
'use client';

import type React from 'react';
import FileUpload from './file-upload';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Move, CornerRightUp, Chrome, Compass, Filter } from 'lucide-react';

interface OverlayControlsProps {
  onOverlayChange: (file: File | null) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  scale: number;
  onScaleChange: (value: number) => void;
  rotation: number;
  onRotationChange: (value: number) => void;
  blurIntensity: number;
  onBlurIntensityChange: (value: number) => void;
  roundedCorners: boolean;
  onRoundedCornersChange: (value: boolean) => void;
  browserBar: 'none' | 'chrome' | 'safari';
  onBrowserBarChange: (value: 'none' | 'chrome' | 'safari') => void;
  browserUrl: string;
  onBrowserUrlChange: (value: string) => void;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  onOverlayChange,
  opacity,
  onOpacityChange,
  scale,
  onScaleChange,
  rotation,
  onRotationChange,
  blurIntensity,
  onBlurIntensityChange,
  roundedCorners,
  onRoundedCornersChange,
  browserBar,
  onBrowserBarChange,
  browserUrl,
  onBrowserUrlChange,
}) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Overlay UI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            id="overlay-upload"
            label="Upload Overlay Image"
            accept="image/*"
            onFileChange={onOverlayChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="w-5 h-5 text-primary" />
            Overlay Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="opacity-slider" className="text-sm">Opacity: {Math.round(opacity * 100)}%</Label>
            <Slider
              id="opacity-slider"
              min={0}
              max={1}
              step={0.01}
              value={[opacity]}
              onValueChange={(value) => onOpacityChange(value[0])}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="scale-slider" className="text-sm">Scale: {Math.round(scale * 100)}%</Label>
            <Slider
              id="scale-slider"
              min={0.1}
              max={3}
              step={0.01}
              value={[scale]}
              onValueChange={(value) => onScaleChange(value[0])}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="rotation-slider" className="text-sm">Rotation: {rotation}°</Label>
            <Slider
              id="rotation-slider"
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={(value) => onRotationChange(value[0])}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="blur-slider" className="text-sm flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Blur: {blurIntensity}px
            </Label>
            <Slider
              id="blur-slider"
              min={0}
              max={20}
              step={1}
              value={[blurIntensity]}
              onValueChange={(value) => onBlurIntensityChange(value[0])}
              className="mt-1"
            />
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Change Position by Dragging the Overlay.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CornerRightUp className="w-5 h-5 text-primary" />
            Overlay Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="rounded-corners-switch" className="text-sm">
              Rounded Corners
            </Label>
            <Switch
              id="rounded-corners-switch"
              checked={roundedCorners}
              onCheckedChange={onRoundedCornersChange}
            />
          </div>
          <div>
            <Label className="text-sm">Browser Bar</Label>
            <RadioGroup
              value={browserBar}
              onValueChange={(value: 'none' | 'chrome' | 'safari') => onBrowserBarChange(value)}
              className="mt-1 flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="none" id="rb-none" />
                <Label htmlFor="rb-none" className="text-xs font-normal">None</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="chrome" id="rb-chrome" />
                <Label htmlFor="rb-chrome" className="text-xs font-normal flex items-center"><Chrome className="w-3 h-3 mr-1"/>Chrome</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="safari" id="rb-safari" />
                <Label htmlFor="rb-safari" className="text-xs font-normal flex items-center"><Compass className="w-3 h-3 mr-1"/>Safari</Label>
              </div>
            </RadioGroup>
          </div>
          {browserBar !== 'none' && (
            <div>
              <Label htmlFor="browser-url" className="text-sm">Browser URL</Label>
              <Input
                id="browser-url"
                type="text"
                value={browserUrl}
                onChange={(e) => onBrowserUrlChange(e.target.value)}
                placeholder="example.com"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverlayControls;
