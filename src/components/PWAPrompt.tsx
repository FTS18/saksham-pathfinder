import { useState, useEffect } from 'react';
import { Button } from './ui/button';

import { X, Download, Smartphone } from 'lucide-react';

const PWAPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt automatically after 2 seconds for all users
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!dismissed && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 2000);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 12000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    localStorage.setItem('ios-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-right-full duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-foreground">
                Install App
              </h3>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="w-6 h-6 p-0 hover:bg-muted">
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {isIOS 
                ? 'Tap share → Add to Home Screen'
                : 'Get quick access and offline features'
              }
            </p>
            {!isIOS && (
              <Button size="sm" onClick={handleInstall} className="text-xs w-full">
                <Download className="w-3 h-3 mr-1" />
                Install Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;