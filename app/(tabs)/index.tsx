
import { useUserConfiguration } from '@/hooks/useUserConfiguration';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const{isConfigured, isLoading} = useUserConfiguration();

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
        Welcome, you're located at
      </Text>
      
      <Text style={styles.description}>
    Lorem ipsum street, 42, Springfield.
      </Text>

   
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
});
