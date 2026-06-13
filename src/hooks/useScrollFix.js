import { useEffect } from 'react';

/**
 * Hook to ensure scrolling works on mobile devices
 * Addresses common mobile scroll issues
 */
export default function useScrollFix() {
  useEffect(() => {
    // Fix iOS scroll issues
    const fixIOSScroll = () => {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Ensure page-content can scroll
      const pageContent = document.querySelector('.page-content');
      if (pageContent) {
        pageContent.style.overflow = 'scroll';
        pageContent.style.webkitOverflowScrolling = 'touch';
        pageContent.style.height = '100%';
        
        // Force scroll recalculation
        pageContent.scrollTop = pageContent.scrollTop;
      }
    };

    // Run on mount
    fixIOSScroll();

    // Re-run on orientation change
    window.addEventListener('orientationchange', fixIOSScroll);
    window.addEventListener('resize', fixIOSScroll);

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', fixIOSScroll);
      window.removeEventListener('resize', fixIOSScroll);
    };
  }, []);
}
