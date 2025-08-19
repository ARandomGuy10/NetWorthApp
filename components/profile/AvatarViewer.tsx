import React from 'react';
import { View, StyleSheet, Modal, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/lib/supabase';
import { useTheme } from '@/src/styles/theme/ThemeContext';

interface AvatarViewerProps {
  isVisible: boolean;
  onClose: () => void;
  imageUrl: string;
}

const AvatarViewer: React.FC<AvatarViewerProps> = ({ isVisible, onClose, imageUrl }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onClose}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: insets.top + 20,
    right: 20,
    padding: 10,
  },
});

export default AvatarViewer;