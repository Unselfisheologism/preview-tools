
'use client';

import type React from 'react';
import FileUpload from './file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Image as ImageIconLucide } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DefaultBackgroundInfo {
  name: string;
  url: string;
  hint: string;
}

interface BackgroundExportControlsProps {
  onBackgroundChange: (file: File | null) => void;
  defaultBackgrounds: DefaultBackgroundInfo[];
  onSetDefaultBackground: (defaultBg: DefaultBackgroundInfo) => void;
}

const BackgroundExportControls: React.FC<BackgroundExportControlsProps> = ({
  onBackgroundChange,
  defaultBackgrounds,
  onSetDefaultBackground,
}) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIconLucide className="w-5 h-5 text-primary" />
            Background Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Default Backgrounds</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
          </div>
          <Separator/>
          <FileUpload
            id="background-upload"
            label="Upload Custom Background"
            accept="image/*,video/*"
            onFileChange={onBackgroundChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundExportControls;
