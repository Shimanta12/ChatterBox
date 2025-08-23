// src/screens/RegisterScreen.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      // backend returns { token, user }
      const token = res.data.token;
      const userObj = res.data.user ?? res.data;
      if (!token) throw new Error('No token in response');
      await login(token, userObj);
    } catch (err) {
      Alert.alert('Register failed', err.response?.data?.message || err.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput placeholder="Name" placeholderTextColor="#fff" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" placeholderTextColor="#fff" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" placeholderTextColor="#fff" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Register" onPress={onRegister} />
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={{ color: '#4f8cff' }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0b0d12' },
  title: { fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: '#121621', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  link: { marginTop: 12, alignItems: 'center' }
});

export default RegisterScreen;
