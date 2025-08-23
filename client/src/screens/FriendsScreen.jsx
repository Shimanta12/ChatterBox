// src/screens/FriendsScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Alert } from 'react-native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FriendsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [friends, setFriends] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/friends/list');
      setFriends(res.data);
    } catch (err) {
      console.warn('loadFriends', err.message || err);
    }
  };

  const search = async () => {
    try {
      const res = await api.get('/users/search', { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      console.warn('search', err.message || err);
    }
  };

  const sendRequest = async (toUserId) => {
    try {
      await api.post('/friends/request', { toUserId });
      Alert.alert('Request sent');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error');
    }
  };

  useEffect(() => { loadFriends(); }, []);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.welcome}>Hello, {user?.name}</Text>
        <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Logout" onPress={logout} color="#ff5d5d" />
      </View>

      <View style={{ marginBottom: 10 }}>
        <TextInput placeholder="Search name or email" value={query} onChangeText={setQuery} style={styles.input} />
        <Button title="Search" onPress={search} />
      </View>

      {results.length > 0 && (
        <>
          <Text style={styles.heading}>Results</Text>
          <FlatList
            data={results}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity style={styles.btn} onPress={() => sendRequest(item._id)}>
                  <Text style={{ color: '#fff' }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}

      <Text style={styles.heading}>Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Chat', { friend: item })}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#0b0d12' },
  welcome: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#121621', color: '#fff', padding: 10, borderRadius: 8 },
  heading: { color: '#fff', fontSize: 16, marginTop: 12, marginBottom: 6 },
  row: { backgroundColor: '#121621', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff' },
  btn: { backgroundColor: '#4f8cff', padding: 8, borderRadius: 8 }
});

export default FriendsScreen;
