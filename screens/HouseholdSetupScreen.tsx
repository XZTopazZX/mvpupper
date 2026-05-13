import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../App';
import { nanoid } from 'nanoid';

export default function HouseholdSetupScreen() {
  const [householdName, setHouseholdName] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setHousehold } = useAppContext();

  const handleCreateHousehold = async () => {
    if (!householdName.trim() || !dogName.trim()) {
      Alert.alert('Error', 'Please enter household name and at least one dog name');
      return;
    }

    setLoading(true);
    try {
      const householdId = nanoid();
      const dogId = nanoid();

      const household = {
        id: householdId,
        name: householdName.trim(),
        dogs: [
          {
            id: dogId,
            name: dogName.trim(),
            breed: dogBreed.trim() || 'Unknown',
            age: parseInt(dogAge) || 0,
          },
        ],
        members: [user!.id],
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('household', JSON.stringify(household));
      setHousehold(household);
    } catch (error) {
      Alert.alert('Error', 'Failed to create household. Please try again.');
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Set Up Your Household</Text>
        <Text style={styles.subtitle}>Let's get to know your pups!</Text>

        <View style={styles.form}>
          {/* Household Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Household Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., The Dog Squad"
              value={householdName}
              onChangeText={setHouseholdName}
              placeholderTextColor="#ccc"
            />
            <Text style={styles.hint}>Give your household a fun name!</Text>
          </View>

          {/* First Dog */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your First Pup</Text>

            <Text style={styles.label}>Dog's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Titan"
              value={dogName}
              onChangeText={setDogName}
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., German Shepherd"
              value={dogBreed}
              onChangeText={setDogBreed}
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3"
              value={dogAge}
              onChangeText={setDogAge}
              keyboardType="number-pad"
              placeholderTextColor="#ccc"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateHousehold}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Household'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          You can add more dogs and household members later!
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  button: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
