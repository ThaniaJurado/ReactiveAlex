import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useUserConfiguration() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPreviousConfiguration();
  }, []);

  const checkPreviousConfiguration = async () => {
    try{
        const isConfigured = await AsyncStorage.getItem('isConfigured');
        setIsConfigured(!!isConfigured);
    } catch (error) {
      console.error("Error checking user configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isConfigured, isLoading, checkPreviousConfiguration };
}
