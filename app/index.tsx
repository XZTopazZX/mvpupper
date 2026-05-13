import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppContext } from './_layout';

export default function Index() {
  const { user, household, loading } = useAppContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!household) {
    return <Redirect href="/setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
