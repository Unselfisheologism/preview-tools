
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye, ArrowLeft, Info } from "lucide-react";

const initialReactCode = `
// Try creating a simple React component!
// Example: A counter
const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="p-6 bg-card text-card-foreground rounded-lg shadow-md max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-4">
        React Counter Snippet
      </h1>
      <p className="text-muted-foreground mb-2">Current count: <span className="font-semibold text-lg text-accent">{count}</span></p>
      <div className="flex space-x-3 mt-4">
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-md hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Decrement
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        This component is rendered using React within the preview.
      </p>
    </div>
  );
};

// This line will be added by the tool if you just provide a component:
// ReactDOM.render(<Counter />, document.getElementById('react-root'));
// For now, ensure your code evaluates to a single component like 'Counter' above.
// Or, include the ReactDOM.render call yourself for more complex scenarios.

// Render the Counter component (or your main component)
// If your snippet defines multiple components, ensure the last one is the one to render,
// or explicitly use ReactDOM.render.
Counter;
`;


export default function SnippetPreviewerPage() {
  const [code, setCode] = useState<string>(initialReactCode);
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [iframeStyles, setIframeStyles] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        ${variablesStyleBlock}
        body {
          margin: 0;
          padding: 1rem;
          font-family: Inter, sans-serif;
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          min-height: 100vh;
          display: flex;
          align-items: flex-start; /* Align content to top */
          justify-content: center; /* Center content horizontally */
        }
        #react-root {
          width: 100%; /* Allow react root to take full width */
        }
      </style>
    `;
    setIframeStyles(styles);
  }, [isClient]);

  const handlePreview = useCallback(() => {
    if (!isClient || !iframeStyles) return;

    // Attempt to wrap user code into a renderable script
    // This assumes the user's code results in a single component definition
    // or includes its own ReactDOM.render call.
    const userCodeProcessed = `
      try {
        const UserProvidedSnippet = (() => {
          ${code}
        })();
        
        // If UserProvidedSnippet is a valid React element/component constructor
        if (UserProvidedSnippet && (typeof UserProvidedSnippet === 'function' || (typeof UserProvidedSnippet === 'object' && UserProvidedSnippet.$$typeof))) {
           ReactDOM.render(React.createElement(UserProvidedSnippet), document.getElementById('react-root'));
        } else if (UserProvidedSnippet === undefined && window.reactRenderExecuted) {
          // Assume user's code called ReactDOM.render()
        } else {
          // Fallback or error for code that doesn't evaluate to a component
          // or if ReactDOM.render was not called by user's code.
          const errorMsg = 'Snippet did not evaluate to a renderable React component, or ReactDOM.render() was not called.';
          console.error(errorMsg);
          document.getElementById('react-root').innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; background: #ffe0e0;">' + errorMsg + ' Please ensure your snippet defines a React component (e.g., const MyComponent = () => { ... }; MyComponent;), or calls ReactDOM.render().</div>';
        }
      } catch (e) {
        console.error("Error executing snippet:", e);
        document.getElementById('react-root').innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; background: #ffe0e0;">Error: ' + e.message + '. Check console for details.</div>';
      }
    `;


    const srcDocContent = `
      <!DOCTYPE html>
      <html lang="en" class="${document.documentElement.classList.contains('dark') ? 'dark' : ''}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Snippet Preview</title>
        ${iframeStyles}
      </head>
      <body>
        <div id="react-root"></div>
        <script type="text/babel">
          // This flag helps determine if the user's code explicitly called ReactDOM.render
          window.reactRenderExecuted = false;
          const originalRender = ReactDOM.render;
          ReactDOM.render = (...args) => {
            window.reactRenderExecuted = true;
            return originalRender(...args);
          };
          ${userCodeProcessed}
        </script>
      </body>
      </html>
    `;
    setIframeSrcDoc(srcDocContent);
  }, [code, iframeStyles, isClient]);

  useEffect(() => {
    if (iframeStyles) { 
      handlePreview();
    }
  }, [code, iframeStyles, handlePreview]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-20">
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" size="sm" asChild>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </a>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-primary">React UI Snippet Previewer</h1>
         <div /> 
      </header>
      <div className="flex flex-col lg:flex-row flex-grow gap-px bg-border overflow-hidden">
        <Card className="w-full lg:w-1/2 flex flex-col rounded-none border-0 lg:border-r lg:border-border">
          <CardHeader className="bg-card p-4 border-b border-border sticky top-[69px] lg:top-0 z-10">
            <CardTitle className="text-lg flex items-center"><Terminal className="w-5 h-5 mr-2"/>Code Input (React JSX)</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4 p-4 bg-card overflow-y-auto">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your React JSX snippet here..."
              className="flex-grow font-mono text-sm resize-none bg-muted/50 border-input focus:bg-background h-[calc(100%-150px)] min-h-[300px] lg:min-h-[400px]"
              spellCheck="false"
            />
             <Alert variant="default" className="mt-2 text-xs">
              <Info className="h-4 w-4" />
              <AlertTitle className="font-semibold text-sm">How to Use</AlertTitle>
              <AlertDescription className="text-muted-foreground space-y-1">
                <p>Write React JSX code. Your snippet should evaluate to a single React component (e.g., define a component and make it the last expression), or call <code className="bg-muted px-1 py-0.5 rounded text-xs">ReactDOM.render()</code> yourself.</p>
                <p>Uses React, ReactDOM, and Babel (for JSX) from CDN.</p>
                <p>Tailwind CSS (CDN version) and your app's theme variables are applied.</p>
                <p><strong className="text-foreground">Limitation:</strong> Direct <code className="bg-muted px-1 py-0.5 rounded text-xs">import</code> of project components (like ShadCN UI) is <strong className="text-destructive">not supported</strong> yet. Define components within the snippet or use standard HTML elements.</p>
              </AlertDescription>
            </Alert>
            <Button onClick={handlePreview} disabled={!isClient || !iframeStyles} className="w-full mt-2">
              <Eye className="w-4 h-4 mr-2" />
              {(!isClient || !iframeStyles) ? 'Loading Styles...' : 'Update Preview'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-1/2 flex flex-col rounded-none border-0">
          <CardHeader className="bg-card p-4 border-b border-border sticky top-[69px] lg:top-0 z-10">
            <CardTitle className="text-lg flex items-center"><Eye className="w-5 h-5 mr-2"/>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 bg-background relative overflow-hidden">
            {(!isClient || !iframeStyles) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <p className="p-4 text-center text-muted-foreground">Loading preview environment...</p>
              </div>
            )}
            <iframe
              srcDoc={iframeSrcDoc}
              title="React Snippet Preview"
              sandbox="allow-scripts allow-same-origin" // allow-same-origin for potential style access, allow-scripts for react/babel
              className="w-full h-full border-0"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


    