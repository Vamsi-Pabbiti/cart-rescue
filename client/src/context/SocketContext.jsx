import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(socket.connected);
  const [liveActivities, setLiveActivities] = useState([
    { timestamp: '11:42:08', sessionId: 'CR-82931', eventText: 'Payment failure detected', riskScore: 91, action: 'SHOW_PAYMENT_HELP' },
    { timestamp: '11:41:52', sessionId: 'CR-82930', eventText: 'Price shopping detected', riskScore: 78, action: 'DO_NOTHING' },
    { timestamp: '11:41:31', sessionId: 'CR-82929', eventText: 'Low risk browsing', riskScore: 21, action: 'DO_NOTHING' }
  ]);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onLiveActivity(data) {
      setLiveActivities((prev) => [data, ...prev.slice(0, 19)]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('live_activity', onLiveActivity);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('live_activity', onLiveActivity);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connected, liveActivities, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
