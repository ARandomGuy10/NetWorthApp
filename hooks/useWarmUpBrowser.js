import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

// This is a no-op on platforms other than Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Use a try-catch to safely check for Android platform
    const isAndroid = (() => {
      try {
        // This will throw if Platform is not available
        const { Platform } = require('react-native');
        return Platform.OS === 'android';
      } catch (error) {
        console.warn('Could not access Platform.OS, assuming not Android');
        return false;
      }
    })();

    if (isAndroid) {
      // Warm up the browser to improve OAuth UX
      // https://docs.expo.dev/guides/authentication/#improving-user-experience
      void WebBrowser.warmUpAsync()
        .catch(error => {
          console.warn('Failed to warm up browser:', error);
        });
      
      return () => {
        void WebBrowser.coolDownAsync()
          .catch(error => {
            console.warn('Failed to cool down browser:', error);
          });
      };
    }
  }, []);
};
