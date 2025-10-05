import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  orderBy, 
  Timestamp,
  writeBatch,
  limit
} from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  type: 'application_update' | 'new_internship' | 'profile_view' | 'system' | 'reminder' | 'interview_scheduled' | 'application_accepted' | 'application_rejected';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'application' | 'system' | 'social' | 'marketing';
  actionUrl?: string;
  imageUrl?: string;
  data?: {
    internshipId?: string;
    applicationId?: string;
    companyName?: string;
    [key: string]: any;
  };
  expiresAt?: Timestamp;
}

export const NotificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: now,
        updatedAt: now,
        priority: notification.priority || 'medium',
        category: notification.category || 'system'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) return;
      
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      unreadNotifications.forEach(notification => {
        if (notification.id) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, {
            read: true,
            updatedAt: now
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Utility functions for date formatting
  formatTimestamp(timestamp: Timestamp | any): string {
    try {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString();
      }
      return 'Invalid date';
    } catch (error) {
      return 'Invalid date';
    }
  },

  getRelativeTime(timestamp: Timestamp | any): string {
    try {
      let date: Date;
      if (timestamp && timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        return 'Unknown';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  },

  // Create specific notification types
  async createApplicationUpdateNotification(
    userId: string,
    applicationId: string,
    companyName: string,
    status: string
  ) {
    const statusMessages = {
      accepted: `🎉 Congratulations! Your application to ${companyName} has been accepted!`,
      rejected: `Your application to ${companyName} was not selected this time.`,
      interview_scheduled: `📅 Interview scheduled for your application to ${companyName}!`,
      under_review: `👀 Your application to ${companyName} is now under review.`
    };

    return this.createNotification({
      userId,
      type: 'application_update',
      title: `Application Update - ${companyName}`,
      message: statusMessages[status as keyof typeof statusMessages] || `Your application status has been updated.`,
      read: false,
      priority: status === 'accepted' ? 'high' : 'medium',
      category: 'application',
      data: {
        applicationId,
        companyName,
        status
      }
    });
  }
};