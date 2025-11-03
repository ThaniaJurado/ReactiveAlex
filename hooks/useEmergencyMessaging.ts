import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

// Emergency messaging system for ReactiveAlex - handles email and SMS emergency alerts
export function useEmergencyMessaging() {
  const isMessagingActive = true; // Always active when user configuration is complete

  const sendEmergencyEmail = async (currentLocation: string) => {
    try {
      // Check if the device can send emails
      const isEmailAvailable = await MailComposer.isAvailableAsync();
      if (!isEmailAvailable) {
        Alert.alert(
          'Email Not Available', 
          'No email app is configured on this device. Please set up an email account in your device settings.'
        );
        return;
      }

      const userEmail = await AsyncStorage.getItem('userEmail');
      const emergencyContactEmail = await AsyncStorage.getItem('contactEmail');

      console.log('Email configuration check:', {
        userEmail: userEmail ? 'Set' : 'Not set',
        emergencyContactEmail: emergencyContactEmail ? 'Set' : 'Not set',
        mailComposerAvailable: isEmailAvailable
      });

      if (userEmail && emergencyContactEmail) {
        // Create emergency email content
        const emailSubject = 'ReactiveAlex - EMERGENCY ALERT';
        const emailBody = `EMERGENCY ALERT

The ReactiveAlex panic button has been activated.

Details:
• User: ${userEmail}
• Location: ${currentLocation}
• Date and Time: ${new Date().toLocaleString()}

Please contact the user immediately to verify their safety.

This is an automated message from the ReactiveAlex system.`;

        console.log('Opening email composer with emergency details...');

        // Open native email composer
        const emailResult = await MailComposer.composeAsync({
          recipients: [emergencyContactEmail],
          subject: emailSubject,
          body: emailBody,
          isHtml: false
        });

        console.log('Email composer result:', emailResult);

        if (emailResult.status === MailComposer.MailComposerStatus.SENT) {
          Alert.alert(
            'Emergency Email Sent!', 
            `Emergency email has been sent successfully to ${emergencyContactEmail}\n\nLocation: ${currentLocation}`
          );
        } else if (emailResult.status === MailComposer.MailComposerStatus.SAVED) {
          Alert.alert(
            'Email Saved to Drafts', 
            `Emergency email has been saved to drafts. Please send it manually to ${emergencyContactEmail}`
          );
        } else {
          Alert.alert(
            'Email Cancelled', 
            'Emergency email was cancelled. Your emergency alert was not sent.'
          );
        }

      } else {
        Alert.alert(
          'Configuration Missing', 
          `Please configure your email addresses first:\n\nUser Email: ${userEmail ? 'Set' : 'Missing'}\nEmergency Contact Email: ${emergencyContactEmail ? 'Set' : 'Missing'}`
        );
      }
    } catch (error) {
      console.log('Detailed error sending emergency email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Email Error', 
        `Could not send emergency email:\n\n${errorMessage}\n\nPlease check:\n• Email app is configured\n• Device has internet connection\n• Email addresses are valid`
      );
    }
  };

  const sendEmergencySMS = async (currentLocation: string) => {
    try {
      const emergencyContactPhone = await AsyncStorage.getItem('contactPhone');

      console.log('SMS configuration check:', {
        emergencyContactPhone: emergencyContactPhone ? 'Set' : 'Not set'
      });

      if (emergencyContactPhone) {
        // Check if the device can send SMS
        const isSMSAvailable = await SMS.isAvailableAsync();
        if (!isSMSAvailable) {
          Alert.alert(
            'SMS Not Available', 
            'SMS is not available on this device.'
          );
          return;
        }

        // Create emergency message
        const emergencyMessage = `EMERGENCY ALERT

ReactiveAlex panic button activated!

Location: ${currentLocation}
Time: ${new Date().toLocaleString()}

Please contact me immediately to verify my safety.

- ReactiveAlex Emergency System`;

        console.log('Opening SMS composer with emergency details...');

        // Open native SMS composer
        const smsResult = await SMS.sendSMSAsync([emergencyContactPhone], emergencyMessage);

        console.log('SMS composer result:', smsResult);

        if (smsResult.result === 'sent') {
          Alert.alert(
            'Emergency SMS Sent!', 
            `Emergency SMS has been sent successfully to ${emergencyContactPhone}\n\nLocation: ${currentLocation}`
          );
        } else if (smsResult.result === 'cancelled') {
          Alert.alert(
            'SMS Cancelled', 
            'Emergency SMS was cancelled. Your emergency alert was not sent.'
          );
        } else {
          Alert.alert(
            'SMS Error', 
            'Could not send emergency SMS. Please try again or use email.'
          );
        }

      } else {
        Alert.alert(
          'Phone Number Missing', 
          'Please configure your emergency contact phone number in the Configuration tab first.'
        );
      }
    } catch (error) {
      console.log('Detailed error sending emergency SMS:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'SMS Error', 
        `Could not send emergency SMS:\n\n${errorMessage}\n\nPlease check:\n• Phone number is valid\n• Device has SMS capability\n• Network connection is available`
      );
    }
  };

  const sendBothEmergencyMessages = async (currentLocation: string) => {
    try {
      // Send email and SMS in parallel
      await Promise.all([
        sendEmergencyEmail(currentLocation),
        sendEmergencySMS(currentLocation)
      ]);
    } catch (error) {
      console.log('Error sending emergency messages:', error);
    }
  };

  const triggerEmergencyAlert = async () => {
    try {
      // Try to get current location
      let userLocation = 'Location not available';
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentPosition = await Location.getCurrentPositionAsync({});
          const addressInfo = await Location.reverseGeocodeAsync({
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
          });
          
          if (addressInfo[0]) {
            userLocation = `${addressInfo[0].city}, ${addressInfo[0].region}, ${addressInfo[0].country}\nLat: ${currentPosition.coords.latitude.toFixed(6)}, Lng: ${currentPosition.coords.longitude.toFixed(6)}`;
          }
        }
      } catch (error) {
        console.log('Error getting location for emergency alert:', error);
      }

      Alert.alert(
        'EMERGENCY PANIC BUTTON ACTIVATED',
        `Do you need emergency help?\n\nCurrent location:\n${userLocation}`,
        [
          { 
            text: 'False Alarm', 
            style: 'cancel' 
          },
          { 
            text: 'YES, I NEED HELP', 
            style: 'destructive',
            onPress: () => {
              // Show options for how to send the emergency alert
              Alert.alert(
                'Choose Emergency Alert Method',
                'How would you like to send the emergency alert?',
                [
                  {
                    text: 'Email Only',
                    onPress: async () => await sendEmergencyEmail(userLocation)
                  },
                  {
                    text: 'SMS Only',
                    onPress: async () => await sendEmergencySMS(userLocation)
                  },
                  {
                    text: 'Both Email & SMS',
                    style: 'destructive',
                    onPress: async () => await sendBothEmergencyMessages(userLocation)
                  }
                ],
                { cancelable: false }
              );
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log('Error in emergency alert:', error);
    }
  };

  return {
    isMessagingActive,
    triggerEmergencyAlert,
  };
}