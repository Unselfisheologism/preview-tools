
'use client';

import type React from 'react';
import FileUpload from './file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Image as ImageIconLucide, Video } from 'lucide-react';

interface DefaultBackgroundInfo {
  name: string;
  url: string;
  hint: string;
}

interface BackgroundExportControlsProps {
  onBackgroundChange: (file: File | null) => void;
  defaultBackgrounds: DefaultBackgroundInfo[];
  onSetDefaultBackground: (defaultBg: DefaultBackgroundInfo) => void;
  onExportImage: () => void;
  onExportVideo: () => void;
  isExporting: boolean;
}

const BackgroundExportControls: React.FC<BackgroundExportControlsProps> = ({
  onBackgroundChange,
  defaultBackgrounds,
  onSetDefaultBackground,
  onExportImage,
  onExportVideo,
  isExporting,
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onExportImage} className="w-full" disabled={isExporting}>
            {isExporting ? 'Exporting Image...' : 'Export as Image'}
            <ImageIconLucide className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={onExportVideo} variant="outline" className="w-full" disabled={isExporting}>
            {isExporting ? 'Exporting Video...' : 'Export as Video'}
            <Video className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Need to import Label for the default background section
import { Label } from '@/components/ui/label';

export default BackgroundExportControls;
