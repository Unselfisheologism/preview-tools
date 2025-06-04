
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Glasses, Code, TestTube } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">Studio Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A collection of creative utilities to enhance your design and development workflow.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/glass-view" passHref legacyBehavior>
          <a className="block h-full">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Glasses className="mr-3 h-7 w-7 text-primary" />
                  Glass View
                </CardTitle>
                <CardDescription>Smart glasses screenshot and recording preview tool.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize your smart glasses UI on various backgrounds, adjust overlays, and export stunning previews.
                </p>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                  <span className="text-sm font-medium text-primary hover:underline flex items-center">
                    Open Glass View <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
              </div>
            </Card>
          </a>
        </Link>

        <Link href="/upcoming-tool" passHref legacyBehavior>
          <a className="block h-full">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <TestTube className="mr-3 h-7 w-7 text-primary" />
                  UI Code Tester/Previewer
                </CardTitle>
                <CardDescription>Test and preview HTML/Tailwind or React JSX snippets with live updates and theme integration.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly iterate on UI ideas by pasting your code and seeing it render instantly. Supports Tailwind CSS and theme variables.
                </p>
              </CardContent>
               <div className="p-6 pt-0 mt-auto">
                  <span className="text-sm font-medium text-primary hover:underline flex items-center">
                    Open UI Previewer <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
              </div>
            </Card>
          </a>
        </Link>
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Studio Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}
