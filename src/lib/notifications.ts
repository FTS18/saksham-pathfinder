export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon/favicon-32x32.png',
      badge: '/favicon/favicon-16x16.png',
      ...options
    });
  }
};

export const scheduleNotification = (title: string, body: string, delay: number) => {
  setTimeout(() => {
    showNotification(title, { body });
  }, delay);
};

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  NEW_INTERNSHIP: (company: string) => ({
    title: 'New Internship Match!',
    body: `${company} has a new internship that matches your profile`,
    icon: '/favicon/favicon-32x32.png'
  }),
  
  DEADLINE_REMINDER: (company: string, days: number) => ({
    title: 'Application Deadline Reminder',
    body: `${company} internship deadline is in ${days} days`,
    icon: '/favicon/favicon-32x32.png'
  }),
  
  PROFILE_INCOMPLETE: () => ({
    title: 'Complete Your Profile',
    body: 'Add more skills to get better internship matches',
    icon: '/favicon/favicon-32x32.png'
  })
};