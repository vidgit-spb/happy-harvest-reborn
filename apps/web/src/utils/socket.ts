import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { 
  SocketEvents, 
  GardenUpdatePayload, 
  PlotUpdatePayload, 
  AnimalUpdatePayload,
  TheftAttemptPayload,
  LevelUpPayload 
} from 'shared-types';

// Socket instance
let socket: Socket | null = null;

// Initialize socket connection
export function initSocketConnection(userId: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }
  
  // Create socket connection
  socket = io({
    path: '/socket.io',
    autoConnect: true,
    auth: {
      userId
    }
  });
  
  // Attach event listeners
  attachSocketListeners(socket);
  
  return socket;
}

// Attach event listeners to socket
function attachSocketListeners(socket: Socket): void {
  const store = useGameStore.getState();
  
  // Garden updates
  socket.on(SocketEvents.GARDEN_UPDATE, (payload: GardenUpdatePayload) => {
    console.log('Garden update received:', payload);
    
    // Update state based on payload type
    if (payload.updateType === 'full' && payload.data) {
      if (payload.data.plots) store.setPlots(payload.data.plots);
      if (payload.data.trees) store.setTrees(payload.data.trees);
      if (payload.data.animals) store.setAnimals(payload.data.animals);
      if (payload.data.buildings) store.setBuildings(payload.data.buildings);
    }
  });
  
  // Plot updates
  socket.on(SocketEvents.PLOT_UPDATE, (payload: PlotUpdatePayload) => {
    console.log('Plot update received:', payload);
    
    if (payload.plotId && payload.changes) {
      store.updatePlot(payload.plotId, payload.changes);
    }
  });
  
  // Animal updates
  socket.on(SocketEvents.ANIMAL_UPDATE, (payload: AnimalUpdatePayload) => {
    console.log('Animal update received:', payload);
    
    if (payload.animalId && payload.changes) {
      store.updateAnimal(payload.animalId, payload.changes);
    }
  });
  
  // Theft attempts
  socket.on(SocketEvents.THEFT_ATTEMPT, (payload: TheftAttemptPayload) => {
    console.log('Theft attempt received:', payload);
    
    // Update the plot that was stolen from
    if (payload.plotId) {
      store.updatePlot(payload.plotId, { 
        stolePercent: payload.stolenPercent 
      });
    }
    
    // TODO: Show notification about theft attempt
  });
  
  // Level up
  socket.on(SocketEvents.LEVEL_UP, (payload: LevelUpPayload) => {
    console.log('Level up received:', payload);
    
    // Update user level if it's current user
    if (store.user && store.user.id === payload.userId) {
      store.setUser({
        ...store.user,
        level: payload.newLevel
      });
      
      // TODO: Show level up celebration animation
    }
  });
  
  // Handle connection events
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
