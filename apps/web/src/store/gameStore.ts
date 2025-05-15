import { create } from 'zustand';
import { Garden, Plot, Animal, Tree, Building, User } from 'shared-types';

interface GameState {
  // User and garden data
  user: User | null;
  activeGarden: Garden | null;
  plots: Plot[];
  trees: Tree[];
  animals: Animal[];
  buildings: Building[];
  
  // UI state
  selectedPlot: Plot | null;
  selectedTree: Tree | null;
  selectedAnimal: Animal | null;
  selectedBuilding: Building | null;
  activeTool: string | null;
  
  // Theme and settings
  currentTheme: string;
  soundEnabled: boolean;
  
  // Action methods
  setUser: (user: User) => void;
  setActiveGarden: (garden: Garden) => void;
  setPlots: (plots: Plot[]) => void;
  setTrees: (trees: Tree[]) => void;
  setAnimals: (animals: Animal[]) => void;
  setBuildings: (buildings: Building[]) => void;
  
  selectPlot: (plot: Plot | null) => void;
  selectTree: (tree: Tree | null) => void;
  selectAnimal: (animal: Animal | null) => void;
  selectBuilding: (building: Building | null) => void;
  
  setActiveTool: (tool: string | null) => void;
  setTheme: (theme: string) => void;
  toggleSound: () => void;
  
  // Game state updates
  updatePlot: (plotId: string, changes: Partial<Plot>) => void;
  updateTree: (treeId: string, changes: Partial<Tree>) => void;
  updateAnimal: (animalId: string, changes: Partial<Animal>) => void;
  
  // Session reset
  resetState: () => void;
}

// Create the store
export const useGameStore = create<GameState>((set) => ({
  // Initial state
  user: null,
  activeGarden: null,
  plots: [],
  trees: [],
  animals: [],
  buildings: [],
  
  selectedPlot: null,
  selectedTree: null,
  selectedAnimal: null,
  selectedBuilding: null,
  activeTool: null,
  
  currentTheme: 'classic_2010',
  soundEnabled: true,
  
  // Actions
  setUser: (user) => set({ user }),
  
  setActiveGarden: (garden) => set({ activeGarden: garden }),
  
  setPlots: (plots) => set({ plots }),
  
  setTrees: (trees) => set({ trees }),
  
  setAnimals: (animals) => set({ animals }),
  
  setBuildings: (buildings) => set({ buildings }),
  
  selectPlot: (plot) => set({ 
    selectedPlot: plot,
    selectedTree: null,
    selectedAnimal: null,
    selectedBuilding: null
  }),
  
  selectTree: (tree) => set({ 
    selectedTree: tree,
    selectedPlot: null,
    selectedAnimal: null,
    selectedBuilding: null
  }),
  
  selectAnimal: (animal) => set({ 
    selectedAnimal: animal,
    selectedPlot: null,
    selectedTree: null,
    selectedBuilding: null
  }),
  
  selectBuilding: (building) => set({ 
    selectedBuilding: building,
    selectedPlot: null,
    selectedTree: null,
    selectedAnimal: null
  }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setTheme: (theme) => set({ currentTheme: theme }),
  
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  updatePlot: (plotId, changes) => set((state) => ({
    plots: state.plots.map(plot => 
      plot.id === plotId ? { ...plot, ...changes } : plot
    ),
    // Also update selected plot if it's the one being modified
    selectedPlot: state.selectedPlot?.id === plotId 
      ? { ...state.selectedPlot, ...changes } 
      : state.selectedPlot
  })),
  
  updateTree: (treeId, changes) => set((state) => ({
    trees: state.trees.map(tree => 
      tree.id === treeId ? { ...tree, ...changes } : tree
    ),
    selectedTree: state.selectedTree?.id === treeId 
      ? { ...state.selectedTree, ...changes }
      : state.selectedTree
  })),
  
  updateAnimal: (animalId, changes) => set((state) => ({
    animals: state.animals.map(animal => 
      animal.id === animalId ? { ...animal, ...changes } : animal
    ),
    selectedAnimal: state.selectedAnimal?.id === animalId 
      ? { ...state.selectedAnimal, ...changes }
      : state.selectedAnimal
  })),
  
  resetState: () => set({
    plots: [],
    trees: [],
    animals: [],
    buildings: [],
    selectedPlot: null,
    selectedTree: null,
    selectedAnimal: null,
    selectedBuilding: null,
    activeTool: null
  })
}));
