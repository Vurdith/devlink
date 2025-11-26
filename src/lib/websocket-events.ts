/**
 * WebSocket Event Types and Utilities
 * Enables real-time updates across clients
 * 
 * Note: Full WebSocket server implementation requires a separate service
 * This file provides the event types and client-side utilities for when WebSocket is available
 */

/**
 * Event types that can be sent over WebSocket
 */
export enum WebSocketEventType {
  // Post events
  POST_CREATED = 'post:created',
  POST_UPDATED = 'post:updated',
  POST_DELETED = 'post:deleted',
  
  // Engagement events
  POST_LIKED = 'post:liked',
  POST_UNLIKED = 'post:unliked',
  POST_REPOSTED = 'post:reposted',
  POST_UNREPOSTED = 'post:unreposted',
  POST_SAVED = 'post:saved',
  POST_UNSAVED = 'post:unsaved',
  
  // View events
  POST_VIEWED = 'post:viewed',
  
  // User events
  USER_FOLLOW = 'user:follow',
  USER_UNFOLLOW = 'user:unfollow',
  USER_UPDATED = 'user:updated',
  
  // System events
  CONNECTION_ESTABLISHED = 'connection:established',
  CONNECTION_CLOSED = 'connection:closed',
  ERROR = 'error',
}

/**
 * Base WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: number;
  userId?: string;
}

/**
 * Post engagement event data
 */
export interface PostEngagementEventData {
  postId: string;
  userId: string;
  count: number;
  userName: string;
}

/**
 * Post view event data
 */
export interface PostViewEventData {
  postId: string;
  viewCount: number;
}

/**
 * User follow event data
 */
export interface UserFollowEventData {
  followerId: string;
  followingId: string;
  followerName: string;
  followerUsername: string;
}

/**
 * WebSocket connection manager
 * Handles client-side WebSocket connections
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<WebSocketEventType, Set<(data: any) => void>>();
  private userId?: string;

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, token: string): Promise<void> {
    this.userId = userId;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Send authentication
          this.send({
            type: WebSocketEventType.CONNECTION_ESTABLISHED,
            data: { userId, token },
            timestamp: Date.now(),
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect(userId, token);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message over WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Subscribe to event type
   */
  on(type: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(userId: string, token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId, token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws`;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Global WebSocket manager instance
 */
let globalWsManager: WebSocketManager | null = null;

/**
 * Get or create global WebSocket manager
 */
export function getWebSocketManager(): WebSocketManager {
  if (!globalWsManager) {
    globalWsManager = new WebSocketManager();
  }
  return globalWsManager;
}

