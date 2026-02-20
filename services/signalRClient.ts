import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from './apiConfig';
import ApiClient from './apiClient';

export interface OrderUpdate {
  orderId: string;
  status: string;
  timestamp: string;
}

export class SignalRClient {
  private static connection: signalR.HubConnection | null = null;

  /**
   * Initialize SignalR connection
   */
  static async connect(): Promise<void> {
    const token = ApiClient.getToken();
    if (!token) {
      console.error('No authentication token available for SignalR connection');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.SIGNALR_URL}/order`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR
   */
  static async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  /**
   * Send order update to all clients
   */
  static async sendOrderUpdate(message: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('SendOrderUpdate', message);
  }

  /**
   * Join order group
   */
  static async joinOrderGroup(orderId: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('JoinOrderGroup', orderId);
  }

  /**
   * Leave order group
   */
  static async leaveOrderGroup(orderId: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('LeaveOrderGroup', orderId);
  }

  /**
   * Send order status update
   */
  static async sendOrderStatusUpdate(orderId: string, status: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('SendOrderStatusUpdate', orderId, status);
  }

  /**
   * Listen to order updates
   */
  static onOrderUpdate(callback: (message: string) => void): void {
    if (!this.connection) throw new Error('Not connected');
    this.connection.on('ReceiveOrderUpdate', callback);
  }

  /**
   * Listen to order status changes
   */
  static onOrderStatusChanged(callback: (data: OrderUpdate) => void): void {
    if (!this.connection) throw new Error('Not connected');
    this.connection.on('OrderStatusChanged', callback);
  }

  /**
   * Listen to connection events
   */
  static onConnected(callback: (data: any) => void): void {
    if (!this.connection) throw new Error('Not connected');
    this.connection.on('Connected', callback);
  }

  /**
   * Remove listeners
   */
  static off(methodName: string): void {
    if (!this.connection) return;
    this.connection.off(methodName);
  }

  /**
   * Check if connected
   */
  static isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export default SignalRClient;
