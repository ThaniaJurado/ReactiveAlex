import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useShakeDetector() {
  const [subscription, setSubscription] = useState<any>(null);
  const [lastShake, setLastShake] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Waiting for movement...');

  // Detectar shake con configuración ajustable
  const handleShakeDetection = ({ x, y, z }: { x: number; y: number; z: number }) => {
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    const currentTime = Date.now();
    
    // Mostrar información de debugging en tiempo real
    if (acceleration > 8) {
      setDebugInfo(`🟡 Movement: ${acceleration.toFixed(2)} | Need: >12`);
    } else {
      setDebugInfo(`🟢 Stable: ${acceleration.toFixed(2)} | Ready for shake`);
    }
    
    // Umbral más bajo para testing en desarrollo (12 en lugar de 15)
    // Y tiempo más corto entre shakes para facilitar testing
    if (acceleration > 12 && currentTime - lastShake > 800) {
      setLastShake(currentTime);
      console.log('🚨 Shake detected! Acceleration:', acceleration.toFixed(2));
      setDebugInfo(`🚨 PANIC TRIGGERED! (${acceleration.toFixed(2)})`);
      triggerPanicAlert();
      
      // Reset debug info después de 3 segundos
      setTimeout(() => {
        setDebugInfo('Ready for next shake...');
      }, 3000);
    }
  };

  const triggerPanicAlert = async () => {
    try {
      // Intentar obtener ubicación actual
      let locationText = 'Ubicación no disponible';
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          
          if (reverseGeocode[0]) {
            locationText = `${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}\nLat: ${currentLocation.coords.latitude.toFixed(6)}, Lng: ${currentLocation.coords.longitude.toFixed(6)}`;
          }
        }
      } catch (error) {
        console.log('Error getting location for panic alert:', error);
      }

      Alert.alert(
        '🚨 BOTÓN DE PÁNICO ACTIVADO',
        `¿Necesitas ayuda de emergencia?\n\nUbicación actual:\n${locationText}`,
        [
          { 
            text: 'Falsa Alarma', 
            style: 'cancel' 
          },
          { 
            text: '🆘 SÍ, NECESITO AYUDA', 
            style: 'destructive',
            onPress: () => {
              // Aquí puedes agregar funcionalidades adicionales:
              // - Enviar SMS a contactos de emergencia
              // - Llamar al número de emergencia
              // - Enviar ubicación a servidor
              Alert.alert(
                '🆘 EMERGENCIA ACTIVADA', 
                'En una implementación real, aquí se enviarían alertas a contactos de emergencia y servicios de ayuda.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }
          }
        ],
        { cancelable: false } // No se puede cancelar tocando fuera
      );
    } catch (error) {
      console.log('Error in panic alert:', error);
    }
  };

  const startShakeDetection = () => {
    if (!subscription) {
      const sub = Accelerometer.addListener(handleShakeDetection);
      setSubscription(sub);
      Accelerometer.setUpdateInterval(100); // Actualizar cada 100ms
      setIsActive(true);
    }
  };

  const stopShakeDetection = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  return {
    isActive,
    startShakeDetection,
    stopShakeDetection,
    triggerPanicAlert, // Para testing manual
    debugInfo, // Información de debugging
  };
}