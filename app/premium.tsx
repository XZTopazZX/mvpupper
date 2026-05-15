import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppContext } from './_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function PremiumScreen() {
  const { isPremium, setIsPremium } = useAppContext();
  const router = useRouter();

  const handleSubscribe = async (plan: string) => {
    // In production, this would integrate with RevenueCat or Stripe
    Alert.alert(
      'Subscribe to Premium',
      `You selected the ${plan} plan. In a production app, this would open the payment flow.`,
      [
        { text: 'Cancel' },
        {
          text: 'Activate (Demo)',
          onPress: async () => {
            setIsPremium(true);
            await AsyncStorage.setItem('isPremium', JSON.stringify(true));
            Alert.alert('Welcome to Premium!', 'All features are now unlocked.');
            router.back();
          },
        },
      ]
    );
  };

  if (isPremium) {
    return (
      <View style={styles.activeContainer}>
        <MaterialIcons name="star" size={64} color="#FFD700" />
        <Text style={styles.activeTitle}>Premium Active</Text>
        <Text style={styles.activeSubtitle}>You have access to all premium features</Text>
        <View style={styles.featuresList}>
          <FeatureRow icon="pets" text="Unlimited dogs" />
          <FeatureRow icon="photo-camera" text="Dog photo profiles" />
          <FeatureRow icon="local-hospital" text="Medical records" />
          <FeatureRow icon="event" text="Vet appointments" />
          <FeatureRow icon="bar-chart" text="Activity statistics" />
          <FeatureRow icon="notifications" text="Smart reminders" />
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>👑</Text>
        <Text style={styles.heroTitle}>MVPupper Premium</Text>
        <Text style={styles.heroSubtitle}>
          The ultimate dog activity tracker for serious pet parents
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What You Get</Text>
        <FeatureRow icon="pets" text="Unlimited dogs per household" />
        <FeatureRow icon="photo-camera" text="Dog photo profiles" />
        <FeatureRow icon="local-hospital" text="Medical records tracking" />
        <FeatureRow icon="event" text="Vet appointment scheduling" />
        <FeatureRow icon="bar-chart" text="Activity statistics & insights" />
        <FeatureRow icon="notifications" text="Smart reminders & alerts" />
        <FeatureRow icon="people" text="Household sharing (unlimited)" />
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        <TouchableOpacity style={styles.planCard} onPress={() => handleSubscribe('Monthly')}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planPrice}>$1.99/mo</Text>
          </View>
          <Text style={styles.planDescription}>Cancel anytime</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.planCard, styles.planCardBest]} onPress={() => handleSubscribe('Annual')}>
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planPrice}>$19.99/yr</Text>
          </View>
          <Text style={styles.planDescription}>Save 16% - just $1.67/mo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.planCard} onPress={() => handleSubscribe('Lifetime')}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Lifetime</Text>
            <Text style={styles.planPrice}>$29.99</Text>
          </View>
          <Text style={styles.planDescription}>One-time purchase, forever access</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>7-day free trial included with all plans</Text>
      </View>
    </ScrollView>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <MaterialIcons name={icon as any} size={24} color="#8B4513" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  activeContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  activeTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  activeSubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  featuresList: { width: '100%', marginBottom: 24 },
  backButton: { backgroundColor: '#8B4513', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: '600' },
  hero: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFF8DC' },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#8B4513', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  section: { paddingHorizontal: 16, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  featureText: { fontSize: 14, color: '#333', fontWeight: '500' },
  planCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  planCardBest: { borderColor: '#FFD700', borderWidth: 2, backgroundColor: '#FFFEF5' },
  bestBadge: { position: 'absolute', top: -10, right: 12, backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  bestBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#8B4513' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  planName: { fontSize: 16, fontWeight: '600', color: '#333' },
  planPrice: { fontSize: 18, fontWeight: 'bold', color: '#8B4513' },
  planDescription: { fontSize: 12, color: '#999' },
  footer: { paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999' },
});
