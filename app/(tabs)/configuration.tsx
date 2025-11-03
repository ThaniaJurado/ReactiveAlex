import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ConfigurationScreen() {
  const [configured, setConfigured] = useState('');
  const [myEmail, setMyEmail] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Load save data, if any
  useEffect(() => {
    loadSavedData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [])
  );

  const loadSavedData = async () => {
    try {
      const alreadyConfigured = await AsyncStorage.getItem('isConfigured');
      const savedMyEmail = await AsyncStorage.getItem('userEmail');
      const savedEmail = await AsyncStorage.getItem('contactEmail');
      const savedPhone = await AsyncStorage.getItem('contactPhone');

      if(alreadyConfigured) setConfigured(alreadyConfigured);
      if (savedMyEmail) setMyEmail(savedMyEmail);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhoneNumber(savedPhone);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handleSave = async () => {
    if (myEmail && email && phoneNumber) {
      try {
        // Save data in AsyncStorage
        await AsyncStorage.setItem('isConfigured', 'true');
        if (myEmail) await AsyncStorage.setItem('userEmail', myEmail);
        if (email) await AsyncStorage.setItem('contactEmail', email);
        if (phoneNumber) await AsyncStorage.setItem('contactPhone', phoneNumber);

        Alert.alert('Changes successfully saved!', `Data saved to device`);
      } catch (error) {
        Alert.alert('Error', 'Failed to save data');
        console.log('Error saving data:', error);
      }
    } else {
      Alert.alert('Error', 'Please complete all fields before saving.');
    }
  };

  const clearData = async () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to delete all saved information?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('contactEmail');
              await AsyncStorage.removeItem('contactPhone');
              await AsyncStorage.removeItem('isConfigured');
              setEmail('');
              setPhoneNumber('');
              Alert.alert('Completed', 'All data has been deleted');
            } catch (error) {
              Alert.alert('Error', 'Could not delete the data');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        Configuration
      </Text>
      
      <Text style={styles.subtitle}>
        Update your personal information
      </Text>

       <View style={styles.formContainer}>
        {/* User's Email field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your email</Text>
          <TextInput
            style={styles.input}
            value={myEmail}
            onChangeText={setMyEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact Email field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your contact's email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact Phone Number field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your contact's cellphone number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+52 (656) 567 8900"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Clear Data Button */}
        <TouchableOpacity style={styles.clearButton} onPress={clearData}>
          <Text style={styles.clearButtonText}>Clear saved data</Text>
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
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
    marginBottom: 30,
    fontWeight: '600',
    color: '#666',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
