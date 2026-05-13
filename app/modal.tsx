import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Modal</Text>
      <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
        <Text style={{ color: '#0a7ea4' }}>Go to home screen</Text>
      </Link>
    </View>
  );
}
