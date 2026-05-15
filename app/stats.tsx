import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, Activity } from './_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function StatsScreen() {
  const { household } = useAppContext();
  const [selectedDogId, setSelectedDogId] = useState(household?.dogs[0]?.id || '');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ walks: 0, feeds: 0, waters: 0, poops: 0, treats: 0 });

  useEffect(() => {
    loadActivities();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
  }, [household]);

  useEffect(() => {
    calculateStats();
  }, [activities, selectedDogId]);

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

  const calculateStats = () => {
    const dogActivities = activities.filter(a => a.dogId === selectedDogId);
    const counts = {
      walks: dogActivities.filter(a => a.type === 'walk').length,
      feeds: dogActivities.filter(a => a.type === 'food').length,
      waters: dogActivities.filter(a => a.type === 'water').length,
      poops: dogActivities.filter(a => a.type === 'poop').length,
      treats: dogActivities.filter(a => a.type === 'treat').length,
    };
    setStats(counts);
  };

  const selectedDog = household?.dogs.find(d => d.id === selectedDogId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Stats</Text>
      </View>

      {/* Dog Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogSelector}>
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

      {/* Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>{selectedDog?.name}'s Activity This Week</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="directions-walk" size={28} color="#8B4513" />
            <Text style={styles.summaryValue}>{stats.walks}</Text>
            <Text style={styles.summaryLabel}>Walks</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="restaurant" size={28} color="#8B4513" />
            <Text style={styles.summaryValue}>{stats.feeds}</Text>
            <Text style={styles.summaryLabel}>Meals</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="local-drink" size={28} color="#8B4513" />
            <Text style={styles.summaryValue}>{stats.waters}</Text>
            <Text style={styles.summaryLabel}>Waters</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="favorite" size={28} color="#8B4513" />
            <Text style={styles.summaryValue}>{stats.treats}</Text>
            <Text style={styles.summaryLabel}>Treats</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Breakdown</Text>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialIcons name="directions-walk" size={24} color="#8B4513" />
            <Text style={styles.statLabel}>Total Walks</Text>
            <Text style={styles.statValue}>{stats.walks}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialIcons name="restaurant" size={24} color="#8B4513" />
            <Text style={styles.statLabel}>Meals Fed</Text>
            <Text style={styles.statValue}>{stats.feeds}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialIcons name="local-drink" size={24} color="#8B4513" />
            <Text style={styles.statLabel}>Water Breaks</Text>
            <Text style={styles.statValue}>{stats.waters}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <MaterialIcons name="favorite" size={24} color="#8B4513" />
            <Text style={styles.statLabel}>Treats Given</Text>
            <Text style={styles.statValue}>{stats.treats}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  dogSelector: { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  dogTab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513' },
  dogTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  summarySection: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#FFF8DC', marginHorizontal: 16, marginVertical: 12, borderRadius: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#8B4513', marginVertical: 4 },
  summaryLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  statsSection: { paddingHorizontal: 16, paddingVertical: 20 },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  statCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#8B4513' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#8B4513' },
});
