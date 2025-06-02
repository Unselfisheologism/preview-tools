
'use client';

import type React from 'react';
import FileUpload from './file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUp, Wand2, SlidersHorizontal, Palette, CheckSquare } from 'lucide-react';

interface DefaultBackgroundInfo {
  name: string;
  url: string;
  hint: string;
}

interface BackgroundExportControlsProps {
  onBackgroundChange: (file: File | null) => void;
  defaultBackgrounds: DefaultBackgroundInfo[];
  onSetDefaultBackground: (defaultBg: DefaultBackgroundInfo) => void;

  backgroundMode: 'default' | 'custom' | 'solid' | 'transparent';
  onBackgroundModeChange: (mode: 'default' | 'custom' | 'solid' | 'transparent') => void;
  solidBackgroundColor: string;
  onSolidBackgroundColorChange: (color: string) => void;

  backgroundEffectBlur: number;
  onBackgroundEffectBlurChange: (value: number) => void;
  backgroundEffectBrightness: number;
  onBackgroundEffectBrightnessChange: (value: number) => void;
  backgroundEffectContrast: number;
  onBackgroundEffectContrastChange: (value: number) => void;
  backgroundEffectSaturation: number;
  onBackgroundEffectSaturationChange: (value: number) => void;
  backgroundEffectVignette: number;
  onBackgroundEffectVignetteChange: (value: number) => void;
  backgroundEffectNoise: number;
  onBackgroundEffectNoiseChange: (value: number) => void;
  activeVfx: 'none' | 'cornerGlow';
  onActiveVfxChange: (vfx: 'none' | 'cornerGlow') => void;
}

const GrainIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 mr-1.5"
  >
    <circle cx="7" cy="7" r="1"></circle>
    <circle cx="12" cy="9" r="1"></circle>
    <circle cx="17" cy="7" r="1"></circle>
    <circle cx="7" cy="17" r="1"></circle>
    <circle cx="12" cy="15" r="1"></circle>
    <circle cx="17" cy="17" r="1"></circle>
    <circle cx="10" cy="12" r="1"></circle>
    <circle cx="14" cy="12" r="1"></circle>
  </svg>
);


const BackgroundExportControls: React.FC<BackgroundExportControlsProps> = ({
  onBackgroundChange,
  defaultBackgrounds,
  onSetDefaultBackground,
  backgroundMode,
  onBackgroundModeChange,
  solidBackgroundColor,
  onSolidBackgroundColorChange,
  backgroundEffectBlur,
  onBackgroundEffectBlurChange,
  backgroundEffectBrightness,
  onBackgroundEffectBrightnessChange,
  backgroundEffectContrast,
  onBackgroundEffectContrastChange,
  backgroundEffectSaturation,
  onBackgroundEffectSaturationChange,
  backgroundEffectVignette,
  onBackgroundEffectVignetteChange,
  backgroundEffectNoise,
  onBackgroundEffectNoiseChange,
  activeVfx,
  onActiveVfxChange,
}) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Tabs defaultValue="source" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-card z-10 mb-4 rounded-md border">
          <TabsTrigger value="source" className="rounded-l-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Source</TabsTrigger>
          <TabsTrigger value="effects" className="rounded-r-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Effects</TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="flex-grow space-y-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageUp className="w-5 h-5 text-primary" />
                Background Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={backgroundMode} onValueChange={(value) => onBackgroundModeChange(value as 'default' | 'custom' | 'solid' | 'transparent')} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="bg-default" />
                  <Label htmlFor="bg-default" className="font-normal">Default Images</Label>
                </div>
                {backgroundMode === 'default' && (
                  <div className="pl-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {defaultBackgrounds.map((bg) => (
                      <Button
                        key={bg.name}
                        variant="outline"
                        onClick={() => onSetDefaultBackground(bg)}
                        className="text-xs h-auto py-2 px-3"
                      >
                        {bg.name}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="bg-custom" />
                  <Label htmlFor="bg-custom" className="font-normal">Custom Upload</Label>
                </div>
                {backgroundMode === 'custom' && (
                  <div className="pl-6">
                    <FileUpload
                      id="background-upload"
                      label="Image/Video File"
                      accept="image/*,video/*"
                      onFileChange={onBackgroundChange}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solid" id="bg-solid" />
                  <Label htmlFor="bg-solid" className="font-normal flex items-center"><Palette className="w-4 h-4 mr-1.5"/>Solid Color</Label>
                </div>
                {backgroundMode === 'solid' && (
                  <div className="pl-6 space-y-2">
                    <Label htmlFor="solid-color-input" className="text-xs">Pick Solid Color</Label>
                    <Input
                      id="solid-color-input"
                      type="color"
                      value={solidBackgroundColor}
                      onChange={(e) => onSolidBackgroundColorChange(e.target.value)}
                      className="h-10 w-full p-1"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transparent" id="bg-transparent" />
                  <Label htmlFor="bg-transparent" className="font-normal flex items-center"><CheckSquare className="w-4 h-4 mr-1.5"/>Transparent</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="flex-grow space-y-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Visual Effect (VFX)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={activeVfx} onValueChange={(val: 'none' | 'cornerGlow') => onActiveVfxChange(val)} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="vfx-none" />
                  <Label htmlFor="vfx-none" className="font-normal">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cornerGlow" id="vfx-glow" />
                  <Label htmlFor="vfx-glow" className="font-normal">Corner Glow</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Background Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bg-blur-slider" className="text-sm">Blur: {backgroundEffectBlur}px</Label>
                <Slider id="bg-blur-slider" min={0} max={20} step={1} value={[backgroundEffectBlur]} onValueChange={(v) => onBackgroundEffectBlurChange(v[0])} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="bg-brightness-slider" className="text-sm">Brightness: {backgroundEffectBrightness.toFixed(1)}</Label>
                <Slider id="bg-brightness-slider" min={0} max={2} step={0.1} value={[backgroundEffectBrightness]} onValueChange={(v) => onBackgroundEffectBrightnessChange(v[0])} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="bg-contrast-slider" className="text-sm">Contrast: {backgroundEffectContrast.toFixed(1)}</Label>
                <Slider id="bg-contrast-slider" min={0} max={2} step={0.1} value={[backgroundEffectContrast]} onValueChange={(v) => onBackgroundEffectContrastChange(v[0])} className="mt-1" />
              </div>
               <div>
                <Label htmlFor="bg-saturation-slider" className="text-sm">Saturation: {backgroundEffectSaturation.toFixed(1)}</Label>
                <Slider id="bg-saturation-slider" min={0} max={2} step={0.1} value={[backgroundEffectSaturation]} onValueChange={(v) => onBackgroundEffectSaturationChange(v[0])} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="bg-vignette-slider" className="text-sm">Vignette: {Math.round(backgroundEffectVignette * 100)}%</Label>
                <Slider id="bg-vignette-slider" min={0} max={1} step={0.05} value={[backgroundEffectVignette]} onValueChange={(v) => onBackgroundEffectVignetteChange(v[0])} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="bg-noise-slider" className="text-sm flex items-center">
                  <GrainIcon />
                  Noise: {Math.round(backgroundEffectNoise * 100)}%
                </Label>
                <Slider id="bg-noise-slider" min={0} max={1} step={0.05} value={[backgroundEffectNoise]} onValueChange={(v) => onBackgroundEffectNoiseChange(v[0])} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundExportControls;
