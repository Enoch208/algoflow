'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Custom CSS for the progress bar
const progressBarStyles = `
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: #FFC700;
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #FFC700, 0 0 5px #FFC700;
    opacity: 1.0;
    transform: rotate(3deg) translate(0px, -4px);
  }

  #nprogress .spinner {
    display: none;
  }

  #nprogress .spinner-icon {
    display: none;
  }
`;

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Add custom styles to the document
    const style = document.createElement('style');
    style.textContent = progressBarStyles;
    document.head.appendChild(style);

    // Configure NProgress
    NProgress.configure({
      showSpinner: false,
      minimum: 0.3,
      easing: 'ease',
      speed: 800,
    });

    return () => {
      // Cleanup styles on unmount
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Start progress bar on route change
    NProgress.start();
    
    // Complete progress bar after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
} 