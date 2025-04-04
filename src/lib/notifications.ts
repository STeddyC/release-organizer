import { toast } from 'react-hot-toast';
import { database, auth } from './firebase';
import { ref, get, set, remove } from 'firebase/database';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { NotificationToast } from '../components/NotificationToast';
import { isAfter, isBefore, startOfDay, addDays } from 'date-fns';

export type NotificationType = 'release' | 'submission' | 'answer' | 'social';

export interface NotificationPreferences {
  release: boolean;
  submission: boolean;
  answer: boolean;
  social: boolean;
  pushEnabled: boolean;
  email: boolean;
}

const messaging = getMessaging();
const VAPID_KEY = 'BPpXYVoqFZ2E5l0Q5ZXz5Y5YZQ5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y';

export function getDefaultPreferences(): NotificationPreferences {
  return {
    release: true,
    submission: true,
    answer: true,
    social: true,
    pushEnabled: false,
    email: true
  };
}

export async function loadNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return getDefaultPreferences();
    }

    if (auth.currentUser.uid !== userId) {
      console.error('User ID mismatch');
      return getDefaultPreferences();
    }

    const userNotificationsRef = ref(database, `users/${userId}/notifications`);
    const snapshot = await get(userNotificationsRef);
    
    if (!snapshot.exists()) {
      const defaultPreferences = getDefaultPreferences();
      await set(userNotificationsRef, defaultPreferences);
      return defaultPreferences;
    }

    const storedPreferences = snapshot.val();
    return {
      ...getDefaultPreferences(),
      ...storedPreferences
    };
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return getDefaultPreferences();
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return false;
    }

    if (auth.currentUser.uid !== userId) {
      console.error('User ID mismatch');
      return false;
    }

    const userNotificationsRef = ref(database, `users/${userId}/notifications`);
    const snapshot = await get(userNotificationsRef);
    const currentPreferences = snapshot.exists() 
      ? { ...getDefaultPreferences(), ...snapshot.val() }
      : getDefaultPreferences();

    if (preferences.pushEnabled !== undefined && preferences.pushEnabled !== currentPreferences.pushEnabled) {
      if (preferences.pushEnabled) {
        const success = await requestNotificationPermission(userId);
        if (!success) return false;
      } else {
        await disableNotifications(userId);
      }
    }

    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };

    await set(userNotificationsRef, updatedPreferences);
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

export async function requestNotificationPermission(userId: string): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return false;
    }

    if (auth.currentUser.uid !== userId) {
      console.error('User ID mismatch');
      return false;
    }

    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Notification permission denied');
      return false;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (!token) {
      toast.error('Failed to get notification token');
      return false;
    }

    await enableNotifications(userId, token);
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    toast.error('Failed to enable notifications');
    return false;
  }
}

async function enableNotifications(userId: string, token: string): Promise<boolean> {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return false;
    }

    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    const defaultData = {
      notifications: getDefaultPreferences(),
      fcmToken: token
    };

    if (!userSnapshot.exists()) {
      await set(userRef, defaultData);
    } else {
      const currentData = userSnapshot.val();
      await set(userRef, {
        ...currentData,
        notifications: {
          ...(currentData.notifications || getDefaultPreferences()),
          pushEnabled: true
        },
        fcmToken: token
      });
    }

    return true;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
}

async function disableNotifications(userId: string): Promise<boolean> {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return false;
    }

    const userRef = ref(database, `users/${userId}`);
    const tokenRef = ref(database, `users/${userId}/fcmToken`);
    const notificationsRef = ref(database, `users/${userId}/notifications/pushEnabled`);
    
    const tokenSnapshot = await get(tokenRef);
    if (tokenSnapshot.exists()) {
      const token = tokenSnapshot.val();
      try {
        await deleteToken(messaging, token);
      } catch (error) {
        console.error('Error deleting FCM token:', error);
      }
      await remove(tokenRef);
    }
    
    await set(notificationsRef, false);
    return true;
  } catch (error) {
    console.error('Error disabling notifications:', error);
    return false;
  }
}

export function startReleaseNotifications(userId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) return;

  const CHECK_INTERVAL = 60 * 1000; // Check every minute

  const checkUpcomingReleases = async () => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) return;
      
      const { notifications } = userSnapshot.val();
      if (!notifications?.release) return;

      const releasesRef = ref(database, `releases/${userId}`);
      const releasesSnapshot = await get(releasesRef);

      const releases = releasesSnapshot.val();
      if (!releases) return;

      const now = new Date();
      const tomorrow = startOfDay(addDays(now, 1));

      Object.entries(releases).forEach(async ([id, release]: [string, any]) => {
        const releaseDate = new Date(release.releaseDate);
        
        if (!release.notified && isAfter(releaseDate, now) && isBefore(releaseDate, tomorrow)) {
          const notification = {
            title: 'Release Coming Tomorrow!',
            body: `"${release.name}" by ${release.artist} is releasing tomorrow!`,
            icon: '/logo-square.png'
          };
          
          if (notifications.pushEnabled && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.body,
              icon: notification.icon
            });
          }

          if (notifications.email) {
            // Here you would implement email notification logic
            console.log('Sending email notification:', notification);
          }

          toast.custom((t) => NotificationToast({
            t,
            notification
          }), {
            duration: 5000
          });

          const notifiedRef = ref(database, `releases/${userId}/${id}/notified`);
          await set(notifiedRef, true);
        }
      });
    } catch (error) {
      console.error('Error checking releases:', error);
    }
  };

  checkUpcomingReleases();
  return setInterval(checkUpcomingReleases, CHECK_INTERVAL);
}

export default {
  requestNotificationPermission,
  updateNotificationPreferences,
  loadNotificationPreferences,
  startReleaseNotifications
};