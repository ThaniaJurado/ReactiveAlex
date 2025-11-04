import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface EmergencyContextType {
  isConfigured: boolean | null;
  isLoading: boolean;
  refreshConfiguration: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider = ({ children }: { children: ReactNode }) => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if complete configuration exists
      const userEmail = await AsyncStorage.getItem('userEmail');
      const contactEmail = await AsyncStorage.getItem('contactEmail');
      const contactPhone = await AsyncStorage.getItem('contactPhone');
      
      // Configuration is complete if all fields have values
      const configurationComplete = !!(userEmail && contactEmail && contactPhone);
      
      setIsConfigured(configurationComplete);
      
      // Save the status in AsyncStorage for future verifications
      await AsyncStorage.setItem('isConfigured', configurationComplete.toString());
      
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshConfiguration = useCallback(async () => {
    await checkConfiguration();
  }, [checkConfiguration]);

  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  return (
    <EmergencyContext.Provider 
      value={{ 
        isConfigured, 
        isLoading, 
        refreshConfiguration 
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

// Custom hook to use the context
export const useEmergencyContext = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergencyContext must be used within EmergencyProvider');
  }
  return context;
};