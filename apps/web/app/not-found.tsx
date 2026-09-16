'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 select-none">
      <div className="flex flex-col items-center max-w-md w-full p-8 bg-card border border-border rounded-xl shadow-lg text-center space-y-4">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-mono">404</h1>
          <h2 className="text-sm font-semibold text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested page or route does not exist on the Experience Gateway platform.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded text-xs transition shadow"
          >
            <Home className="h-4 w-4" />
            <span>Gateway Workbench</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-muted border border-border text-foreground font-medium rounded text-xs transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
