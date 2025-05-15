import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebsocketGateway');

  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService,
  ) {}

  // Initialize WebSocket server
  afterInit(server: Server) {
    this.logger.log('WebSocket Server Initialized');
    this.websocketService.setServer(server);
  }

  // Handle new connections
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        this.disconnect(client, 'No auth token provided');
        return;
      }

      // Validate the token
      const user = await this.authService.validateTelegramUser(token);

      if (!user) {
        this.disconnect(client, 'Invalid auth token');
        return;
      }

      // Store user data in socket
      client.data.userId = user.id;
      client.data.user = user;

      // Register the connection with websocket service
      this.websocketService.registerUser(user.id, client);

      this.logger.log(`Client connected: ${client.id} (User ${user.id})`);

      // Send welcome message
      client.emit('connection', { status: 'connected', userId: user.id });
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`);
      this.disconnect(client, 'Server error during connection');
    }
  }

  // Handle disconnections
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    
    if (userId) {
      // Remove user's socket connection
      this.websocketService.removeUserConnection(client.id);
    }
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  
  // Helper method to disconnect a client
  private disconnect(client: Socket, reason: string) {
    client.emit('error', { message: reason });
    client.disconnect();
    this.logger.warn(`Client disconnected: ${client.id} - Reason: ${reason}`);
  }

  // Subscribe to garden updates
  @SubscribeMessage('garden:subscribe')
  handleGardenSubscribe(client: Socket, payload: { gardenId: string }) {
    try {
      const userId = client.data?.userId;
      
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return { success: false, message: 'Not authenticated' };
      }
      
      const { gardenId } = payload;
      
      // Subscribe user to garden updates
      this.websocketService.subscribeToGarden(userId, gardenId);
      
      // Subscribe socket to garden room
      client.join(`garden:${gardenId}`);
      
      client.emit('subscribed', { gardenId });
      
      this.logger.log(`User ${userId} subscribed to garden ${gardenId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling garden subscription: ${error.message}`);
      client.emit('error', { message: 'Error subscribing to garden' });
      return { success: false, message: 'Server error' };
    }
  }

  // Unsubscribe from garden updates
  @SubscribeMessage('garden:unsubscribe')
  handleGardenUnsubscribe(client: Socket, payload: { gardenId: string }) {
    try {
      const userId = client.data?.userId;
      
      if (!userId) {
        client.emit('error', { message: 'Not authenticated' });
        return { success: false, message: 'Not authenticated' };
      }
      
      const { gardenId } = payload;
      
      // Unsubscribe user from garden updates
      this.websocketService.unsubscribeFromGarden(userId, gardenId);
      
      // Leave garden room
      client.leave(`garden:${gardenId}`);
      
      client.emit('unsubscribed', { gardenId });
      
      this.logger.log(`User ${userId} unsubscribed from garden ${gardenId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling garden unsubscription: ${error.message}`);
      client.emit('error', { message: 'Error unsubscribing from garden' });
      return { success: false, message: 'Server error' };
    }
  }

  // Ping-pong to keep connection alive
  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { time: Date.now() } };
  }
  
  // Handle user status updates (online, away, etc.)
  @SubscribeMessage('status:update')
  handleStatusUpdate(client: Socket, payload: { status: string }) {
    const userId = client.data?.userId;
    
    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return { success: false };
    }
    
    // Broadcast user status to relevant rooms
    this.server.emit('user:status', {
      userId,
      status: payload.status,
      timestamp: Date.now()
    });
    
    return { success: true };
  }
  
  // Handle chat messages in gardens
  @SubscribeMessage('garden:message')
  handleGardenMessage(client: Socket, payload: { gardenId: string, message: string }) {
    const userId = client.data?.userId;
    const user = client.data?.user;
    
    if (!userId || !user) {
      client.emit('error', { message: 'Not authenticated' });
      return { success: false };
    }
    
    if (!payload.message || !payload.gardenId) {
      client.emit('error', { message: 'Invalid message format' });
      return { success: false };
    }
    
    // Send message to all clients in garden room
    this.server.to(`garden:${payload.gardenId}`).emit('garden:message', {
      gardenId: payload.gardenId,
      userId: userId,
      username: user.username || user.firstName || 'Unknown',
      message: payload.message,
      timestamp: Date.now()
    });
    
    return { success: true };
  }
}
