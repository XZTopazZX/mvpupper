import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, Activity } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ACTIVITY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  food: { icon: 'restaurant', color: '#FF6B6B', label: 'Food' },
  water: { icon: 'local-drink', color: '#4ECDC4', label: 'Water' },
  poop: { icon: 'favorite', color: '#8B4513', label: 'Poop' },
  pee: { icon: 'opacity', color: '#FFD700', label: 'Pee' },
  walk: { icon: 'directions-walk', color: '#95E1D3', label: 'Walk' },
  treat: { icon: 'cake', color: '#F38181', label: 'Treat' },
};

export default function LogScreen() {
  const { household } = useAppContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadActivities();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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

  const deleteActivity = async (activityId: string) => {
    Alert.alert('Delete Activity', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const updated = activities.filter(a => a.id !== activityId);
          await AsyncStorage.setItem('activities', JSON.stringify(updated));
          setActivities(updated);
        },
        style: 'destructive',
      },
    ]);
  };

  const dogActivities = activities
    .filter(a => a.dogId === selectedDogId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const groupedActivities = dogActivities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const selectedDog = household?.dogs.find(d => d.id === selectedDogId);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity Log</Text>
          <Text style={styles.subtitle}>Track every moment with your pup</Text>
        </View>

        {/* Dog Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>Select Dog</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
            {household?.dogs.map(dog => (
              <TouchableOpacity
                key={dog.id}
                style={[styles.dogTab, selectedDogId === dog.id && styles.dogTabActive]}
                onPress={() => setSelectedDogId(dog.id)}
              >
                <Text style={[styles.dogTabText, selectedDogId === dog.id && styles.dogTabTextActive]}>
                  {dog.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Activities */}
        <View style={styles.activitiesSection}>
          {dogActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>No activities yet</Text>
              <Text style={styles.emptyText}>Start logging activities from the home screen</Text>
            </View>
          ) : (
            Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <View key={date}>
                <Text style={styles.dateHeader}>{date}</Text>
                {dayActivities.map(activity => {
                  const config = ACTIVITY_CONFIG[activity.type];
                  const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <View key={activity.id} style={styles.activityCard}>
                      <View style={[styles.activityIcon, { backgroundColor: config.color }]}>
                        <MaterialIcons name={config.icon as any} size={24} color="#fff" />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityType}>{config.label}</Text>
                        <Text style={styles.activityTime}>{time}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteActivity(activity.id)}>
                        <MaterialIcons name="close" size={20} color="#ccc" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#999' },
  selectorSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  dogList: { flexDirection: 'row', gap: 8 },
  dogTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  dogTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  activitiesSection: { paddingHorizontal: 16, paddingVertical: 12 },
  dateHeader: { fontSize: 13, fontWeight: '700', color: '#999', marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  activityIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityType: { fontSize: 14, fontWeight: '600', color: '#333' },
  activityTime: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, backgroundColor: '#fff', borderRadius: 14, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center', maxWidth: 200 },
  spacer: { height: 40 },
});
