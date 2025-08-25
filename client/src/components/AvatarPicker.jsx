import React, { useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AvatarPicker = ({ onAvatarChange, style }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user, setUser } = useAuth();

  const showImagePicker = () => {
    Alert.alert(
      'Choose Image Source',
      'Select where you want to get the image from',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openPhotoLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Error', 'Failed to open camera');
        return;
      }
      if (response.assets && response.assets[0]) {
        uploadImage(response.assets[0]);
      }
    });
  };

  const openPhotoLibrary = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Error', 'Failed to open photo library');
        return;
      }
      if (response.assets && response.assets[0]) {
        uploadImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async (imageAsset) => {
    if (!imageAsset.uri) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || 'avatar.jpg',
      });

      const { data } = await api.post('/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user context with new avatar
      setUser(prev => ({ ...prev, avatar: data.avatar }));
      
      if (onAvatarChange) {
        onAvatarChange(data.avatar);
      }

      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    Alert.alert(
      'Remove Avatar',
      'Are you sure you want to remove your avatar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploading(true);
              const { data } = await api.delete('/avatar/remove');
              
              // Update user context
              setUser(prev => ({ ...prev, avatar: '' }));
              
              if (onAvatarChange) {
                onAvatarChange('');
              }

              Alert.alert('Success', 'Avatar removed successfully!');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove avatar');
            } finally {
              setIsUploading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={showImagePicker}
        disabled={isUploading}
      >
        <Icon name="add-a-photo" size={24} color="#fff" />
        <Text style={styles.buttonText}>
          {isUploading ? 'Uploading...' : 'Change Avatar'}
        </Text>
      </TouchableOpacity>

      {user?.avatar && (
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={removeAvatar}
          disabled={isUploading}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.buttonText}>Remove Avatar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AvatarPicker;
