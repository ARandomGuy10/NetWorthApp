import React, { createContext, useContext, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import Purchases from 'react-native-purchases';
import type { CustomerInfo } from 'react-native-purchases';
import { useAuth, useUser } from '@clerk/clerk-expo';

// --- Type Inference Workaround ---
// This is a workaround for a stubborn TypeScript module resolution issue.
// Instead of importing EntitlementInfo directly, we infer it from the CustomerInfo type.
type EntitlementMap = CustomerInfo['entitlements']['active'];
type InferredEntitlementInfo = NonNullable<EntitlementMap[string]>; 
// 1. Get your Public API key from your RevenueCat dashboard
const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
  android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
});

interface SubscriptionContextType {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  proEntitlement: InferredEntitlementInfo | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('Initializing SubscriptionProvider with RevenueCat API Key:', REVENUECAT_API_KEY);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [proEntitlement, setProEntitlement] = useState<InferredEntitlementInfo | null>(null);

  useEffect(() => {
    // 2. Initialize RevenueCat on component mount
    const initPurchases = async () => {
      if (REVENUECAT_API_KEY) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        // Listen for customer info updates
        Purchases.addCustomerInfoUpdateListener((info) => {
          setCustomerInfo(info);
        });
      }
    };
    initPurchases();
  }, []);

  useEffect(() => {
    // 3. Sync Clerk user with RevenueCat user
    const manageUser = async () => {
      if (!REVENUECAT_API_KEY) return;

      try {
        if (isSignedIn && user) {
          // User is logged in with Clerk, so log in to RevenueCat
          const { customerInfo } = await Purchases.logIn(user.id);
          console.log('RevenueCat Customer Info:', customerInfo);
          setCustomerInfo(customerInfo);
        } else {
          // User is logged out from Clerk.
          // Check if the current RevenueCat user is anonymous.
          const isAnonymous = await Purchases.isAnonymous();
          if (!isAnonymous) {
            // If the user was not anonymous, log them out of RevenueCat.
            // This generates a new anonymous user and returns the new customer info.
            const newCustomerInfo = await Purchases.logOut();
            console.log('Logged out from RevenueCat, new Customer Info:', newCustomerInfo);
            setCustomerInfo(newCustomerInfo);
          }
        }
      } catch (error) {
        // By catching the error, we prevent an unhandled promise rejection and can log it.
        console.error('[SubscriptionProvider] Error managing user state:', error);
      }
    };
    manageUser();
  }, [isSignedIn, user]);

  useEffect(() => {
    // 4. Check for active "pro" entitlement
    if (customerInfo) {
      const entitlement = customerInfo.entitlements.active['pro_access']; // Use your entitlement identifier
      console.log('Pro Entitlement:', entitlement);
      setProEntitlement(entitlement || null);
      setIsPro(typeof entitlement !== 'undefined');
    }
  }, [customerInfo]);

  return (
    <SubscriptionContext.Provider value={{ isPro, customerInfo, proEntitlement }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};