import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [3, 4, 2, 5, 6, 4, 3] }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Stats</Text>
      </View>
      <View style={styles.chartContainer}>
        <LineChart data={data} width={Dimensions.get('window').width - 32} height={220} chartConfig={{ backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: () => '#8B4513', strokeWidth: 2 }} />
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Walks</Text>
          <Text style={styles.statValue}>24</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Duration</Text>
          <Text style={styles.statValue}>32m</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Distance</Text>
          <Text style={styles.statValue}>12.5km</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Calories Burned</Text>
          <Text style={styles.statValue}>1,240</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  chartContainer: { marginHorizontal: 16, marginVertical: 20, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFF8DC', borderRadius: 8, padding: 16, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  statLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#8B4513' },
});
