import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [lastLocation, setLastLocation] = useState(null);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [activeTrackingSesssion, setActiveTrackingSession] = useState(null); // When looking at someone
    const [myActiveSession, setMyActiveSession] = useState(null); // When I am being tracked

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('receiveLocation', (data) => {
            setLastLocation(data);
        });

        newSocket.on('SOS_RECEIVED', (data) => {
            setSosAlerts(prev => [...prev, data]);
            
            // Speak alert
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("SOS Alert! Emergency situation detected.");
                window.speechSynthesis.speak(utterance);
            }
            // Traditional sound alert
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3'); 
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        newSocket.on('TRACKING_STARTED', (data) => {
            setActiveTrackingSession(data);
            
            // Speak alert
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`${data.userName} has started a tracking session and assigned you as their guardian. Alert!`);
                window.speechSynthesis.speak(utterance);
            }
        });

        newSocket.on('TRACKING_STOPPED', (data) => {
            setActiveTrackingSession(null);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const sendLocation = (lat, lng) => {
        if (socket) {
            socket.emit('sendLocation', { lat, lng });
        }
    };

    const triggerSOS = (lat, lng) => {
        if (socket) {
            socket.emit('sosAlert', { lat, lng });
        }
    };

    const startTracking = (guardianId, src, dest) => {
        if (socket) {
            socket.emit('startTracking', { guardianId, src, dest });
            setMyActiveSession({ guardianId, src, dest });
        }
    };

    const stopTracking = (guardianId) => {
        if (socket) {
            socket.emit('stopTracking', { guardianId });
            setMyActiveSession(null);
        }
    };

    return (
        <SocketContext.Provider value={{ 
            socket, lastLocation, sosAlerts, activeTrackingSesssion, myActiveSession, 
            sendLocation, triggerSOS, startTracking, stopTracking 
        }}>
            {children}
        </SocketContext.Provider>
    );
};
