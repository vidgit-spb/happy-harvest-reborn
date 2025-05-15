import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stage, Container, Sprite, useTick } from '@pixi/react';
import { Application, Assets, Texture } from 'pixi.js';
import { useGameStore } from '../store/gameStore';
import { trpc } from '../utils/trpc';
import { Plot } from 'shared-types';

// Constants for isometric grid
const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const INITIAL_SCALE = 0.75;

// Function to convert grid coordinates to isometric screen coordinates
function gridToScreen(x: number, y: number): { x: number; y: number } {
  const screenX = (x - y) * (TILE_WIDTH / 2);
  const screenY = (x + y) * (TILE_HEIGHT / 2);
  return { x: screenX, y: screenY };
}

// GameRenderer component
export function GameRenderer() {
  const { t } = useTranslation();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  
  // Access game state
  const { activeGarden } = useGameStore();
  
  // Query garden data if we have an active garden
  const { data: gardenData } = trpc.garden.getById.useQuery(
    { gardenId: activeGarden?.id || '' },
    { enabled: !!activeGarden?.id }
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize assets - this would typically load all game assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Load default tile textures
        await Assets.load('/assets/default_theme/tile_grass.svg');
        await Assets.load('/assets/default_theme/tile_dirt.svg');
        // TODO: Load other assets based on active theme
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

    loadAssets();
  }, []);

  // Setup drag and zoom events
  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;

    // Handle pointer/touch events for dragging
    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true);
      setStartDragPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - startDragPos.x,
          y: e.clientY - startDragPos.y,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // Handle zoom with wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.5, Math.min(2, prev * delta)));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerUp);
    container.addEventListener('wheel', handleWheel);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, position, startDragPos]);

  // Handle plot click
  const handlePlotClick = (plot: Plot) => {
    console.log('Plot clicked:', plot);
    // TODO: Open action menu for the plot based on stage
    // e.g., water, harvest, etc.
  };

  // Render component
  return (
    <div ref={gameContainerRef} className="game-renderer" style={{ width: '100%', height: '100%' }}>
      {/* PixiJS Stage */}
      <Stage width={dimensions.width} height={dimensions.height}>
        {/* Main Container - controls position and scale */}
        <Container 
          x={dimensions.width / 2 + position.x} 
          y={dimensions.height / 3 + position.y} 
          scale={scale}
        >
          {/* Render garden grid */}
          {gardenData?.plots.map((plot) => {
            const { x: screenX, y: screenY } = gridToScreen(plot.x, plot.y);
            
            // Determine tile texture based on plot state
            let texturePath = '/assets/default_theme/tile_grass.svg';
            if (plot.stage !== 'empty') {
              texturePath = '/assets/default_theme/tile_dirt.svg';
            }
            
            return (
              <Container key={plot.id} x={screenX} y={screenY} interactive={true} pointerup={() => handlePlotClick(plot)}>
                {/* Base Tile */}
                <Sprite 
                  texture={Texture.from(texturePath)} 
                  anchor={0.5}
                />
                
                {/* If plot has plant, render the plant */}
                {plot.plantId && plot.stage !== 'empty' && (
                  <Sprite 
                    texture={Texture.from(`/assets/default_theme/crop_${plot.plantId}_${plot.stage}.svg`)} 
                    anchor={0.5} 
                    y={-32} // Offset to position above the tile
                  />
                )}
                
                {/* If plot has pest, show pest indicator */}
                {plot.pest && (
                  <Sprite 
                    texture={Texture.from('/assets/default_theme/pest.svg')} 
                    anchor={0.5} 
                    x={32} 
                    y={-16}
                    scale={0.5}
                  />
                )}
              </Container>
            );
          })}
        </Container>
      </Stage>
      
      {/* No garden placeholder */}
      {!gardenData && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 p-4 text-center">
          <h2 className="text-xl font-bold">{t('garden.no_garden')}</h2>
          <p>{t('garden.create_garden_prompt')}</p>
          <button className="btn">{t('garden.create_garden')}</button>
        </div>
      )}
    </div>
  );
}
