import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`;

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = (projectId?: number) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  const connect = useCallback(() => {
    if (stompClientRef.current?.active) return;

    const socket = new SockJS(SOCKET_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => {
        if (import.meta.env.MODE === 'development') {
          console.log('STOMP: ' + msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    client.onDisconnect = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;
  }, []);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const subscribe = useCallback((destination: string, callback: (message: any) => void) => {
    if (!stompClientRef.current || !isConnected) return null;

    // Avoid duplicate subscriptions
    if (subscriptionsRef.current.has(destination)) {
      return subscriptionsRef.current.get(destination);
    }

    const subscription = stompClientRef.current.subscribe(destination, (message: IMessage) => {
      const payload = JSON.parse(message.body);
      callback(payload);
    });

    subscriptionsRef.current.set(destination, subscription);
    return subscription;
  }, [isConnected]);

  const unsubscribe = useCallback((destination: string) => {
    const subscription = subscriptionsRef.current.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(destination);
    }
  }, []);

  const sendMessage = useCallback((destination: string, body: any) => {
    if (stompClientRef.current?.active) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot send message, WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    sendMessage,
  };
};
