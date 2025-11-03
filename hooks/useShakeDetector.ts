import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

//For now, since it's difficult to test the shake detection within Expo Go, this will simulate it with a button
export function useShakeDetector() {
  const isActive = true; // Always active since it's just a button now

  const sendEmergencyEmail = async (emergencyLocation: string) => {
    try {
      // Check if the device can send emails
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          '❌ Email Not Available', 
          'No email app is configured on this device. Please set up an email account in your device settings.'
        );
        return;
      }

      const userEmail = await AsyncStorage.getItem('userEmail');
      const contactEmail = await AsyncStorage.getItem('contactEmail');

      console.log('Email configuration check:', {
        userEmail: userEmail ? 'Set' : 'Not set',
        contactEmail: contactEmail ? 'Set' : 'Not set',
        mailComposerAvailable: isAvailable
      });

      if (userEmail && contactEmail) {
        // Create emergency email content
        const subject = 'ReactiveAlex - 🚨 EMERGENCY ALERT 🚨';
        const body = `🚨 EMERGENCY ALERT 🚨

The ReactiveAlex panic button has been activated.

Details:
• User: ${userEmail}
• Location: ${emergencyLocation}
• Date and Time: ${new Date().toLocaleString()}

Please contact the user immediately to verify their safety.

This is an automated message from the ReactiveAlex system.`;

        console.log('Opening email composer with emergency details...');

        // Open native email composer
        const result = await MailComposer.composeAsync({
          recipients: [contactEmail],
          subject: subject,
          body: body,
          isHtml: false
        });

        console.log('Email composer result:', result);

        if (result.status === MailComposer.MailComposerStatus.SENT) {
          Alert.alert(
            '✅ Emergency Email Sent!', 
            `Emergency email has been sent successfully to ${contactEmail}\n\nLocation: ${emergencyLocation}`
          );
        } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
          Alert.alert(
            '📧 Email Saved to Drafts', 
            `Emergency email has been saved to drafts. Please send it manually to ${contactEmail}`
          );
        } else {
          Alert.alert(
            '⚠️ Email Cancelled', 
            'Emergency email was cancelled. Your emergency alert was not sent.'
          );
        }

      } else {
        Alert.alert(
          '❌ Configuration Missing', 
          `Please configure your email addresses first:\n\nUser Email: ${userEmail ? '✅ Set' : '❌ Missing'}\nContact Email: ${contactEmail ? '✅ Set' : '❌ Missing'}`
        );
      }
    } catch (error) {
      console.log('Detailed error sending emergency email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        '❌ Email Error', 
        `Could not send emergency email:\n\n${errorMessage}\n\nPlease check:\n• Email app is configured\n• Device has internet connection\n• Email addresses are valid`
      );
    }
  };

  const sendEmergencySMS = async (emergencyLocation: string) => {
    try {
      const contactPhone = await AsyncStorage.getItem('contactPhone');

      console.log('SMS configuration check:', {
        contactPhone: contactPhone ? 'Set' : 'Not set'
      });

      if (contactPhone) {
        // Check if the device can send SMS
        const isAvailable = await SMS.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert(
            '❌ SMS Not Available', 
            'SMS is not available on this device.'
          );
          return;
        }

        // Create emergency message
        const message = `🚨 EMERGENCY ALERT 🚨

ReactiveAlex panic button activated!

Location: ${emergencyLocation}
Time: ${new Date().toLocaleString()}

Please contact me immediately to verify my safety.

- ReactiveAlex Emergency System`;

        console.log('Opening SMS composer with emergency details...');

        // Open native SMS composer
        const result = await SMS.sendSMSAsync([contactPhone], message);

        console.log('SMS composer result:', result);

        if (result.result === 'sent') {
          Alert.alert(
            '✅ Emergency SMS Sent!', 
            `Emergency SMS has been sent successfully to ${contactPhone}\n\nLocation: ${emergencyLocation}`
          );
        } else if (result.result === 'cancelled') {
          Alert.alert(
            '⚠️ SMS Cancelled', 
            'Emergency SMS was cancelled. Your emergency alert was not sent.'
          );
        } else {
          Alert.alert(
            '❌ SMS Error', 
            'Could not send emergency SMS. Please try again or use email.'
          );
        }

      } else {
        Alert.alert(
          '❌ Phone Number Missing', 
          'Please configure your emergency contact phone number in the Configuration tab first.'
        );
      }
    } catch (error) {
      console.log('Detailed error sending emergency SMS:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        '❌ SMS Error', 
        `Could not send emergency SMS:\n\n${errorMessage}\n\nPlease check:\n• Phone number is valid\n• Device has SMS capability\n• Network connection is available`
      );
    }
  };

  const sendBothEmergencyAlerts = async (emergencyLocation: string) => {
    try {
      // Send email and SMS in parallel
      await Promise.all([
        sendEmergencyEmail(emergencyLocation),
        sendEmergencySMS(emergencyLocation)
      ]);
    } catch (error) {
      console.log('Error sending emergency alerts:', error);
    }
  };

  const triggerPanicAlert = async () => {
    try {
      // Try to get current location
      let locationText = 'Location not available';
      
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
        '🚨 EMERGENCY PANIC BUTTON ACTIVATED',
        `Do you need emergency help?\n\nCurrent location:\n${locationText}`,
        [
          { 
            text: 'False Alarm', 
            style: 'cancel' 
          },
          { 
            text: '🆘 YES, I NEED HELP', 
            style: 'destructive',
            onPress: () => {
              // Show options for how to send the alert
              Alert.alert(
                '🚨 Choose Emergency Alert Method',
                'How would you like to send the emergency alert?',
                [
                  {
                    text: '📧 Email Only',
                    onPress: async () => await sendEmergencyEmail(locationText)
                  },
                  {
                    text: '📱 SMS Only',
                    onPress: async () => await sendEmergencySMS(locationText)
                  },
                  {
                    text: '🚀 Both Email & SMS',
                    style: 'destructive',
                    onPress: async () => await sendBothEmergencyAlerts(locationText)
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
      console.log('Error in panic alert:', error);
    }
  };

  return {
    isActive,
    triggerPanicAlert,
  };
}