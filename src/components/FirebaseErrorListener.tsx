'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for globally emitted 'permission-error' events.
 * Surfaced via toast for better UX, or re-throws for global error handling in development.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Notify the user gracefully via toast for production-like feel
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to perform this action. Check your role.",
      });

      // Still track in state for developer debugging if needed
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // If in development or critical failure, we allow bubbling to global-error.tsx
  // Otherwise, the toast above handles user notification.
  if (error && process.env.NODE_ENV === 'development') {
    // We clear the error after throwing to prevent infinite loops if the error page re-renders this.
    const errToThrow = error;
    return (
      <div className="hidden" onClick={() => setError(null)}>
        {/* Intentionally throwing here to trigger Next.js error boundary */}
        {(() => { throw errToThrow; })()}
      </div>
    );
  }

  return null;
}
