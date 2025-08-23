// src/screens/ProfileScreen.jsx
import React, { useContext, useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProfileScreen = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');

  const updateProfile = async () => {
    try {
      const { data } = await api.put('/users/me', { name, avatar, password: password || undefined });
      setUser(data);
      Alert.alert('Saved');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text>Email: {user?.email}</Text>
      <TextInput value={name} placeholderTextColor="#fff" onChangeText={setName} placeholder="Name" style={styles.input} />
      <TextInput value={avatar} placeholderTextColor="#fff" onChangeText={setAvatar} placeholder="Avatar URL" style={styles.input} />
      <TextInput value={password} placeholderTextColor="#fff" onChangeText={setPassword} placeholder="New Password" secureTextEntry style={styles.input} />
      <Button title="Save" onPress={updateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0d12' },
  heading: { color: '#fff', fontSize: 18, marginBottom: 12 },
  input: { backgroundColor: '#121621', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 }
});

export default ProfileScreen;
