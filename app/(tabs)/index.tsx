
import { useEmergencyContext } from '@/contexts/EmergencyContext';
import { useEmergencyMessaging } from '@/hooks/useEmergencyMessaging';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { isConfigured, isLoading, refreshConfiguration } = useEmergencyContext();
  const { isMessagingActive, triggerEmergencyAlert } = useEmergencyMessaging();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load location whenever the page is re-rendered and if user is already configured
  useEffect(() => {
    if (isConfigured && !isLoading) {
      getCurrentLocation();
    }
  }, [isConfigured, isLoading]); // Execute when isConfigured or isLoading changes

  // Refresh configuration whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshConfiguration();
    }, [refreshConfiguration])
  );

const getCurrentLocation = async() => {
  setLoadingLocation(true);
  try{
    let { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      Alert.alert('Excuse me', 'Please grant location permissions to use this feature');
      setLoadingLocation(false);
      return;
    }

    // After getting permissions, get the current location
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation); // Use useState to update location data

    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    if (reverseGeocode[0]) {
      // Using city, region, and postal code for privacy
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
        <Text style={styles.configurationMessage}>Please complete your configuration before continuing</Text>
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
      
      {/* Refresh location button */}
      <TouchableOpacity 
        style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]} 
        onPress={getCurrentLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.locationButtonText}>
          {loadingLocation ? 'Loading...' : 'Refresh Location'}
        </Text>
      </TouchableOpacity>

   <View style={styles.locationInfo}>
      {address ? (
     <>
          <Text style={styles.addressTitle}>Your current location:</Text>
          <Text style={styles.addressText}>{address}</Text>

          <Text style={styles.coordinatesTitle}>Coordinates:</Text>
          <Text style={styles.coordinatesText}>
            Lat: {location?.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Lng: {location?.coords.longitude.toFixed(6)}
          </Text>
     </>
      ) : loadingLocation ? (
        <>
          <Text style={styles.addressTitle}>Loading your location...</Text>
          <Text style={styles.addressText}>Please wait while we get your current position</Text>
        </>
      ) : null}
    
   </View>


      {/* Emergency Panic Button */}
      <View style={styles.panicButtonContainer}>
        <Text style={styles.panicButtonTitle}>
          Emergency Panic Button
        </Text>
        <Text style={styles.panicButtonSubtitle}>
          {isMessagingActive ? 'Press the button below in case of emergency' : 'Complete your configuration to activate'}
        </Text>
        
        {isMessagingActive && (
          <TouchableOpacity 
            style={styles.emergencyPanicButton}
            onPress={triggerEmergencyAlert}
            activeOpacity={0.7}
          >
            <Text style={styles.emergencyPanicButtonLabel}>EMERGENCY</Text>
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
  configurationMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#ffffff',
    paddingHorizontal: 20,
    lineHeight: 32,
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
    backgroundColor: '#e53e3e',
    borderRadius: 20,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyPanicButtonLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
