import { useState, useEffect } from 'react';
import { Bell, X, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'referral_reward';
  timestamp: Date;
  read: boolean;
  points?: number;
}

export const NotificationSystem = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }

    // Listen for Firebase notifications if user is logged in
    if (currentUser) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          message: doc.data().message,
          type: doc.data().type,
          timestamp: new Date(doc.data().createdAt),
          read: doc.data().read,
          points: doc.data().points
        }));
        
        // Merge with local notifications
        const localNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const allNotifications = [...firebaseNotifications, ...localNotifications]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 50);
        
        setNotifications(allNotifications);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    const updated = [newNotification, ...notifications].slice(0, 50); // Keep only 50 latest
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Update Firebase notification if it exists there
    if (currentUser && notification.type === 'referral_reward') {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (error) {
        console.error('Error updating notification:', error);
      }
    }

    // Update local state
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    
    // Update localStorage for local notifications
    const localNotifications = updated.filter(n => n.type !== 'referral_reward');
    localStorage.setItem('notifications', JSON.stringify(localNotifications));
  };

  const removeNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications yet
                </p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read ? 'bg-muted/50' : 'bg-background'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {notification.type === 'referral_reward' && <Star className="w-4 h-4 text-yellow-500" />}
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            {notification.points && (
                              <Badge variant="secondary" className="text-xs">+{notification.points}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};