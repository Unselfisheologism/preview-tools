
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye, ArrowLeft } from "lucide-react";

const initialCode = `
<div class="p-6 bg-card text-card-foreground rounded-lg shadow-md">
  <h1 class="text-3xl font-bold text-primary mb-3">
    Welcome to Snippet Preview!
  </h1>
  <p class="text-muted-foreground mb-4">
    Type your HTML and Tailwind CSS code on the left to see it live here.
  </p>
  <div class="flex space-x-3">
    <button class="bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
      Primary Action
    </button>
    <button class="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-md hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
      Secondary Action
    </button>
  </div>
  <div class="mt-6 border-t border-border pt-4">
    <p class="text-sm text-accent">
      Use Tailwind utility classes like <code class="bg-muted px-1 py-0.5 rounded text-xs">p-4</code>, <code class="bg-muted px-1 py-0.5 rounded text-xs">text-lg</code>, or <code class="bg-muted px-1 py-0.5 rounded text-xs">bg-red-500</code>.
    </p>
  </div>
</div>
`;

export default function SnippetPreviewerPage() {
  const [code, setCode] = useState<string>(initialCode);
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [tailwindAndThemeStyles, setTailwindAndThemeStyles] = useState<string>('');

  useEffect(() => {
    setIsClient(true); // Ensure this runs only on the client for getComputedStyle
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Dynamically get CSS variable values from the parent document
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVariables = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius'
    ];
    let variablesStyleBlock = ':root {\n';
    cssVariables.forEach(variable => {
      const value = rootStyle.getPropertyValue(variable).trim();
      if (value) {
        variablesStyleBlock += `  ${variable}: ${value};\n`;
      }
    });
    variablesStyleBlock += '}\n';

    const styles = `
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        ${variablesStyleBlock}
        body {
          margin: 0; /* Reset margin for iframe body */
          padding: 1rem; /* Add some padding inside the iframe for better visuals */
          font-family: Inter, sans-serif; /* Match base font */
          background-color: hsl(var(--background)); /* Use theme background for body */
          color: hsl(var(--foreground)); /* Use theme foreground for text */
          min-height: 100vh; /* Ensure body takes full height for centering etc. */
        }
        /* Add styles for ShadCN-like elements if user manually creates them with Tailwind */
        .button-primary {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
        }
        .button-primary:hover {
           opacity: 0.9;
        }
         .button-secondary {
          background-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
        }
        .button-secondary:hover {
           opacity: 0.8;
        }
      </style>
    `;
    setTailwindAndThemeStyles(styles);
  }, [isClient]);

  const handlePreview = useCallback(() => {
    if (!isClient || !tailwindAndThemeStyles) return;

    const srcDocContent = `
      <!DOCTYPE html>
      <html lang="en" class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Snippet Preview</title>
        ${tailwindAndThemeStyles}
      </head>
      <body>
        ${code}
      </body>
      </html>
    `;
    setIframeSrcDoc(srcDocContent);
  }, [code, tailwindAndThemeStyles, isClient]);

  useEffect(() => {
    if (tailwindAndThemeStyles) { // Only run preview if styles are ready
      handlePreview();
    }
  }, [code, tailwindAndThemeStyles, handlePreview]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" size="sm" asChild>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">UI Snippet Previewer</h1>
      </header>
      <div className="flex flex-col lg:flex-row flex-grow gap-px bg-border overflow-hidden">
        <Card className="w-full lg:w-1/2 flex flex-col rounded-none border-0 lg:border-r lg:border-border">
          <CardHeader className="bg-card p-4 border-b border-border">
            <CardTitle className="text-lg flex items-center"><Terminal className="w-5 h-5 mr-2"/>Code Input</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4 p-4 bg-card">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your HTML and Tailwind CSS snippet here..."
              className="flex-grow font-mono text-sm resize-none bg-muted/50 border-input focus:bg-background h-[calc(100%-80px)] min-h-[200px]"
              spellCheck="false"
            />
            <Button onClick={handlePreview} disabled={!isClient || !tailwindAndThemeStyles} className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              {(!isClient || !tailwindAndThemeStyles) ? 'Loading Styles...' : 'Update Preview'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-1/2 flex flex-col rounded-none border-0">
          <CardHeader className="bg-card p-4 border-b border-border">
            <CardTitle className="text-lg flex items-center"><Eye className="w-5 h-5 mr-2"/>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 bg-background relative">
            {(!isClient || !tailwindAndThemeStyles) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p className="p-4 text-center text-muted-foreground">Loading preview styles...</p>
              </div>
            )}
            <iframe
              srcDoc={iframeSrcDoc}
              title="Code Snippet Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0"
            />
             <Alert variant="default" className="absolute bottom-4 left-4 right-4 lg:max-w-md bg-card/90 backdrop-blur-sm shadow-lg rounded-md p-3 text-xs">
              <Terminal className="h-3.5 w-3.5" />
              <AlertTitle className="font-semibold text-sm">Styling Notes</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Uses Tailwind CDN & mirrors your app's theme variables. Complex Tailwind features or direct React/ShadCN component imports are not supported in this preview.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
