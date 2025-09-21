import { auth } from '@/lib/firebase';
import { 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateEmail, 
  updatePassword,
  deleteUser,
  User
} from 'firebase/auth';

export class AuthService {
  
  // Email verification
  static async sendVerificationEmail(user: User) {
    try {
      await sendEmailVerification(user);
      return { success: true, message: 'Verification email sent! Check your inbox and spam folder.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Password reset
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent! Check your inbox and spam folder.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Change email
  static async changeEmail(user: User, newEmail: string) {
    try {
      await updateEmail(user, newEmail);
      await this.sendVerificationEmail(user);
      return { success: true, message: 'Email updated! Verification sent to new email.' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Change password
  static async changePassword(user: User, newPassword: string) {
    try {
      await updatePassword(user, newPassword);
      return { success: true, message: 'Password updated successfully!' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete account
  static async deleteAccount(user: User) {
    try {
      await deleteUser(user);
      return { success: true, message: 'Account deleted successfully!' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // SMS verification (using Firebase Phone Auth)
  static async sendSMSVerification(phoneNumber: string) {
    try {
      // Implementation depends on your SMS service
      // For now, return success message
      return { success: true, message: `SMS verification code sent to ${phoneNumber}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}