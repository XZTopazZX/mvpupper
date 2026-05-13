import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';

export default function SettingsScreen() {
  const { user, household, isPremium, setIsPremium } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [foodAlertHours, setFoodAlertHours] = useState('8');
  const [waterAlertHours, setWaterAlertHours] = useState('4');
  const [poopAlertHours, setPoopAlertHours] = useState('12');

  const handleUpgradePremium = async () => {
    Alert.alert(
      'Upgrade to MVPupper Premium',
      'Choose your subscription plan:',
      [
        {
          text: '$1.99/month',
          onPress: async () => {
            // In a real app, this would trigger Apple/Google IAP
            await AsyncStorage.setItem('isPremium', JSON.stringify(true));
            setIsPremium(true);
            Alert.alert('Success!', 'Welcome to MVPupper Premium! 🎉');
          },
        },
        {
          text: '$29.99/year',
          onPress: async () => {
            // In a real app, this would trigger Apple/Google IAP
            await AsyncStorage.setItem('isPremium', JSON.stringify(true));
            setIsPremium(true);
            Alert.alert('Success!', 'Welcome to MVPupper Premium! 🎉');
          },
        },
        { text: 'Cancel', onPress: () => {} },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('household');
          // Navigation would handle this
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.userCard}>
          <Text style={styles.userEmoji}>👤</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userSubtext}>
              {household?.name} • {household?.dogs.length} dog(s)
            </Text>
          </View>
        </View>
      </View>

      {/* Premium Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={[styles.card, isPremium && styles.premiumCard]}>
          <Text style={styles.cardTitle}>
            {isPremium ? '✨ MVPupper Premium' : '📦 Free Tier'}
          </Text>
          <Text style={styles.cardDescription}>
            {isPremium
              ? 'You have access to all premium features!'
              : 'Upgrade to unlock unlimited dogs, notifications, and more'}
          </Text>
          {!isPremium && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePremium}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications Settings (Premium Only) */}
      {isPremium && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Get alerts when your dogs need attention
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#8B4513' }}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.alertSetting}>
                <Text style={styles.alertLabel}>Alert if no food in (hours):</Text>
                <TextInput
                  style={styles.alertInput}
                  value={foodAlertHours}
                  onChangeText={setFoodAlertHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.alertSetting}>
                <Text style={styles.alertLabel}>Alert if no water in (hours):</Text>
                <TextInput
                  style={styles.alertInput}
                  value={waterAlertHours}
                  onChangeText={setWaterAlertHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.alertSetting}>
                <Text style={styles.alertLabel}>Alert if no poop in (hours):</Text>
                <TextInput
                  style={styles.alertInput}
                  value={poopAlertHours}
                  onChangeText={setPoopAlertHours}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* Household Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Household Members</Text>
        <View style={styles.membersList}>
          {household?.members.map((memberId, idx) => (
            <View key={idx} style={styles.memberItem}>
              <Text style={styles.memberEmoji}>👤</Text>
              <Text style={styles.memberName}>Member {idx + 1}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addMemberButton}>
          <Text style={styles.addMemberButtonText}>+ Invite Member</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Dogs Tracked</Text>
          <Text style={styles.infoValue}>{household?.dogs.length || 0}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  userEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  premiumCard: {
    backgroundColor: '#FFF8DC',
    borderColor: '#FFD700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  alertSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  alertLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  alertInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 50,
    textAlign: 'center',
    fontSize: 14,
  },
  membersList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  addMemberButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addMemberButtonText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
});
