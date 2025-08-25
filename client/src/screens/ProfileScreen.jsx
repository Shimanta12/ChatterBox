import React, { useContext, useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import AvatarPicker from '../components/AvatarPicker';

const ProfileScreen = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');

  const updateProfile = async () => {
    try {
      const { data } = await api.put('/users/me', { name, password: password || undefined });
      setUser(data);
      Alert.alert('Saved');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Profile</Text>
      
      <View style={styles.avatarSection}>
        <Avatar 
          user={user} 
          size={100} 
          style={styles.profileAvatar}
        />
        <AvatarPicker onAvatarChange={handleAvatarChange} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        
        <Text style={styles.label}>Name</Text>
        <TextInput 
          value={name} 
          placeholderTextColor="#666" 
          onChangeText={setName} 
          placeholder="Name" 
          style={styles.input} 
        />
        
        <Text style={styles.label}>New Password</Text>
        <TextInput 
          value={password} 
          placeholderTextColor="#666" 
          onChangeText={setPassword} 
          placeholder="New Password" 
          secureTextEntry 
          style={styles.input} 
        />
        
        <Button title="Save Profile" onPress={updateProfile} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0b0d12' 
  },
  contentContainer: {
    padding: 16,
  },
  heading: { 
    color: '#fff', 
    fontSize: 24, 
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    marginBottom: 20,
  },
  infoSection: {
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#121621',
    borderRadius: 8,
  },
  input: { 
    backgroundColor: '#121621', 
    color: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 16,
    fontSize: 16,
  }
});

export default ProfileScreen;
