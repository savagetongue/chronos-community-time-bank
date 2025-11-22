import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export function RouteErrorBoundary() {
  // Safely attempt to get the error
  let error: unknown;
  try {
    error = useRouteError();
  } catch (e) {
    // Fallback if useRouteError fails (e.g. outside context)
    error = e;
  }
  console.error('Route Error:', error);
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred.';
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found';
      message = "We couldn't find the page you were looking for.";
    } else if (error.status === 401) {
      title = 'Unauthorized';
      message = 'You do not have permission to view this page.';
    } else if (error.status === 503) {
      title = 'Service Unavailable';
      message = 'Our servers are currently unavailable. Please try again later.';
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="default">
            Reload Page
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}