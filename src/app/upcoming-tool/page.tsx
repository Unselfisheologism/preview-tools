
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

export default function UpcomingToolPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
      <Construction className="w-24 h-24 text-primary mb-8" />
      <h1 className="text-4xl font-bold mb-4">Upcoming Tool</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        This tool is currently under construction. Exciting features are on the way!
      </p>
      <Link href="/" passHref>
        <Button variant="outline">
          Go Back to Homepage
        </Button>
      </Link>
    </div>
  );
}
