
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye, ArrowLeft, Info } from "lucide-react";

const initialReactCode = `
// React, ReactDOM, and hooks like React.useState are globally available.
// No 'import React from "react";' statement is needed.

function MyTestComponent() {
  const [count, setCount] = React.useState(0);
  const [showMessage, setShowMessage] = React.useState(false);

  return (
    <div className="p-6 bg-card text-card-foreground rounded-lg shadow-md max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-4">
        React Test Snippet
      </h1>
      <p className="text-muted-foreground mb-2">Current count: <span className="font-semibold text-lg text-accent">{count}</span></p>
      
      {showMessage && (
        <p className="mt-2 text-green-500">This is a conditional message!</p>
      )}
      
      <div className="flex space-x-3 mt-4">
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Increment Count
        </button>
        <button 
          onClick={() => setShowMessage(!showMessage)}
          className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-md hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Toggle Message
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        This component is rendered using React within the preview.
      </p>
    </div>
  );
}

// IMPORTANT: To render your component, make sure its name
// is the last expression in this snippet.
// Do NOT use 'export default YourComponent;'
MyTestComponent;
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
          align-items: flex-start; 
          justify-content: center; 
        }
        #react-root {
          width: 100%; 
        }
        .preview-error-box {
          color: #721c24; /* dark red */
          background-color: #f8d7da; /* light red */
          border: 1px solid #f5c6cb; /* medium red */
          padding: 15px;
          border-radius: 4px;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-all;
        }
      </style>
    `;
    setIframeStyles(styles);
  }, [isClient]);

  const handlePreview = useCallback(() => {
    if (!isClient || !iframeStyles) return;

    const userCodeProcessed = `
      // Function to escape HTML, defined within the iframe's scope
      function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
      }

      window.reactRenderExecuted = false; // To detect if user calls ReactDOM.render themselves
      const originalRender = ReactDOM.render;
      ReactDOM.render = (...args) => {
        console.log('[Previewer] ReactDOM.render called by user snippet.');
        window.reactRenderExecuted = true;
        return originalRender(...args);
      };

      console.log('[Previewer] Attempting to process user code with JSON.stringify:', ${JSON.stringify(code)});
      
      let UserProvidedSnippet = undefined;
      try {
        UserProvidedSnippet = (() => {
          // User's code is injected and executed here by Babel
          ${code} 
        })();
        
        console.log('[Previewer] IIFE evaluation result - UserProvidedSnippet:', UserProvidedSnippet, '(type: ' + (typeof UserProvidedSnippet) + ')');

        if (UserProvidedSnippet && typeof UserProvidedSnippet === 'function') {
           console.log('[Previewer] Rendering UserProvidedSnippet as a function component.');
           ReactDOM.render(React.createElement(UserProvidedSnippet), document.getElementById('react-root'));
        } else if (UserProvidedSnippet && typeof UserProvidedSnippet === 'object' && UserProvidedSnippet.$$typeof) {
           console.log('[Previewer] Rendering UserProvidedSnippet as a React element (already created).');
           ReactDOM.render(UserProvidedSnippet, document.getElementById('react-root'));
        }
        else if (window.reactRenderExecuted) {
          console.log('[Previewer] UserProvidedSnippet is not a direct component/element, but reactRenderExecuted is true. Assuming user called ReactDOM.render().');
          // No action needed here, user's ReactDOM.render call should have handled it.
        } else {
          let detail = '';
          if (typeof UserProvidedSnippet === 'undefined') {
            detail = '(Received undefined from snippet evaluation)';
          } else {
            let valueStr = String(UserProvidedSnippet);
            if (valueStr.length > 150) valueStr = valueStr.substring(0, 150) + '... (truncated)';
            detail = '(Received type: ' + (typeof UserProvidedSnippet) + ', value: ' + escapeHtml(valueStr) + ')';
          }
          const errorMsg = 'Snippet did not evaluate to a renderable React component, or ReactDOM.render() was not called directly in the snippet. ' + detail + '. Please ensure your snippet defines a React component and makes its name the last expression, or explicitly calls ReactDOM.render(). Do not use import/export statements.';
          console.error('[Previewer Error]', errorMsg, 'UserProvidedSnippet:', UserProvidedSnippet, 'window.reactRenderExecuted:', window.reactRenderExecuted);
          document.getElementById('react-root').innerHTML = '<div class="preview-error-box">' + escapeHtml(errorMsg) + '</div>';
        }
      } catch (e) {
        console.error("[Previewer Script Error] Error during snippet execution or rendering attempt:", e);
        document.getElementById('react-root').innerHTML = '<div class="preview-error-box">RUNTIME ERROR: ' + escapeHtml(e.message) + '. Check browser console (iframe context) for details.</div>';
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
        <script type="text/babel" data-presets="react">
          ${userCodeProcessed}
        </script>
      </body>
      </html>
    `;
    setIframeSrcDoc(srcDocContent);
  }, [code, iframeStyles, isClient]);

  useEffect(() => {
    if (isClient && iframeStyles) { 
      handlePreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, iframeStyles, isClient]); // handlePreview is not needed as a dependency here if it's stable or only relies on its own args/closure

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
         <div style={{width: '90px'}} /> {/* Spacer to balance the back button */}
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
              <AlertTitle className="font-semibold text-sm">How to Use This React Previewer</AlertTitle>
              <AlertDescription className="text-muted-foreground space-y-1">
                <p><strong className="text-foreground">React is Global:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">React</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs">ReactDOM</code>, and hooks (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">React.useState</code>) are pre-loaded. Do <strong className="text-destructive">not</strong> use <code className="bg-muted px-1 py-0.5 rounded text-xs">import React from 'react';</code>.</p>
                <p><strong className="text-foreground">Component Definition:</strong> Define your React component, for example, as <code className="bg-muted px-1 py-0.5 rounded text-xs">function MyComponent() { /* ... */ }</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs">const MyComponent = () => { /* ... */ };</code>.</p>
                <p><strong className="text-foreground">Render by Last Expression:</strong> To render your component, ensure its name is the <strong className="text-accent">final expression</strong> in your snippet (e.g., after defining <code className="bg-muted px-1 py-0.5 rounded text-xs">MyComponent</code>, add <code className="bg-muted px-1 py-0.5 rounded text-xs">MyComponent;</code> on the last line).</p>
                <p><strong className="text-foreground">Alternative - Direct Render:</strong> You can call <code className="bg-muted px-1 py-0.5 rounded text-xs">ReactDOM.render(&lt;YourComponent /&gt;, document.getElementById('react-root'));</code> directly in your snippet. If so, the "last expression" rule is not needed.</p>
                <p><strong className="text-foreground">No Module Exports:</strong> Do <strong className="text-destructive">not</strong> use <code className="bg-muted px-1 py-0.5 rounded text-xs">export default MyComponent;</code>.</p>
                <p><strong className="text-foreground">Styling:</strong> Tailwind CSS (CDN) and your app's theme variables (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">text-primary</code>) are applied.</p>
                <p><strong className="text-foreground">Project Component Imports:</strong> Direct <code className="bg-muted px-1 py-0.5 rounded text-xs">import</code> of project components (like ShadCN UI) is <strong className="text-destructive">not supported</strong>. Define components within the snippet or use standard HTML styled with Tailwind.</p>
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
              sandbox="allow-scripts" 
              className="w-full h-full border-0"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    