
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import OverlayControls from '@/components/glass-view/overlay-controls';
import BackgroundExportControls from '@/components/glass-view/background-export-controls';
import PreviewArea from '@/components/glass-view/preview-area';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIconLucide, ArrowLeft } from 'lucide-react';

const EXPORT_CORNER_RADIUS = 30;
const PREVIEW_CORNER_RADIUS_CSS = '20px';
const BROWSER_BAR_HEIGHT_CHROME_PX = 56;
const BROWSER_BAR_HEIGHT_SAFARI_PX = 44;

interface DefaultBackground {
  name: string;
  url: string;
  hint: string;
}

const defaultBackgrounds: DefaultBackground[] = [
  { name: 'Desk Setup', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847957/Image_fx_6_nj1uag.png', hint: 'desk setup' },
  { name: 'Mountain View', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847959/Image_fx_5_ycbk1t.png', hint: 'mountain view' },
  { name: 'Urban Cafe', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847938/loutput_i6pat1.jpg', hint: 'urban cafe' },
];


export default function GlassViewPage() {
  const { toast } = useToast();

  const [backgroundMode, setBackgroundMode] = useState<'default' | 'custom' | 'solid' | 'transparent'>('default');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(defaultBackgrounds[0].url);
  const [backgroundHint, setBackgroundHint] = useState<string | null>(defaultBackgrounds[0].hint);
  const [solidBackgroundColor, setSolidBackgroundColor] = useState<string>('#FFFFFF');

  const [backgroundEffectBlur, setBackgroundEffectBlur] = useState(0);
  const [backgroundEffectBrightness, setBackgroundEffectBrightness] = useState(1);
  const [backgroundEffectContrast, setBackgroundEffectContrast] = useState(1);
  const [backgroundEffectSaturation, setBackgroundEffectSaturation] = useState(1);
  const [backgroundEffectVignette, setBackgroundEffectVignette] = useState(0);
  const [backgroundEffectNoise, setBackgroundEffectNoise] = useState(0);
  const [activeVfx, setActiveVfx] = useState<'none' | 'cornerGlow'>('none');
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.7);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [blurIntensity, setBlurIntensity] = useState(0);

  const [overlayPosition, setOverlayPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ initialMouseX: number, initialMouseY: number, initialOverlayX: number, initialOverlayY: number } | null>(null);

  const [roundedCorners, setRoundedCorners] = useState(false);
  const [browserBar, setBrowserBar] = useState<'none' | 'chrome' | 'safari'>('none');
  const [browserUrlText, setBrowserUrlText] = useState('example.com');

  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.createImageData(100, 100);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      noiseCanvasRef.current = canvas;
    }
  }, []);

  const getCurrentBrowserBarHeight = useCallback(() => {
    if (browserBar === 'none') return 0;
    if (browserBar === 'chrome') return BROWSER_BAR_HEIGHT_CHROME_PX;
    if (browserBar === 'safari') return BROWSER_BAR_HEIGHT_SAFARI_PX;
    return 0;
  }, [browserBar]);


  const handleBackgroundFileChange = (file: File | null) => {
    setBackgroundFile(file);
    if (file) {
      setBackgroundMode('custom');
    }
  };

  const handleSetDefaultBackground = useCallback((defaultBg: DefaultBackground) => {
    setBackgroundMode('default');
    setBackgroundFile(null);
    setBackgroundUrl(defaultBg.url);
    setBackgroundHint(defaultBg.hint);
  }, []);


  useEffect(() => {
    let objectUrl: string | null = null;
    if (backgroundFile && backgroundMode === 'custom') {
      objectUrl = URL.createObjectURL(backgroundFile);
      setBackgroundUrl(objectUrl);
      setBackgroundHint('custom background');
    }
    return () => {
      if (objectUrl && backgroundFile) { 
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [backgroundFile, backgroundMode]); 

  useEffect(() => {
    const currentBackgroundUrlIsBlob = backgroundUrl?.startsWith('blob:') ?? false;

    if (backgroundMode === 'solid' || backgroundMode === 'transparent') {
      if (currentBackgroundUrlIsBlob && backgroundUrl) {
         URL.revokeObjectURL(backgroundUrl);
      }
      setBackgroundUrl(null);
      setBackgroundHint(backgroundMode === 'solid' ? 'solid color' : 'transparent background');
    } else if (backgroundMode === 'default') {
      if (currentBackgroundUrlIsBlob && backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
      }
      const isCurrentBackgroundDefault = defaultBackgrounds.some(db => db.url === backgroundUrl);
      if (!isCurrentBackgroundDefault || !backgroundUrl) {
         if (defaultBackgrounds.length > 0) {
            handleSetDefaultBackground(defaultBackgrounds[0]);
         }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundMode, handleSetDefaultBackground]); 


  const handleOverlayFileChange = (file: File | null) => {
    setOverlayFile(file);
  };

  useEffect(() => {
    let newUrl: string | null = null;
    if (overlayFile) {
      newUrl = URL.createObjectURL(overlayFile);
      setOverlayUrl(newUrl);
    } else {
      setOverlayUrl(null);
    }
    return () => {
      if (newUrl && overlayFile) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [overlayFile]);


  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStartPoint({
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialOverlayX: overlayPosition.x,
      initialOverlayY: overlayPosition.y,
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging && dragStartPoint) {
        const deltaX = event.clientX - dragStartPoint.initialMouseX;
        const deltaY = event.clientY - dragStartPoint.initialMouseY;
        setOverlayPosition({
          x: dragStartPoint.initialOverlayX + deltaX,
          y: dragStartPoint.initialOverlayY + deltaY,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStartPoint(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStartPoint]);

 const overlayStyle: React.CSSProperties = {
    opacity: opacity,
    transform: `translate(${overlayPosition.x}px, ${overlayPosition.y}px) scale(${scale}) rotate(${rotation}deg)`,
    filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : 'none',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    willChange: 'transform, opacity, filter',
  };
  if (isDragging) {
    delete overlayStyle.transition;
  }


  const drawFrameOnCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentBrowserBarHeight = getCurrentBrowserBarHeight();

    if (roundedCorners) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(EXPORT_CORNER_RADIUS, 0);
      ctx.lineTo(canvas.width - EXPORT_CORNER_RADIUS, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, EXPORT_CORNER_RADIUS);
      ctx.lineTo(canvas.width, canvas.height - EXPORT_CORNER_RADIUS);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - EXPORT_CORNER_RADIUS, canvas.height);
      ctx.lineTo(EXPORT_CORNER_RADIUS, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - EXPORT_CORNER_RADIUS);
      ctx.lineTo(0, EXPORT_CORNER_RADIUS);
      ctx.quadraticCurveTo(0, 0, EXPORT_CORNER_RADIUS, 0);
      ctx.closePath();
      ctx.clip();
    }

    if (backgroundMode === 'solid') {
      ctx.fillStyle = solidBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (backgroundMode === 'transparent') {
      // Canvas is already clear
    } else if ((backgroundMode === 'custom' || backgroundMode === 'default') && backgroundUrl) {
      const bgMedia = document.getElementById('background-media-export') as HTMLImageElement;
      if (bgMedia && bgMedia instanceof HTMLImageElement && bgMedia.complete && bgMedia.naturalWidth > 0) {
        ctx.save();
        const filters = [];
        if (backgroundEffectBlur > 0) filters.push(`blur(${backgroundEffectBlur}px)`);
        if (backgroundEffectBrightness !== 1) filters.push(`brightness(${backgroundEffectBrightness})`);
        if (backgroundEffectContrast !== 1) filters.push(`contrast(${backgroundEffectContrast})`);
        if (backgroundEffectSaturation !== 1) filters.push(`saturate(${backgroundEffectSaturation})`);
        if (filters.length > 0) ctx.filter = filters.join(' ');

        const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.naturalWidth, bgMedia.naturalHeight);
        if (drawWidth > 0 && drawHeight > 0) {
          ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
        ctx.restore();
      }
    }

    if (activeVfx === 'cornerGlow') {
      ctx.save();
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(canvas.width, canvas.height) * 0.6);
      glowGradient.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (backgroundEffectVignette > 0) {
      ctx.save();
      const vignetteGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGradient.addColorStop(1, `rgba(0,0,0,${backgroundEffectVignette})`);
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (backgroundEffectNoise > 0 && noiseCanvasRef.current) {
      ctx.save();
      ctx.globalAlpha = backgroundEffectNoise;
      const pattern = ctx.createPattern(noiseCanvasRef.current, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = opacity;
    if (blurIntensity > 0) {
      ctx.filter = `blur(${blurIntensity}px)`;
    }

    ctx.save();
    const groupCenterX = canvas.width / 2 + overlayPosition.x;
    const groupCenterY = canvas.height / 2 + overlayPosition.y;
    ctx.translate(groupCenterX, groupCenterY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (browserBar !== 'none') {
      const barHeight = currentBrowserBarHeight;
      ctx.fillStyle = browserBar === 'chrome' ? '#DADCE0' : '#F0F0F0';
      ctx.fillRect(0, 0, canvas.width, barHeight);
      ctx.fillStyle = '#FF5F57';
      ctx.beginPath(); ctx.arc(12 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FEBC2E';
      ctx.beginPath(); ctx.arc(32 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#28C840';
      ctx.beginPath(); ctx.arc(52 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      const urlBarX = canvas.width > 300 ? 80 : 60;
      const urlBarY = barHeight / 2 - 10;
      const urlBarWidth = canvas.width - urlBarX - (canvas.width > 300 ? 20 : 10);
      const urlBarHeight = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(urlBarX, urlBarY, urlBarWidth, urlBarHeight);
      ctx.fillStyle = '#333333';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(browserUrlText, urlBarX + 10, urlBarY + urlBarHeight / 2, urlBarWidth - 20);
    }

    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement;
    if (ovMedia && ovMedia instanceof HTMLImageElement && ovMedia.complete && ovMedia.naturalWidth > 0) {
        const overlayContentY = browserBar !== 'none' ? currentBrowserBarHeight : 0;
        const overlayContentHeight = canvas.height - overlayContentY;
        const { drawWidth, drawHeight, offsetX } = getContainSize(
            canvas.width, overlayContentHeight, ovMedia.naturalWidth, ovMedia.naturalHeight
        );
        const offsetYForMedia = overlayContentY + (overlayContentHeight - drawHeight) / 2;
        if (drawWidth > 0 && drawHeight > 0) {
             ctx.drawImage(ovMedia, offsetX, offsetYForMedia, drawWidth, drawHeight);
        }
    }

    ctx.restore(); 
    ctx.restore(); 

    if (roundedCorners) {
      ctx.restore();
    }
  }, [
      backgroundMode, solidBackgroundColor, backgroundUrl,
      backgroundEffectBlur, backgroundEffectBrightness, backgroundEffectContrast, backgroundEffectSaturation,
      backgroundEffectVignette, backgroundEffectNoise, activeVfx,
      opacity, scale, rotation, blurIntensity,
      overlayPosition,
      roundedCorners, browserBar, browserUrlText,
      getCurrentBrowserBarHeight, noiseCanvasRef
    ]);

  const getContainSize = (containerWidth: number, containerHeight: number, naturalWidth: number, naturalHeight: number) => {
    if (naturalWidth <= 0 || naturalHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
        return { drawWidth: 0, drawHeight: 0, offsetX: containerWidth / 2, offsetY: containerHeight / 2 };
    }
    const containerRatio = containerWidth / containerHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (naturalRatio > containerRatio) {
        drawWidth = containerWidth;
        drawHeight = containerWidth / naturalRatio;
        offsetY = (containerHeight - drawHeight) / 2;
    } else {
        drawHeight = containerHeight;
        drawWidth = containerHeight * naturalRatio;
        offsetX = (containerWidth - drawWidth) / 2;
    }
    return { drawWidth, drawHeight, offsetX, offsetY };
  };

  const handleExportImage = useCallback(async () => {
    if (backgroundMode === 'default' || backgroundMode === 'custom') {
      if (!backgroundUrl) {
         toast({ title: "Export Error", description: "Please select or upload a background image first for this mode.", variant: "destructive" });
         return;
      }
    }
    setIsExporting(true);

    const canvas = document.createElement('canvas');
    let exportWidth = 1280;
    let exportHeight = 720;

    const bgMedia = document.getElementById('background-media-export') as HTMLImageElement;
    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement;

    try {
        if ((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl) {
            if (!bgMedia) throw new Error("Background media element not found for export.");
            await new Promise<void>((resolve, reject) => {
                if (bgMedia.complete && bgMedia.naturalWidth > 0) return resolve();
                bgMedia.onload = () => { if (bgMedia.naturalWidth > 0) resolve(); else reject(new Error("Background image loaded but has no dimensions.")); };
                bgMedia.onerror = () => reject(new Error("Error loading background image for export."));
            });
            exportWidth = bgMedia.naturalWidth;
            exportHeight = bgMedia.naturalHeight;
        } else if (overlayUrl && ovMedia) {
             await new Promise<void>((resolve, reject) => {
                if (ovMedia.complete && ovMedia.naturalWidth > 0) return resolve();
                ovMedia.onload = () => { if (ovMedia.naturalWidth > 0) resolve(); else reject(new Error("Overlay image loaded but has no dimensions.")); };
                ovMedia.onerror = () => reject(new Error("Error loading overlay image for export."));
            });
            exportWidth = ovMedia.naturalWidth;
            exportHeight = ovMedia.naturalHeight;
        }
    } catch (err: any) {
        setIsExporting(false);
        toast({ title: "Media Load Error", description: err.message, variant: "destructive" });
        return;
    }
    
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      toast({ title: "Export Error", description: "Could not get canvas context.", variant: "destructive" });
      return;
    }

    await drawFrameOnCanvas(ctx, canvas);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'glass-view_export.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Image downloaded." });
      } else {
        toast({ title: "Export Error", description: "Failed to create image blob.", variant: "destructive" });
      }
      setIsExporting(false);
    }, 'image/png');

  }, [
    backgroundMode, backgroundUrl, solidBackgroundColor, overlayUrl,
    drawFrameOnCanvas, toast, 
  ]);


  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && (backgroundMode === 'default' || backgroundMode === 'custom') && <img id="background-media-export" src={backgroundUrl} alt="background export" crossOrigin="anonymous" />}
      {overlayUrl && <img id="overlay-media-export" src={overlayUrl} alt="overlay export" crossOrigin="anonymous" />}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b border-border bg-card">
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" size="sm" asChild>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </Link>
      </header>
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        <aside className="w-full lg:w-[350px] p-4 lg:p-6 bg-card shadow-lg overflow-y-auto transition-all duration-300 ease-in-out">
          <OverlayControls
            onOverlayChange={handleOverlayFileChange}
            opacity={opacity}
            onOpacityChange={setOpacity}
            scale={scale}
            onScaleChange={setScale}
            rotation={rotation}
            onRotationChange={setRotation}
            blurIntensity={blurIntensity}
            onBlurIntensityChange={setBlurIntensity}
            roundedCorners={roundedCorners}
            onRoundedCornersChange={setRoundedCorners}
            browserBar={browserBar}
            onBrowserBarChange={setBrowserBar}
            browserUrl={browserUrlText}
            onBrowserUrlChange={setBrowserUrlText}
          />
        </aside>

        <main className="p-4 flex items-center justify-center min-h-[300px] md:min-h-[400px] lg:flex-1 lg:p-6 lg:min-h-0 lg:overflow-hidden">
          <PreviewArea
            backgroundMode={backgroundMode}
            backgroundUrl={backgroundUrl}
            backgroundHint={backgroundHint}
            solidBackgroundColor={solidBackgroundColor}
            backgroundEffectBlur={backgroundEffectBlur}
            backgroundEffectBrightness={backgroundEffectBrightness}
            backgroundEffectContrast={backgroundEffectContrast}
            backgroundEffectSaturation={backgroundEffectSaturation}
            backgroundEffectVignette={backgroundEffectVignette}
            backgroundEffectNoise={backgroundEffectNoise}
            activeVfx={activeVfx}

            overlayUrl={overlayUrl}
            overlayStyle={overlayStyle}
            roundedCorners={roundedCorners}
            cornerRadiusPreview={PREVIEW_CORNER_RADIUS_CSS}
            browserBar={browserBar}
            browserUrl={browserUrlText}
            browserBarHeightChrome={BROWSER_BAR_HEIGHT_CHROME_PX}
            browserBarHeightSafari={BROWSER_BAR_HEIGHT_SAFARI_PX}
            onOverlayMouseDown={handleOverlayMouseDown}
            isDragging={isDragging}
          />
        </main>

        <aside className="w-full lg:w-[350px] p-4 lg:p-6 bg-card shadow-lg overflow-y-auto transition-all duration-300 ease-in-out">
          <BackgroundExportControls
            defaultBackgrounds={defaultBackgrounds}
            onSetDefaultBackground={handleSetDefaultBackground}
            onBackgroundChange={handleBackgroundFileChange}

            backgroundMode={backgroundMode}
            onBackgroundModeChange={setBackgroundMode}
            solidBackgroundColor={solidBackgroundColor}
            onSolidBackgroundColorChange={setSolidBackgroundColor}

            backgroundEffectBlur={backgroundEffectBlur}
            onBackgroundEffectBlurChange={setBackgroundEffectBlur}
            backgroundEffectBrightness={backgroundEffectBrightness}
            onBackgroundEffectBrightnessChange={setBackgroundEffectBrightness}
            backgroundEffectContrast={backgroundEffectContrast}
            onBackgroundEffectContrastChange={setBackgroundEffectContrast}
            backgroundEffectSaturation={backgroundEffectSaturation}
            onBackgroundEffectSaturationChange={setBackgroundEffectSaturation}
            backgroundEffectVignette={backgroundEffectVignette}
            onBackgroundEffectVignetteChange={setBackgroundEffectVignette}
            backgroundEffectNoise={backgroundEffectNoise}
            onBackgroundEffectNoiseChange={setBackgroundEffectNoise}
            activeVfx={activeVfx}
            onActiveVfxChange={setActiveVfx}
          />
        </aside>
      </div>

      <footer className="p-4 lg:p-6 flex justify-center border-t border-border bg-card">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportImage} className="w-full" disabled={isExporting}>
              {isExporting ? 'Exporting Image...' : 'Export as Image'}
              <ImageIconLucide className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </footer>
      <HiddenMediaForExport />
    </div>
  );
}

    