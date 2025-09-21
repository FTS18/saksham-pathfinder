import { useEffect } from 'react';

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};