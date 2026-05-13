import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { nanoid } from 'nanoid';
import { useAppContext } from './_layout';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAppContext();

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const userId = nanoid();
      const userData = { id: userId, name: name.trim() };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Navigation happens automatically via context change
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.emoji}>🐕</Text>
            <Text style={styles.title}>MVPupper</Text>
            <Text style={styles.subtitle}>Most Valuable Pupper</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>
              Track your dog's activities and keep your household in sync. No account needed—just enter your name and get started!
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              editable={!loading}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Getting started...' : 'Get Started'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What you can do:</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>📋</Text>
              <Text style={styles.featureText}>Track food, water, walks, and bathroom breaks</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>👥</Text>
              <Text style={styles.featureText}>Share with your household (up to 5 people)</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>🐶</Text>
              <Text style={styles.featureText}>Track up to 2 dogs for free</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>⭐</Text>
              <Text style={styles.featureText}>Upgrade for unlimited dogs & smart reminders</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  descriptionSection: {
    marginBottom: 40,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
