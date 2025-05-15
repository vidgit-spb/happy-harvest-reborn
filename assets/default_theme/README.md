# Default Theme Assets

This directory contains placeholder images for the game assets. In a production environment, these would be replaced with professionally designed graphics.

## Image Naming Convention

- Tiles: `tile_[type].png` (e.g., tile_grass.png, tile_dirt.png)
- Crops: `crop_[type]_[stage].png` (e.g., crop_carrot_seed.png, crop_tomato_mature.png)
- Animals: `animal_[type]_[state].png` (e.g., animal_chicken_idle.png, animal_cow_fed.png)
- Trees: `tree_[type]_[stage].png` (e.g., tree_apple_sapling.png, tree_cherry_mature.png)
- Buildings: `building_[type]_[level].png` (e.g., building_factory_1.png)
- Effects: `effect_[type].png` (e.g., effect_water_drop.png)
- UI: `ui_[element].png` (e.g., ui_coin.png, ui_button_normal.png)

## Creating Placeholder Assets

For development purposes, create simple colored shapes with text labels to represent each asset type. This ensures the game mechanics can be tested without final art assets.

Example:
- Grass tile: Green square with "Grass" text
- Carrot seed: Brown circle with "Carrot Seed" text
- Chicken: Yellow rectangle with "Chicken" text

## Asset Dimensions

- Tiles: 128x64px (isometric)
- Crops: 128x128px
- Animals: Various sizes depending on the animal type
- Trees: 256x256px
- Buildings: Various sizes depending on the building type
- UI elements: As needed for the interface

## Notes for Artists

When creating final assets:
1. Use the same dimensions as placeholders
2. Maintain consistent lighting direction (top-left light source)
3. Export as PNG with transparency
4. Consider creating sprite sheets for animations
5. Follow the theme engine format for easy integration
