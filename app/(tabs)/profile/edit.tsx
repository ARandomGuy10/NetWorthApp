import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { toByteArray } from 'base64-js';
import * as ImagePicker from 'expo-image-picker';

import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/providers/ToastProvider';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import AvatarViewer from '@/components/profile/AvatarViewer';
import { Theme, ProfileUpdate } from '@/lib/supabase';

const MAX_AVATAR_SIZE_MB = 5;

const getPathFromUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const bucketName = 'avatars';
  // Split the URL by the bucket name to isolate the file path
  const urlParts = url.split(`/${bucketName}/`);
  return urlParts.length > 1 ? urlParts[1] : null;
};

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { showToast } = useToast();
  const supabase = useSupabase();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
  });
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);
  const [newAvatarMimeType, setNewAvatarMimeType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [isAvatarViewerVisible, setIsAvatarViewerVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are needed to select a photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      // NOTE: Using the deprecated `MediaTypeOptions` because `MediaType`
      // seems to have issues with permissions in the Expo Go client
      // without a custom development build.
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: false, // We don't need exif data, helps reduce size
      base64: true, // Request base64 data
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        Alert.alert('Image Too Large', `Please select an image smaller than ${MAX_AVATAR_SIZE_MB}MB.`);
        return;
      }
      setNewAvatarUri(asset.uri);
      setNewAvatarBase64(asset.base64 || null);
      setNewAvatarMimeType(asset.mimeType || 'image/jpeg');
      setShouldRemoveAvatar(false); // A new photo overrides removal
    }
  };

  const handleRemoveAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewAvatarUri(null);
    setNewAvatarBase64(null);
    setNewAvatarMimeType(null);
    setShouldRemoveAvatar(true);
  };

  const getAvatarSourceUri = () => {
    if (newAvatarUri) return newAvatarUri;
    if (shouldRemoveAvatar) return 'https://via.placeholder.com/100';
    return profile?.avatar_url || 'https://via.placeholder.com/100';
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUploading(true);

    if (!formData.first_name.trim()) {
      Alert.alert('First Name Required', 'Your first name cannot be empty.');
      setIsUploading(false);
      return;
    }

    const oldAvatarPath = getPathFromUrl(profile?.avatar_url);

    const updatedProfileData: ProfileUpdate = {
      first_name: formData.first_name,
      last_name: formData.last_name,
    };

    if (shouldRemoveAvatar) {
      updatedProfileData.avatar_url = null;
    } else if (newAvatarBase64 && newAvatarUri && profile) {
      try {
        const arrayBuffer = toByteArray(newAvatarBase64);
        const fileExt = newAvatarUri.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${profile.id}/${new Date().getTime()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, arrayBuffer, {
            contentType: newAvatarMimeType || 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          showToast('Upload Failed', 'error', { text: uploadError.message });
          router.back();
          return;
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        updatedProfileData.avatar_url = urlData.publicUrl;
      } catch (error: any) {
        showToast('Upload Failed', 'error', { text: error.message || 'An unexpected error occurred.' });
        router.back();
        return;
      }
    }

    try {
      await updateProfileMutation.mutateAsync(updatedProfileData);

      // If profile update is successful, and we have an old path to delete...
      // This happens if we removed the avatar OR uploaded a new one.
      if (oldAvatarPath && (shouldRemoveAvatar || (newAvatarBase64 && newAvatarUri))) {
        const { error: removeError } = await supabase.storage.from('avatars').remove([oldAvatarPath]);
        if (removeError) {
          // Log the error, but don't block the user. The main goal (profile update) succeeded.
          console.error('Failed to remove old avatar:', removeError.message);
        }
      }

      router.back();
    } catch (error: any) {
      console.error('Profile update failed:', error);
      router.back();
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isLoadingProfile || updateProfileMutation.isPending || isUploading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          {isLoadingProfile ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xxl }} />
          ) : (
            <View>
              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={() => setIsAvatarViewerVisible(true)} disabled={isLoading || !getAvatarSourceUri().startsWith('http')}>
                  <Image
                    source={{ uri: getAvatarSourceUri() }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <View style={styles.avatarActions}>
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handlePickAvatar}
                    disabled={isLoading}
                  >
                    <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.changePhotoButtonText}>Change Photo</Text>
                  </TouchableOpacity>
                  {(newAvatarUri || profile?.avatar_url) && !shouldRemoveAvatar && (
                    <TouchableOpacity
                      style={[styles.changePhotoButton, styles.removeButton]}
                      onPress={handleRemoveAvatar}
                      disabled={isLoading}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                      <Text style={[styles.changePhotoButtonText, { color: theme.colors.error }]}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.first_name}
                  onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                  placeholder="Enter your first name"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.last_name}
                  onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                  placeholder="Enter your last name"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.text.inverse} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  disabled={isLoading}
                >
                  <Text style={[styles.cancelButtonText, isLoading && { opacity: 0.5 }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <AvatarViewer
        isVisible={isAvatarViewerVisible}
        onClose={() => setIsAvatarViewerVisible(false)}
        imageUrl={getAvatarSourceUri()}
      />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    marginBottom: theme.spacing.md,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  changePhotoButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: theme.spacing.sm,
  },
  removeButton: {
    backgroundColor: theme.colors.background.card,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 52,
    ...theme.shadows.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  cancelButton: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
});