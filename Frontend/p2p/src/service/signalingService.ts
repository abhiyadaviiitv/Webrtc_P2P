// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

// type SignalMessage = {
//   type: 'offer' | 'answer' | 'candidate';
//   sender: string;
//   payload: any;
// };

// type RoomResponse = {
//   roomId: string;
// };
// // Maintain single connection instance
// let stompClient: Client|null = null;
// let subscription: StompSubscription |null = null;

// export const connectToSignaling = (
//   roomId: string,
//   onSignal: (message: SignalMessage) => void,
//   onError?: (error: Error) => void
// ): void => {
//   // Disconnect existing connection if any
//   disconnect();

//   stompClient = new Client({
//     brokerURL: 'ws://localhost:8080/ws',
//     reconnectDelay: 5000,
//     debug: (str) => console.debug(str),
//     onConnect: () => {
//       if (!stompClient) return;
      
//       const newSubscription = stompClient.subscribe(
//         `/videocall/signal/${roomId}`,
//         (message: IMessage) => {
//           try {
//             const parsedMessage: SignalMessage = JSON.parse(message.body);
//             onSignal(parsedMessage);
//           } catch (error) {
//             console.error('Error parsing signal message:', error);
//             onError?.(error as Error);
//           }
//         }
//       );
      
//       // Only assign if subscription was successful
//       if (newSubscription) {
//         subscription = newSubscription;
//       } else {
//         onError?.(new Error('Failed to create subscription'));
//       }
//     },
//     onStompError: (frame) => {
//       console.error('STOMP protocol error:', frame.headers.message);
//       onError?.(new Error(frame.headers.message));
//     },
//     onWebSocketError: (event) => {
//       console.error('WebSocket error:', event);
//       onError?.(new Error('WebSocket connection error'));
//     }
//   });

//   stompClient.activate();
// };

// export const createRoom = async (): Promise<string> => {
//   try {
//     const response = await fetch('http://localhost:8080/api/rooms/createroom', {
//       method: 'POST',
//       // headers: {
//       //   'Content-Type': 'application/json',
//       // },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data: RoomResponse = await response.json();
//     return data.roomId;
//   } catch (error) {
//     console.error('Failed to create room:', error);
//     throw error;
//   }
// };

// export const joinRoom = async (roomId: string): Promise<boolean> => {
//   try {
//     const response = await fetch(
//       `http://localhost:8080/api/rooms/${roomId}/exists`
//     );

//     if (!response.ok && response.status !== 404) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     return response.ok;
//   } catch (error) {
//     console.error('Failed to join room:', error);
//     throw error;
//   }
// };

// export const sendSignal = (roomId: string, signal: SignalMessage): void => {
//   if (!stompClient?.connected) {
//     console.warn('STOMP client not connected');
//     return;
//   }

//   try {
//     stompClient.publish({
//       destination: `/app/signal/${roomId}`,
//       body: JSON.stringify(signal),
//       headers: { 'content-type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Failed to send signal:', error);
//   }
// };

// export const disconnect = (): void => {
//   try {
//     if (subscription) {
//       subscription.unsubscribe();
//       subscription = null;
//     }

//     if (stompClient) {
//       stompClient.deactivate();
//       stompClient = null;
//     }
//   } catch (error) {
//     console.error('Error during disconnection:', error);
//   }
// };

// // Optional: Add heartbeat functionality
// export const enableHeartbeat = (sendInterval = 10000, receiveInterval = 10000): void => {
//   if (stompClient) {
//     stompClient.heartbeatIncoming = receiveInterval;
//     stompClient.heartbeatOutgoing = sendInterval;
//   }
// };


/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

type SignalMessage = {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave';
  sender: string;
  payload: any;
  target?: string; // Specific user to receive the message
};

type RoomResponse = {
  roomId: string;
};

// Global STOMP client instance
let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;

/**
 * Connects to the signaling server and subscribes to room messages
 * @param roomId - The room ID to join
 * @param userId - Current user's ID
 * @param onSignal - Callback for incoming signals
 * @param onError - Error handler callback
 */
export const connectToSignaling = (
  roomId: string,
  userId: string,
  onSignal: (message: SignalMessage) => void,
  onError?: (error: Error) => void
): void => {
  disconnect(); // Clean up any existing connection

  stompClient = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    debug: (str) => console.debug(str),
    onConnect: () => {
      if (!stompClient) return;

      // Subscribe to room channel
      subscription = stompClient.subscribe(
        `/topic/videocall/signal/${roomId}`,
        (message: IMessage) => {
          try {
            const parsedMessage: SignalMessage = JSON.parse(message.body);
            
            // Only process messages intended for this user or broadcast messages
            if (!parsedMessage.target || parsedMessage.target === userId) {
              onSignal(parsedMessage);
            }
          } catch (error) {
            console.error('Error parsing signal message:', error);
            onError?.(error as Error);
          }
        }
      );

      // Notify others about joining
      sendSignal(roomId, {
        type: 'join',
        sender: userId,
        payload: null
      });
    },
    onStompError: (frame) => {
      console.error('STOMP protocol error:', frame.headers.message);
      onError?.(new Error(frame.headers.message));
    },
    onWebSocketError: (event) => {
      console.error('WebSocket error:', event);
      onError?.(new Error('WebSocket connection error'));
    }
  });

  stompClient.activate();
};

/**
 * Creates a new video call room
 * @returns Promise with room ID
 */
export const createRoom = async (): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8080/api/rooms/createroom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: RoomResponse = await response.json();
    return data.roomId;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw error;
  }
};

/**
 * Checks if a room exists
 * @param roomId - Room ID to check
 * @returns Promise with boolean indicating room existence
 */
export const joinRoom = async (roomId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/rooms/${roomId}/exists`
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.ok;
  } catch (error) {
    console.error('Failed to join room:', error);
    throw error;
  }
};

/**
 * Sends a signaling message to the server
 * @param roomId - Target room ID
 * @param signal - Signaling message to send
 */
export const sendSignal = (roomId: string, signal: SignalMessage): void => {
  if (!stompClient?.connected) {
    console.warn('STOMP client not connected');
    return;
  }

  try {
    stompClient.publish({
      destination: `/app/signal/${roomId}`,
      body: JSON.stringify(signal),
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to send signal:', error);
  }
};

/**
 * Disconnects from signaling server
 */
export const disconnect = (): void => {
  try {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }

    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
  } catch (error) {
    console.error('Error during disconnection:', error);
  }
};