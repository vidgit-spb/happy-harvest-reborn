import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LoadingScreen() {
  const { t } = useTranslation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + Math.random() * 15;
        return next > 100 ? 100 : next;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[var(--tg-theme-bg-color)]">
      <div className="mb-6 flex items-center">
        <span className="text-4xl mr-3">🚜</span>
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
      </div>
      
      <div className="w-full max-w-md bg-black/10 h-2 rounded-full overflow-hidden mb-3">
        <div 
          className="h-full bg-[var(--tg-theme-button-color)] transition-all duration-300 ease-out" 
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      <p className="text-sm text-[var(--tg-theme-hint-color)]">
        {loadingProgress < 100 
          ? t('loading.preparing_garden') 
          : t('loading.almost_ready')}
      </p>
    </div>
  );
}
