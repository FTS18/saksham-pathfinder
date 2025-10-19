import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  sector?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface ProfileView {
  viewerId: string;
  viewedUserId: string;
  viewedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

class SocialService {
  // Follow a user
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      // Batch all write operations together
      const batch = writeBatch(db);

      // Create follow relationship
      const followRef = doc(
        collection(db, 'profiles', followerId, 'following'),
        followingId
      );
      batch.set(followRef, {
        userId: followingId,
        createdAt: serverTimestamp(),
      });

      // Update follower count
      const followersRef = doc(db, 'profiles', followingId);
      batch.update(followersRef, {
        followerCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Commit all operations in single batch
      await batch.commit();

      // Record profile view in separate operation (not critical for batch)
      await this.recordProfileView(followerId, followingId);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      // Remove follow relationship
      const followRef = doc(
        collection(db, 'profiles', followerId, 'following'),
        followingId
      );
      await deleteDoc(followRef);

      // Decrement follower count
      const followersRef = doc(db, 'profiles', followingId);
      await updateDoc(followersRef, {
        followerCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Check if user follows another user
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followRef = doc(
        collection(db, 'profiles', followerId, 'following'),
        followingId
      );
      const followSnap = await getDoc(followRef);
      return followSnap.exists();
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  // Get user's followers
  async getFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const followersRef = collection(db, 'profiles', userId, 'followers');
      const followersSnap = await getDocs(followersRef);

      const followers: UserProfile[] = [];
      for (const followerDoc of followersSnap.docs) {
        const followerData = await getDoc(doc(db, 'profiles', followerDoc.id));
        if (followerData.exists()) {
          followers.push({
            uid: followerDoc.id,
            ...followerData.data(),
          } as UserProfile);
        }
      }

      return followers;
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  // Get users that user is following
  async getFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const followingRef = collection(db, 'profiles', userId, 'following');
      const followingSnap = await getDocs(followingRef);

      const following: UserProfile[] = [];
      for (const followingDoc of followingSnap.docs) {
        const followingData = await getDoc(doc(db, 'profiles', followingDoc.id));
        if (followingData.exists()) {
          following.push({
            uid: followingDoc.id,
            ...followingData.data(),
          } as UserProfile);
        }
      }

      return following;
    } catch (error) {
      console.error('Error getting following list:', error);
      return [];
    }
  }

  // Get mutual follows
  async getMutualFollows(userId: string): Promise<UserProfile[]> {
    try {
      const followers = await this.getFollowers(userId);
      const following = await this.getFollowing(userId);

      const followerIds = new Set(followers.map(f => f.uid));
      const mutuals = following.filter(f => followerIds.has(f.uid));

      return mutuals;
    } catch (error) {
      console.error('Error getting mutual follows:', error);
      return [];
    }
  }

  // Record profile view
  async recordProfileView(viewerId: string, viewedUserId: string): Promise<void> {
    if (viewerId === viewedUserId) return;

    try {
      const profileViewRef = doc(
        collection(db, 'profiles', viewedUserId, 'profileViews'),
        viewerId
      );
      await setDoc(profileViewRef, {
        viewerId,
        viewedAt: serverTimestamp(),
      }, { merge: true });

      // Update profile view count
      const profileRef = doc(db, 'profiles', viewedUserId);
      await updateDoc(profileRef, {
        profileViewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  }

  // Get profile views
  async getProfileViews(userId: string): Promise<ProfileView[]> {
    try {
      const viewsRef = collection(db, 'profiles', userId, 'profileViews');
      const viewsSnap = await getDocs(viewsRef);

      return viewsSnap.docs.map(doc => ({
        viewerId: doc.data().viewerId,
        viewedUserId: userId,
        viewedAt: doc.data().viewedAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting profile views:', error);
      return [];
    }
  }

  // Send message
  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string
  ): Promise<string> {
    try {
      // Create conversation if doesn't exist
      const conversationId = [senderId, recipientId].sort().join('_');
      const messagesRef = collection(db, 'messages', conversationId, 'messages');

      // Add message
      const messageRef = await setDoc(doc(messagesRef), {
        senderId,
        recipientId,
        content,
        createdAt: serverTimestamp(),
        read: false,
      });

      // Update conversation metadata
      const conversationRef = doc(db, 'messages', conversationId);
      await setDoc(
        conversationRef,
        {
          participants: [senderId, recipientId],
          lastMessage: content,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return conversationId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages between two users
  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const conversationId = [userId1, userId2].sort().join('_');
      const messagesRef = collection(db, 'messages', conversationId, 'messages');
      const messagesSnap = await getDocs(messagesRef);

      return messagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Message));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Mark message as read
  async markMessageAsRead(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', conversationId, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // Get user conversations
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const conversationsRef = collection(db, 'messages');
      const conversationsSnap = await getDocs(conversationsRef);

      const userConversations: any[] = [];
      for (const convDoc of conversationsSnap.docs) {
        const convData = convDoc.data();
        if (convData.participants?.includes(userId)) {
          const otherUserId = convData.participants.find((id: string) => id !== userId);
          const otherUserDoc = await getDoc(doc(db, 'profiles', otherUserId));
          
          userConversations.push({
            conversationId: convDoc.id,
            otherUser: otherUserDoc.exists() ? {
              uid: otherUserId,
              ...otherUserDoc.data(),
            } : null,
            lastMessage: convData.lastMessage,
            lastMessageAt: convData.lastMessageAt?.toDate?.() || new Date(),
          });
        }
      }

      // Sort by last message time
      return userConversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'profiles', userId));
      if (userDoc.exists()) {
        return {
          uid: userId,
          ...userDoc.data(),
          createdAt: userDoc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: userDoc.data().updatedAt?.toDate?.() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Search users by username or sector
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      // Note: This is a simple prefix search
      // For production, consider using Firestore full-text search or Algolia
      const profilesRef = collection(db, 'profiles');
      const querySnap = await getDocs(profilesRef);

      const results: UserProfile[] = [];
      const lowerQuery = query.toLowerCase();

      querySnap.docs.forEach(doc => {
        const profile = doc.data();
        if (
          profile.username?.toLowerCase().includes(lowerQuery) ||
          profile.sector?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            uid: doc.id,
            ...profile,
            createdAt: profile.createdAt?.toDate?.() || new Date(),
            updatedAt: profile.updatedAt?.toDate?.() || new Date(),
          } as UserProfile);
        }
      });

      return results.slice(0, 20); // Limit results
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export default new SocialService();
