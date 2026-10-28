import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const knownNotificationIds = useRef(new Set());

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications whenever user logs in or switches persona
  useEffect(() => {
    if (!user?._id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const nextNotifications = res.data.notifications || [];
        const newNotification = nextNotifications.find(
          (notification) => !knownNotificationIds.current.has(notification._id)
        );
        if (newNotification && knownNotificationIds.current.size > 0) {
          setActiveToast(newNotification);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, { body: newNotification.message });
          }
          knownNotificationIds.current = new Set(nextNotifications.map((notification) => notification._id));
        }
        setNotifications(nextNotifications);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        setActiveToast,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
