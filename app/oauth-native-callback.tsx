import {View, ActivityIndicator, StyleSheet} from 'react-native';

export default function OAuthNativeCallback() {
  // Don't handle navigation here - let the auth layout do it
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
