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

const ACTIVITY_TYPES = [
  { type: 'food', label: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { type: 'water', label: 'Water', icon: 'local-drink', color: '#4ECDC4' },
  { type: 'poop', label: 'Poop', icon: 'favorite', color: '#8B4513' },
  { type: 'pee', label: 'Pee', icon: 'opacity', color: '#FFD700' },
  { type: 'walk', label: 'Walk', icon: 'directions-walk', color: '#95E1D3' },
  { type: 'treat', label: 'Treat', icon: 'cake', color: '#F38181' },
];

export default function HomeScreen() {
  const { household, user } = useAppContext();
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
      Alert.alert('✅ Logged!', `${activityLabel} recorded for ${dogName}`);
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.householdName}>{household?.name}</Text>
          </View>
          <View style={styles.memberBadge}>
            <MaterialIcons name="people" size={16} color="#8B4513" />
            <Text style={styles.memberCount}>{household?.members.length || 0}</Text>
          </View>
        </View>

        {/* Dog Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>Select Your Pup</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
            {household?.dogs.map(dog => (
              <TouchableOpacity
                key={dog.id}
                style={[styles.dogCard, selectedDogId === dog.id && styles.dogCardActive]}
                onPress={() => setSelectedDogId(dog.id)}
              >
                <View style={[styles.dogAvatar, selectedDogId === dog.id && styles.dogAvatarActive]}>
                  <MaterialIcons name="pets" size={24} color={selectedDogId === dog.id ? '#fff' : '#8B4513'} />
                </View>
                <Text style={[styles.dogName, selectedDogId === dog.id && styles.dogNameActive]}>{dog.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        {selectedDog && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedDog.age}</Text>
              <Text style={styles.statLabel}>Years Old</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedDog.breed}</Text>
              <Text style={styles.statLabel}>Breed</Text>
            </View>
          </View>
        )}

        {/* Activity Logger */}
        <View style={styles.loggerSection}>
          <Text style={styles.sectionLabel}>Log Activity</Text>
          <View style={styles.activityGrid}>
            {ACTIVITY_TYPES.map(activity => (
              <TouchableOpacity
                key={activity.type}
                style={styles.activityBtn}
                onPress={() => logActivity(activity.type)}
              >
                <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                  <MaterialIcons name={activity.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.activityLabel}>{activity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          {recentActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={40} color="#ddd" />
              <Text style={styles.emptyText}>No activities logged yet</Text>
            </View>
          ) : (
            recentActivities.map(activity => {
              const actType = ACTIVITY_TYPES.find(a => a.type === activity.type);
              const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityItemIcon, { backgroundColor: actType?.color }]}>
                    <MaterialIcons name={actType?.icon as any} size={20} color="#fff" />
                  </View>
                  <View style={styles.activityItemInfo}>
                    <Text style={styles.activityItemLabel}>{actType?.label}</Text>
                    <Text style={styles.activityItemTime}>{time}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  greeting: { fontSize: 13, color: '#999', marginBottom: 4 },
  householdName: { fontSize: 24, fontWeight: '700', color: '#333' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8DC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  memberCount: { fontSize: 13, fontWeight: '600', color: '#8B4513' },
  selectorSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  dogList: { flexDirection: 'row', gap: 10 },
  dogCard: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: '#f0f0f0' },
  dogCardActive: { borderColor: '#8B4513', backgroundColor: '#FFF8DC' },
  dogAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  dogAvatarActive: { backgroundColor: '#8B4513' },
  dogName: { fontSize: 12, fontWeight: '600', color: '#666' },
  dogNameActive: { color: '#8B4513' },
  statsCard: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', marginHorizontal: 12 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#8B4513', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '500' },
  loggerSection: { paddingHorizontal: 16, paddingVertical: 16 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  activityBtn: { width: '31%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  activityIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  activityLabel: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  recentSection: { paddingHorizontal: 16, paddingVertical: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderRadius: 14 },
  emptyText: { fontSize: 13, color: '#ccc', marginTop: 8 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  activityItemIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityItemInfo: { flex: 1 },
  activityItemLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  activityItemTime: { fontSize: 11, color: '#999', marginTop: 2 },
  spacer: { height: 40 },
});
