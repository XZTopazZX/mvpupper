import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, Activity } from '../_layout';

const ACTIVITY_TYPES = [
  { type: 'food', label: 'Food', emoji: '🍖' },
  { type: 'water', label: 'Water', emoji: '💧' },
  { type: 'poop', label: 'Poop', emoji: '💩' },
  { type: 'pee', label: 'Pee', emoji: '🚽' },
  { type: 'walk', label: 'Walk', emoji: '🚶' },
  { type: 'treat', label: 'Treat', emoji: '🦴' },
];

export default function HomeScreen() {
  const { household, user, isPremium } = useAppContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
  }, [household]);

  const loadActivities = async () => {
    try {
      const saved = await AsyncStorage.getItem('activities');
      if (saved) {
        setActivities(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const logActivity = async (activityType: string) => {
    if (!selectedDogId) {
      Alert.alert('Error', 'Please select a dog first');
      return;
    }

    const newActivity: Activity = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      dogId: selectedDogId,
      type: activityType as any,
      timestamp: new Date().toISOString(),
      userId: user!.id,
    };

    try {
      const updated = [...activities, newActivity];
      await AsyncStorage.setItem('activities', JSON.stringify(updated));
      setActivities(updated);

      const activityLabel = ACTIVITY_TYPES.find(a => a.type === activityType)?.label;
      const dogName = household?.dogs.find(d => d.id === selectedDogId)?.name;
      Alert.alert('Logged!', `${activityLabel} recorded for ${dogName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log activity');
      console.error('Error logging activity:', error);
    }
  };

  const recentActivities = activities
    .filter(a => a.dogId === selectedDogId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const selectedDog = household?.dogs.find(d => d.id === selectedDogId);

  return (
    <ScrollView style={styles.container}>
      {/* Dog Selector */}
      <View style={styles.dogSelector}>
        <Text style={styles.sectionTitle}>Select Your Pup</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
          {household?.dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={[
                styles.dogCard,
                selectedDogId === dog.id && styles.dogCardActive,
              ]}
              onPress={() => setSelectedDogId(dog.id)}
            >
              <Text style={styles.dogEmoji}>🐕</Text>
              <Text style={styles.dogName}>{dog.name}</Text>
              <Text style={styles.dogBreed}>{dog.breed}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activity Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Activity</Text>
        <View style={styles.activityGrid}>
          {ACTIVITY_TYPES.map(activity => (
            <TouchableOpacity
              key={activity.type}
              style={styles.activityButton}
              onPress={() => logActivity(activity.type)}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text style={styles.activityLabel}>{activity.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivities.length > 0 ? (
          recentActivities.map(item => {
            const activityLabel = ACTIVITY_TYPES.find(a => a.type === item.type)?.label;
            const time = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View key={item.id} style={styles.activityItem}>
                <Text style={styles.activityTime}>{time}</Text>
                <Text style={styles.activityType}>{activityLabel}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No activities logged yet</Text>
        )}
      </View>

      {/* Premium Upsell */}
      {!isPremium && household && household.dogs.length >= 2 && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumTitle}>🌟 Upgrade to MVPupper Premium</Text>
          <Text style={styles.premiumText}>Unlock unlimited dogs, medical tracking, and smart reminders!</Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dogSelector: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dogList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dogCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dogCardActive: {
    backgroundColor: '#fff',
    borderColor: '#8B4513',
  },
  dogEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  dogName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dogBreed: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityButton: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityTime: {
    fontSize: 14,
    color: '#999',
  },
  activityType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  premiumButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
