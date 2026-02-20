import { useState, useEffect, useCallback } from 'react';
import SignalRClient from '../services/signalRClient';
import { OrderUpdate } from '../services/signalRClient';

export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      await SignalRClient.connect();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await SignalRClient.disconnect();
      setIsConnected(false);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, []);

  const sendOrderUpdate = useCallback(
    async (message: string) => {
      try {
        await SignalRClient.sendOrderUpdate(message);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send update';
        setError(message);
      }
    },
    []
  );

  const joinOrderGroup = useCallback(async (orderId: string) => {
    try {
      await SignalRClient.joinOrderGroup(orderId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join group';
      setError(message);
    }
  }, []);

  const leaveOrderGroup = useCallback(async (orderId: string) => {
    try {
      await SignalRClient.leaveOrderGroup(orderId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave group';
      setError(message);
    }
  }, []);

  const sendOrderStatusUpdate = useCallback(
    async (orderId: string, status: string) => {
      try {
        await SignalRClient.sendOrderStatusUpdate(orderId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update status';
        setError(message);
      }
    },
    []
  );

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendOrderUpdate,
    joinOrderGroup,
    leaveOrderGroup,
    sendOrderStatusUpdate,
    client: SignalRClient,
  };
};

export default useSignalR;
