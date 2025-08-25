import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Avatar = ({ 
  user, 
  size = 50, 
  onPress, 
  showEditIcon = false,
  style 
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (user?.avatar && user.avatar.trim() !== '') {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View style={[styles.container, avatarStyle, style]}>
          <Image
            source={{ uri: user.avatar }}
            style={[styles.image, avatarStyle]}
            resizeMode="cover"
          />
          {showEditIcon && (
            <View style={styles.editIconContainer}>
              <Icon name="edit" size={16} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View style={[styles.container, avatarStyle, styles.placeholder, style]}>
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {getInitials(user?.name)}
        </Text>
        {showEditIcon && (
          <View style={styles.editIconContainer}>
            <Icon name="edit" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0b0d12',
  },
});

export default Avatar;
