'use client';

import { useState, useEffect } from 'react';

export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) {
    // Return a placeholder or null during server render and initial client render
    // This ensures no dynamic date is rendered on server, avoiding mismatch.
    // Using current year directly as fallback for no-JS or initial render before useEffect.
    return <>{new Date().getFullYear()}</>; 
  }

  return <>{year}</>;
}
