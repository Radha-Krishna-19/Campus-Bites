import { io } from 'socket.io-client';
import { BACKEND_URL, DEMO_MODE } from './api';
import { orderStatusSnapshot } from './demoBackend';

let socket = null;

// Mimics the Socket.IO client for demo mode: emits `order_update` whenever an
// order's status changes in local storage (this tab, another tab, or the kitchen timer).
function createDemoSocket() {
  const handlers = {};
  let last = null;

  const fire = (event, data) => (handlers[event] || []).forEach((fn) => fn(data));

  const poll = async () => {
    const snapshot = await orderStatusSnapshot();
    if (last) {
      snapshot.forEach((o) => {
        if (last[o.order_id] !== o.status && o.status !== 'PENDING_PAYMENT') fire('order_update', o);
      });
    }
    last = Object.fromEntries(snapshot.map((o) => [o.order_id, o.status]));
  };

  poll();
  setInterval(poll, 2500);

  return {
    connected: true,
    on(event, fn) {
      (handlers[event] = handlers[event] || []).push(fn);
      if (event === 'connect') setTimeout(fn, 0);
      return this;
    },
    off(event, fn) {
      handlers[event] = fn ? (handlers[event] || []).filter((h) => h !== fn) : [];
      return this;
    },
    emit() {
      return this;
    },
    disconnect() {},
  };
}

export const initializeSocket = () => {
  if (!socket) {
    socket = DEMO_MODE
      ? createDemoSocket()
      : io(BACKEND_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });
  }
  return socket;
};

export const getSocket = () => socket || initializeSocket();

export const joinRoom = (room) => {
  getSocket().emit('join_room', { room });
};

export const leaveRoom = (room) => {
  getSocket().emit('leave_room', { room });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
