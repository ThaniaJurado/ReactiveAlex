import { useEmergencyContext } from '@/contexts/EmergencyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Yup from 'yup';
import { styles } from './configuration.styles';

// Validation schema
const validationSchema = Yup.object().shape({
  myEmail: Yup.string()
    .email('Please enter a valid email')
    .required('Your email is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Contact email is required'),
  phoneNumber: Yup.string()
    //.matches(/^\(\d{3}\)\s\d{3}\s\d{4}$/, 'Please use the format (XXX) XXX XXXX')
    .matches(/^\d{10}$/, 'Please use the format XXXXXXXXXX')
    .required('Contact phone number is required'),
});

export default function Configuration() {
  //Hooks for this component
  const { refreshConfiguration } = useEmergencyContext();

  //form data states
  const [myEmail, setMyEmail] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  //for form validation
  const [errors, setErrors] = useState<{myEmail?: string, email?: string, phoneNumber?: string}>({});

  /* LOAD SAVED DATA */
  const loadSavedData = useCallback(async () => {
    try {
      const [savedMyEmail, savedEmail, savedPhoneNumber] = await Promise.all([
        AsyncStorage.getItem('userEmail'),
        AsyncStorage.getItem('contactEmail'),
        AsyncStorage.getItem('contactPhone')
      ]);
      
      setMyEmail(savedMyEmail || '');
      setEmail(savedEmail || '');
      setPhoneNumber(savedPhoneNumber || '');
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Load saved data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  /* VALIDATION */
  const validateForm = async () => {
    try {
      await validationSchema.validate(
        { myEmail, email, phoneNumber }, 
        { abortEarly: false } //so it doesn't stop at the first error
      );
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: {myEmail?: string, email?: string, phoneNumber?: string} = {};
        error.inner.forEach((err) => {
          if (err.path) {
            //destructures the err.message to assign it to the correct field in the errors state
            validationErrors[err.path as keyof typeof validationErrors] = err.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  /* VALIDATES AND SAVES */
  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await Promise.all([
        AsyncStorage.setItem('userEmail', myEmail),
        AsyncStorage.setItem('contactEmail', email),
        AsyncStorage.setItem('contactPhone', phoneNumber),
        AsyncStorage.setItem('isConfigured', 'true')
      ]);
      
      Alert.alert('Success', 'Configuration saved successfully!');
      refreshConfiguration(); // Refresh the context
    } catch (error) {
      console.error('Error saving configuration:', error);
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
    }
  };

  /* CLEARS ALL DATA */
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
              await Promise.all([
                AsyncStorage.removeItem('userEmail'),
                AsyncStorage.removeItem('contactEmail'),
                AsyncStorage.removeItem('contactPhone'),
                AsyncStorage.removeItem('isConfigured')
              ]);
              
              setMyEmail('');
              setEmail('');
              setPhoneNumber('');
              setErrors({});
              Alert.alert('Completed', 'All data has been deleted');
              refreshConfiguration(); // Refresh the context
            } catch (error) {
              console.error('Error clearing configuration:', error);
              Alert.alert('Error', 'Failed to clear configuration. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Configuration</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Your Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your email</Text>
          <TextInput
            style={[
              styles.input,
              errors.myEmail && { borderColor: '#FF3B30', borderWidth: 2 }
            ]}
            value={myEmail}
            onChangeText={setMyEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          {errors.myEmail && (
            <Text style={styles.errorText}>{errors.myEmail}</Text>
          )}
        </View>

        {/* Your contact's email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact email</Text>
          <TextInput
            style={[
              styles.input,
              errors.email && { borderColor: '#FF3B30', borderWidth: 2 }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="contact@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Your contact's cellphone */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact phone number</Text>
          <TextInput
            style={[
              styles.input,
              errors.phoneNumber && { borderColor: '#FF3B30', borderWidth: 2 }
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="(656) 567 8900"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Clear all */}
        <TouchableOpacity style={styles.clearButton} onPress={clearData}>
          <Text style={styles.clearButtonText}>Clear saved data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


