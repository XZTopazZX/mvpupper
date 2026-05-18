import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const { user, household, isPremium, setIsPremium, setUser, setHousehold } = useAppContext();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('household');
          setUser(null);
          setHousehold(null);
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleCopyInviteCode = () => {
    if (household?.inviteCode) {
      Alert.alert('Invite Code', household.inviteCode, [
        { text: 'Copy', onPress: () => {} },
        { text: 'Done' },
      ]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself');
      return;
    }

    Alert.alert('Remove Member', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Remove',
        onPress: async () => {
          if (household) {
            const updated = {
              ...household,
              members: household.members.filter(m => m.userId !== userId),
            };
            await AsyncStorage.setItem('household', JSON.stringify(updated));
            setHousehold(updated);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="person" size={20} color="#8B4513" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Name</Text>
                <Text style={styles.cardValue}>{user?.name || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Household Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="home" size={20} color="#8B4513" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Household Name</Text>
                <Text style={styles.cardValue}>{household?.name || 'No household'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.cardRow} onPress={handleCopyInviteCode}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="share" size={20} color="#8B4513" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Invite Code</Text>
                <Text style={styles.cardValue}>{household?.inviteCode || 'N/A'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members ({household?.members.length || 0})</Text>
          <View style={styles.card}>
            {household?.members.map((member, index) => (
              <View key={member.userId}>
                <View style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberJoined}>Joined {new Date(member.joinedAt).toLocaleDateString()}</Text>
                  </View>
                  {member.userId !== user?.id && (
                    <TouchableOpacity onPress={() => handleRemoveMember(member.userId)}>
                      <MaterialIcons name="close" size={20} color="#ccc" />
                    </TouchableOpacity>
                  )}
                </View>
                {index < (household?.members.length || 0) - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="notifications" size={20} color="#8B4513" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Enable Notifications</Text>
                <Text style={styles.cardValue}>Get reminders for your pup</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e0e0e0', true: '#FFD700' }}
                thumbColor={notificationsEnabled ? '#8B4513' : '#999'}
              />
            </View>
          </View>
        </View>

        {/* Premium Section */}
        {!isPremium && (
          <View style={styles.section}>
            <View style={styles.premiumCard}>
              <View style={styles.premiumIcon}>
                <MaterialIcons name="star" size={32} color="#FFD700" />
              </View>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumText}>Unlock medical records, vet appointments, and more</Text>
              <TouchableOpacity style={styles.premiumBtn} onPress={() => router.push('/premium')}>
                <Text style={styles.premiumBtnText}>Explore Premium</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerRow} onPress={handleLogout}>
              <View style={styles.dangerIcon}>
                <MaterialIcons name="logout" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.dangerText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333' },
  section: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF8DC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 2 },
  cardValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 52 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  memberAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: '#333' },
  memberJoined: { fontSize: 12, color: '#999', marginTop: 2 },
  premiumCard: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center', borderWidth: 2, borderColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  premiumIcon: { marginBottom: 12 },
  premiumTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  premiumText: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 14 },
  premiumBtn: { backgroundColor: '#8B4513', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  premiumBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  dangerIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFE5E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dangerText: { fontSize: 14, fontWeight: '600', color: '#FF6B6B' },
  spacer: { height: 40 },
});
