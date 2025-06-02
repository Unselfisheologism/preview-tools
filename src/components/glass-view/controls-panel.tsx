
import type React from 'react';
import FileUpload from './file-upload';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Image as ImageIcon, Video, Move, Scale as ScaleIcon, RotateCw, Blend, CornerRightUp, Chrome, Compass } from 'lucide-react';

interface ControlsPanelProps {
  onBackgroundChange: (file: File | null) => void;
  onOverlayChange: (file: File | null) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  scale: number;
  onScaleChange: (value: number) => void;
  rotation: number;
  onRotationChange: (value: number) => void;
  positionX: number;
  onPositionXChange: (value: number) => void;
  positionY: number;
  onPositionYChange: (value: number) => void;
  roundedCorners: boolean;
  onRoundedCornersChange: (value: boolean) => void;
  browserBar: 'none' | 'chrome' | 'safari';
  onBrowserBarChange: (value: 'none' | 'chrome' | 'safari') => void;
  browserUrl: string;
  onBrowserUrlChange: (value: string) => void;
  onExportImage: () => void;
  onExportVideo: () => void;
  isExporting: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onBackgroundChange,
  onOverlayChange,
  opacity,
  onOpacityChange,
  scale,
  onScaleChange,
  rotation,
  onRotationChange,
  positionX,
  onPositionXChange,
  positionY,
  onPositionYChange,
  roundedCorners,
  onRoundedCornersChange,
  browserBar,
  onBrowserBarChange,
  browserUrl,
  onBrowserUrlChange,
  onExportImage,
  onExportVideo,
  isExporting,
}) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Media Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            id="background-upload"
            label="Background (Image/Video)"
            accept="image/*,video/*"
            onFileChange={onBackgroundChange}
          />
          <FileUpload
            id="overlay-upload"
            label="Overlay UI (Image/Video)"
            accept="image/*,video/*"
            onFileChange={onOverlayChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Blend className="w-5 h-5 text-primary" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position-x" className="text-sm">Position X: {positionX}px</Label>
              <Input
                id="position-x"
                type="number"
                value={positionX}
                onChange={(e) => onPositionXChange(parseInt(e.target.value, 10) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position-y" className="text-sm">Position Y: {positionY}px</Label>
              <Input
                id="position-y"
                type="number"
                value={positionY}
                onChange={(e) => onPositionYChange(parseInt(e.target.value, 10) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CornerRightUp className="w-5 h-5 text-primary" />
            Appearance & Export
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
          <Button onClick={onExportImage} className="w-full" disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export as Image'}
            <ImageIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={onExportVideo} variant="outline" className="w-full" disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export as Video'}
            <Video className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlsPanel;

    