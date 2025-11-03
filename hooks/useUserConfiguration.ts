import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export function useUserConfiguration() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPreviousConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      const configuredValue = await AsyncStorage.getItem('isConfigured');
      setIsConfigured(!!configuredValue);
    } catch (error) {
      console.error("Error checking user configuration:", error);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPreviousConfiguration();
  }, [checkPreviousConfiguration]);

  // Function to refresh configuration manually
  const refreshConfiguration = useCallback(() => {
    checkPreviousConfiguration();
  }, [checkPreviousConfiguration]);

  return { 
    isConfigured, 
    isLoading, 
    checkPreviousConfiguration, 
    refreshConfiguration 
  };
}
