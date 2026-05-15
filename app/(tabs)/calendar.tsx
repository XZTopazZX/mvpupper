import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  date: string;
  notes?: string;
  createdAt: string;
}

interface MedicalRecord {
  id: string;
  dogId: string;
  title: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export default function CalendarScreen() {
  const { isPremium, household } = useAppContext();
  const router = useRouter();
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedDogId, setSelectedDogId] = useState(household?.dogs[0]?.id || '');

  useEffect(() => {
    loadData();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
  }, [household]);

  const loadData = async () => {
    try {
      const [aptsData, recsData] = await Promise.all([
        AsyncStorage.getItem('vetAppointments'),
        AsyncStorage.getItem('medicalRecords'),
      ]);
      if (aptsData) setAppointments(JSON.parse(aptsData));
      if (recsData) setRecords(JSON.parse(recsData));
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  if (!isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumIcon}>🔒</Text>
        <Text style={styles.premiumTitle}>Premium Feature</Text>
        <Text style={styles.premiumText}>
          Unlock the calendar and appointment reminders with MVPupper Premium
        </Text>
        <View style={styles.features}>
          <Text style={styles.featureItem}>📅 Vet appointments</Text>
          <Text style={styles.featureItem}>💊 Medical records</Text>
          <Text style={styles.featureItem}>💉 Vaccine tracking</Text>
          <Text style={styles.featureItem}>✂️ Health history</Text>
        </View>
        <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/(tabs)/settings')}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dogAppointments = appointments.filter(a => a.dogId === selectedDogId);
  const dogRecords = records.filter(r => r.dogId === selectedDogId);
  const allItems = [
    ...dogAppointments.map(a => ({ ...a, type: 'appointment' as const })),
    ...dogRecords.map(r => ({ ...r, type: 'record' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments & Records</Text>
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

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('../vet-appointments')}
        >
          <MaterialIcons name="local-hospital" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Vet Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('../medical-records')}
        >
          <MaterialIcons name="description" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Medical Record</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      {allItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No appointments or records</Text>
          <Text style={styles.emptySubtext}>Add vet visits and medical records</Text>
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemContent}>
                <MaterialIcons
                  name={item.type === 'appointment' ? 'local-hospital' : 'description'}
                  size={24}
                  color="#8B4513"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>
                    {item.type === 'appointment' ? (item as VetAppointment).vetName : (item as MedicalRecord).title}
                  </Text>
                  <Text style={styles.itemDate}>{item.date}</Text>
                  {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                </View>
              </View>
              <View style={[styles.itemBadge, item.type === 'appointment' ? styles.appointmentBadge : styles.recordBadge]}>
                <Text style={styles.badgeText}>{item.type === 'appointment' ? 'Apt' : 'Rec'}</Text>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  premiumText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    paddingLeft: 20,
  },
  upgradeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  dogSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  dogTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  dogTabActive: {
    backgroundColor: '#8B4513',
  },
  dogTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dogTabTextActive: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentBadge: {
    backgroundColor: '#FFF8DC',
  },
  recordBadge: {
    backgroundColor: '#E8F5E9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B4513',
  },
});
