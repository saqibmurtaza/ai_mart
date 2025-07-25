'use client';

import { useEffect } from 'react';

export default function DOMCleanup() {
  useEffect(() => {
    // Remove problematic attributes added by browser extensions
    document.body.removeAttribute('cz-shortcut-listen');
  }, []);

  return null; // Component renders nothing
}