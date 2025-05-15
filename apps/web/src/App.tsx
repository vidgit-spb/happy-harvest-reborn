import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TelegramWebApp } from '@telegram-mini-apps/sdk';
import { trpc } from './utils/trpc';
import { GameRenderer } from './components/GameRenderer';
import { BottomPanel } from './components/BottomPanel';
import { LoadingScreen } from './components/LoadingScreen';
import { useGameStore } from './store/gameStore';
import { initSocketConnection } from './utils/socket';

// Main App component
function App() {
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, setActiveGarden } = useGameStore();
  
  // Fetch user data on mount
  const { data: userData, isLoading } = trpc.auth.me.useQuery(undefined, {
    onSuccess: (data) => {
      setUser(data.user);
      if (data.activeGarden) {
        setActiveGarden(data.activeGarden);
      }
      setIsInitialized(true);
    },
    onError: (error) => {
      console.error('Error fetching user data:', error);
      // Show error in Telegram UI
      TelegramWebApp.showAlert(t('errors.failed_to_load'));
    },
  });

  // Set up socket connection
  useEffect(() => {
    if (userData?.user.id) {
      const socket = initSocketConnection(userData.user.id);
      
      return () => {
        socket.disconnect();
      };
    }
  }, [userData?.user.id]);

  // Set main button based on game state
  useEffect(() => {
    if (!isInitialized) return;
    
    const mainButton = TelegramWebApp.MainButton;
    
    // Setup Main Button
    mainButton.setText(t('actions.invite_friends'));
    mainButton.onClick(() => {
      TelegramWebApp.showScanQrPopup({
        text: t('invite.scan_qr_text'),
      });
    });
    
    // Show only if we have a garden
    if (userData?.activeGarden) {
      mainButton.show();
    } else {
      mainButton.hide();
    }
    
    return () => {
      mainButton.offClick();
    };
  }, [isInitialized, userData?.activeGarden, t]);

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="game-container">
      {/* PixiJS Game Renderer */}
      <GameRenderer />
      
      {/* UI Overlays */}
      <div className="ui-layer top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div className="badge">
          <span role="img" aria-label={t('currency.coins')}>🪙</span>
          <span>{userData?.user.coins || 0}</span>
        </div>
        
        <div className="badge">
          <span role="img" aria-label={t('currency.stars')}>⭐</span>
          <span>{userData?.user.stars || 0}</span>
        </div>
      </div>
      
      {/* Bottom Control Panel */}
      <BottomPanel />
    </div>
  );
}

export default App;
