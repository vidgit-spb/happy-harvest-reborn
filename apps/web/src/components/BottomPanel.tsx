import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { ActionButton } from './ActionButton';

type ActionPanelType = 'main' | 'plant' | 'shop' | 'social';

export function BottomPanel() {
  const { t } = useTranslation();
  const [currentPanel, setCurrentPanel] = useState<ActionPanelType>('main');
  const { selectedPlot, activeGarden } = useGameStore();

  // Handle action button click
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'plant':
        setCurrentPanel('plant');
        break;
      case 'water':
        // TODO: Implement water action
        console.log('Water action clicked');
        break;
      case 'harvest':
        // TODO: Implement harvest action
        console.log('Harvest action clicked');
        break;
      case 'shop':
        setCurrentPanel('shop');
        break;
      case 'social':
        setCurrentPanel('social');
        break;
      case 'back':
        setCurrentPanel('main');
        break;
      default:
        console.log(`Action ${action} not implemented`);
    }
  };

  // Render different panels based on current state
  const renderPanel = () => {
    switch (currentPanel) {
      case 'main':
        return (
          <div className="flex justify-between w-full">
            <ActionButton 
              icon="🌱" 
              label={t('actions.plant')} 
              onClick={() => handleActionClick('plant')}
              disabled={!selectedPlot || selectedPlot.stage !== 'empty'}
            />
            <ActionButton 
              icon="💧" 
              label={t('actions.water')} 
              onClick={() => handleActionClick('water')}
              disabled={!selectedPlot || selectedPlot.stage === 'empty' || selectedPlot.stage === 'harvest'}
            />
            <ActionButton 
              icon="✂️" 
              label={t('actions.harvest')} 
              onClick={() => handleActionClick('harvest')}
              disabled={!selectedPlot || selectedPlot.stage !== 'harvest'}
            />
            <ActionButton 
              icon="🛒" 
              label={t('actions.shop')} 
              onClick={() => handleActionClick('shop')}
            />
            <ActionButton 
              icon="👥" 
              label={t('actions.social')} 
              onClick={() => handleActionClick('social')}
            />
          </div>
        );
      
      case 'plant':
        return (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-lg font-bold">{t('panels.plant.title')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* TODO: Fetch crops from content/crops.json */}
              {['carrot', 'tomato', 'strawberry', 'potato', 'cabbage', 'sunflower'].map((crop) => (
                <button 
                  key={crop} 
                  className="btn btn-secondary flex flex-col items-center gap-1"
                  onClick={() => console.log(`Plant ${crop}`)}
                >
                  <span className="text-2xl">{getCropEmoji(crop)}</span>
                  <span>{t(`crops.${crop}`)}</span>
                </button>
              ))}
            </div>
            <button 
              className="btn self-start"
              onClick={() => handleActionClick('back')}
            >
              {t('actions.back')}
            </button>
          </div>
        );
      
      case 'shop':
        return (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-lg font-bold">{t('panels.shop.title')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn btn-secondary">{t('shop.seeds')}</button>
              <button className="btn btn-secondary">{t('shop.animals')}</button>
              <button className="btn btn-secondary">{t('shop.trees')}</button>
              <button className="btn btn-secondary">{t('shop.premium')}</button>
            </div>
            <button 
              className="btn self-start"
              onClick={() => handleActionClick('back')}
            >
              {t('actions.back')}
            </button>
          </div>
        );
      
      case 'social':
        return (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-lg font-bold">{t('panels.social.title')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn btn-secondary">{t('social.invite')}</button>
              <button className="btn btn-secondary">{t('social.friends')}</button>
              <button className="btn btn-secondary">{t('social.visit')}</button>
              <button className="btn btn-secondary">{t('social.leaderboard')}</button>
            </div>
            <button 
              className="btn self-start"
              onClick={() => handleActionClick('back')}
            >
              {t('actions.back')}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Helper function to get emoji for crop type
  const getCropEmoji = (cropType: string): string => {
    const emojiMap: Record<string, string> = {
      carrot: '🥕',
      tomato: '🍅',
      strawberry: '🍓',
      potato: '🥔',
      cabbage: '🥬',
      sunflower: '🌻',
    };
    
    return emojiMap[cropType] || '🌱';
  };

  // Don't render panel if no garden is selected
  if (!activeGarden) {
    return null;
  }

  return (
    <div className="bottom-panel">
      {renderPanel()}
    </div>
  );
}
