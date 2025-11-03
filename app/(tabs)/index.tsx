
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { useUserConfiguration } from '@/hooks/useUserConfiguration';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const{isConfigured, isLoading} = useUserConfiguration();
  const { isActive, triggerPanicAlert } = useShakeDetector();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load location whenever the page is re-rendered and if user is already configured
  useEffect(() => {
    if (isConfigured && !isLoading) {
      getCurrentLocation();
    }
  }, [isConfigured, isLoading]); // It will be executed when isConfigured or isLoading changes

const getCurrentLocation = async() => {
  setLoadingLocation(true);
  try{
    let { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      Alert.alert('Excuse me', 'Please grant location permissions to use this feature');
      setLoadingLocation(false);
      return;
    }

    //After we got the permissions, the next step is to get the current location
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);//We use useState to update location data

    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    if (reverseGeocode[0]) {
      //I commented this line to avoid doxxing myself during the demo
      //const addr = `${reverseGeocode[0].street} ${reverseGeocode[0].streetNumber}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].postalCode}`;
      const addr = `${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].postalCode}`;

      
      setAddress(addr);
    }
  }
  catch(error){
    console.log('Error requesting location permissions:', error);
    Alert.alert('Error', 'Could not get your location. Please try again.');
  } finally {
    setLoadingLocation(false);
  }
}

  if(isLoading){
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading user data...</Text>
      </View>
    );
  }

  if(!isConfigured){
    return(
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Please complete your configuration in the Configuration tab.</Text>
      </View>
    )
  }

  //if it's already configured, you can proceed normally
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        Reactive Alex
      </Text>
      
      <Text style={styles.subtitle}>
        {loadingLocation ? 'Getting your location...' : 'Welcome! Your current location:'}
      </Text>
      
      {/* Reload location */}
      <TouchableOpacity 
        style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]} 
        onPress={getCurrentLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.locationButtonText}>
          {loadingLocation ? '🔄 Loading...' : '📍 Refresh Location'}
        </Text>
      </TouchableOpacity>

      {address ? (
        <View style={styles.locationInfo}>
          <Text style={styles.addressTitle}>Your current location:</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      ) : loadingLocation ? (
        <View style={styles.locationInfo}>
          <Text style={styles.addressTitle}>Loading your location...</Text>
          <Text style={styles.addressText}>Please wait while we get your current position</Text>
        </View>
      ) : null}

      {location ? (
        <View style={styles.coordinatesInfo}>
          <Text style={styles.coordinatesTitle}>Coordinates:</Text>
          <Text style={styles.coordinatesText}>
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
        </View>
      ) : null}

      {/* Emergency Panic Button */}
      <View style={styles.panicButtonContainer}>
        <Text style={styles.panicButtonTitle}>
          🚨 Emergency Panic Button
        </Text>
        <Text style={styles.panicButtonSubtitle}>
          {isActive ? 'Press the button below in case of emergency' : 'Complete your configuration to activate'}
        </Text>
        
        {isActive && (
          <TouchableOpacity 
            style={styles.emergencyPanicButton}
            onPress={triggerPanicAlert}
            activeOpacity={0.8}
          >
            <Text style={styles.emergencyPanicButtonText}>🆘</Text>
            <Text style={styles.emergencyPanicButtonLabel}>EMERGENCY</Text>
            <Text style={styles.emergencyPanicButtonSubtext}>Press and Hold</Text>
          </TouchableOpacity>
        )}
      </View>
   
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    minHeight: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#red',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
    color: '#666',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    color: '#555',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    color: '#555',
  },
  locationButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
    minWidth: 200,
  },
  locationButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    width: '100%',
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  coordinatesInfo: {
    backgroundColor: '#f1f3f4',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  shakeDetectorStatus: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    width: '100%',
  },
  shakeDetectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  shakeDetectorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  panicButtonContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panicButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#d32f2f',
    textAlign: 'center',
  },
  panicButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emergencyPanicButton: {
    backgroundColor: '#ff0000',
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff0000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#ffffff',
  },
  emergencyPanicButtonText: {
    fontSize: 50,
    color: 'white',
    marginBottom: 5,
  },
  emergencyPanicButtonLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
    marginBottom: 2,
  },
  emergencyPanicButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  testPanicButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  testButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6c757d',
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  testPanicButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
