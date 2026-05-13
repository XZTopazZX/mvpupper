import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, Activity } from '../App';

const ACTIVITY_LABELS: Record<string, string> = {
  food: '🍖 Food',
  water: '💧 Water',
  poop: '💩 Poop',
  pee: '🚽 Pee',
  walk: '🚶 Walk',
  treat: '🦴 Treat',
};

export default function ActivityLogScreen() {
  const { household } = useAppContext();
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

  const deleteActivity = async (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updated = activities.filter(a => a.id !== activityId);
              await AsyncStorage.setItem('activities', JSON.stringify(updated));
              setActivities(updated);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const filteredActivities = activities
    .filter(a => a.dogId === selectedDogId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <View style={styles.container}>
      {/* Dog Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Dog</Text>
        <FlatList
          horizontal
          scrollEnabled={false}
          data={household?.dogs || []}
          keyExtractor={dog => dog.id}
          renderItem={({ item: dog }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedDogId === dog.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedDogId(dog.id)}
            >
              <Text style={styles.filterButtonText}>{dog.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const date = new Date(item.timestamp);
          const dateStr = date.toLocaleDateString();
          const timeStr = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.activityItem}
              onLongPress={() => deleteActivity(item.id)}
            >
              <View style={styles.activityContent}>
                <Text style={styles.activityLabel}>
                  {ACTIVITY_LABELS[item.type] || item.type}
                </Text>
                <Text style={styles.activityTime}>
                  {dateStr} at {timeStr}
                </Text>
              </View>
              <Text style={styles.deleteHint}>Hold to delete</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities logged yet</Text>
            <Text style={styles.emptySubtext}>
              Go to Home and start logging!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  filterList: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#8B4513',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteHint: {
    fontSize: 10,
    color: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
});
