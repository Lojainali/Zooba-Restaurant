import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  // Don't throw error if context is null - socket might not be connected yet
  // Only throw if context is undefined (not within provider)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context; // Can be null if socket is not connected
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Join user-specific room
        newSocket.emit('join-room', `user-${user._id}`);
        // Join role-specific room
        newSocket.emit('join-room', `role-${user.role}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

