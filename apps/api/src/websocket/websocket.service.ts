import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);
  private server: Server;
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();
  private gardenSubscriptions: Map<string, Set<string>> = new Map();

  setServer(server: Server) {
    this.server = server;
  }

  // Register a user connection
  registerUser(userId: string, socket: Socket) {
    // Add socket to user's set of connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    
    // Map socket ID to user ID for quick lookups
    this.socketUsers.set(socket.id, userId);
    
    this.logger.log(`User ${userId} connected with socket ${socket.id}`);
  }

  // Remove a user connection
  removeUserConnection(socketId: string) {
    const userId = this.socketUsers.get(socketId);
    
    if (userId) {
      // Remove from user's set of connections
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socketId);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      
      // Remove from socket-to-user mapping
      this.socketUsers.delete(socketId);
      
      this.logger.log(`User ${userId} disconnected socket ${socketId}`);
    }
  }

  // Subscribe to garden updates
  subscribeToGarden(userId: string, gardenId: string) {
    // Set up the garden subscription map
    if (!this.gardenSubscriptions.has(gardenId)) {
      this.gardenSubscriptions.set(gardenId, new Set());
    }
    
    // Add user to garden subscribers
    this.gardenSubscriptions.get(gardenId).add(userId);
    
    this.logger.log(`User ${userId} subscribed to garden ${gardenId}`);
  }

  // Unsubscribe from garden updates
  unsubscribeFromGarden(userId: string, gardenId: string) {
    const gardenSubs = this.gardenSubscriptions.get(gardenId);
    
    if (gardenSubs) {
      gardenSubs.delete(userId);
      if (gardenSubs.size === 0) {
        this.gardenSubscriptions.delete(gardenId);
      }
      
      this.logger.log(`User ${userId} unsubscribed from garden ${gardenId}`);
    }
  }

  // Send a garden update to all subscribed users
  sendGardenUpdate(gardenId: string, payload: any) {
    const subscribers = this.gardenSubscriptions.get(gardenId);
    
    if (!subscribers || subscribers.size === 0) {
      return; // No subscribers
    }
    
    // Send to all subscribers
    subscribers.forEach(userId => {
      this.sendToUser(userId, 'garden-update', payload);
    });
  }

  // Send a plot update to all garden subscribers
  sendPlotUpdate(gardenId: string, plotId: string, changes: any) {
    const subscribers = this.gardenSubscriptions.get(gardenId);
    
    if (!subscribers || subscribers.size === 0) {
      return; // No subscribers
    }
    
    const payload = {
      plotId,
      changes
    };
    
    subscribers.forEach(userId => {
      this.sendToUser(userId, 'plot-update', payload);
    });
  }

  // Send an animal update to all garden subscribers
  sendAnimalUpdate(gardenId: string, animalId: string, changes: any) {
    const subscribers = this.gardenSubscriptions.get(gardenId);
    
    if (!subscribers || subscribers.size === 0) {
      return; // No subscribers
    }
    
    const payload = {
      animalId,
      changes
    };
    
    subscribers.forEach(userId => {
      this.sendToUser(userId, 'animal-update', payload);
    });
  }

  // Send a notification about theft attempt to a garden owner
  sendTheftAttempt(gardenOwnerId: string, plotId: string, thief: { id: string, name: string }, stolenPercent: number) {
    const payload = {
      plotId,
      thiefId: thief.id,
      thiefName: thief.name,
      stolenPercent
    };
    
    this.sendToUser(gardenOwnerId, 'theft-attempt', payload);
  }

  // Send a level up notification to a user
  sendLevelUp(userId: string, newLevel: number, rewards?: any) {
    const payload = {
      userId,
      newLevel,
      rewards
    };
    
    this.sendToUser(userId, 'level-up', payload);
  }

  // Low-level helper method to send an event to a specific user across all their sockets
  private sendToUser(userId: string, event: string, payload: any) {
    const socketIds = this.userSockets.get(userId);
    
    if (!socketIds || socketIds.size === 0) {
      return; // User not connected
    }
    
    // Send to all user's connected sockets
    socketIds.forEach(socketId => {
      this.server.to(socketId).emit(event, payload);
    });
  }
}
