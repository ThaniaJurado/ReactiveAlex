
import { useEmergencyContext } from '@/contexts/EmergencyContext';
import { useEmergencyMessaging } from '@/hooks/useEmergencyMessaging';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './index.styles';

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

  // To check configuration when coming from configuration screen
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
      // Using city, region, and postal code only, for privacy reasons
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
        <Text style={styles.title}>Loading your data...</Text>
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
        {loadingLocation ? 'Getting your location, please wait...' : 'Hi! Your current location is:'}
      </Text>
      
      {/* Button to refresh location manually */}
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
          <Text style={styles.addressText}>Please wait</Text>
        </>
      ) : null}
    
   </View>


      {/* Panic button */}
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
          >
            <Text style={styles.emergencyPanicButtonLabel}>HELP!</Text>
          </TouchableOpacity>
        )}
      </View>
   
    </ScrollView>
  );
}


