import { useState, useEffect } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  deviceType: string;
}

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPortrait: false,
    deviceType: 'Desktop'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      let deviceType = "";
      if (isMobile) deviceType = "Mobile";
      else if (isTablet) deviceType = "Tablet";
      else deviceType = "Desktop";

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        deviceType
      });
    };

    // Initial check
    updateViewport();

    // Add event listener
    window.addEventListener('resize', updateViewport);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
} 