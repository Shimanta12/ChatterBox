import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Alert } from 'react-native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FriendsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/friends/list');
      console.log('Friends loaded:', res.data);
      setFriends(res.data);
    } catch (err) {
      console.warn('loadFriends', err.message || err);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      console.log('Friend requests response:', res.data);
      
      const friendIds = friends.map(f => f._id);
      const filteredRequests = (res.data.incoming || []).filter(request => 
        !friendIds.includes(request.from._id)
      );
      
      setFriendRequests(filteredRequests);
    } catch (err) {
      console.error('loadFriendRequests error:', err.response?.data || err.message || err);
    }
  };

  const loadOutgoingRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      console.log('Outgoing requests response:', res.data.outgoing);
      
      // Filter out any null or invalid requests
      const validOutgoingRequests = (res.data.outgoing || []).filter(request => 
        request && request.to // Only keep requests where 'to' is not null/undefined
      );
      
      setOutgoingRequests(validOutgoingRequests);
    } catch (err) {
      console.warn('loadOutgoingRequests', err.message || err);
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

  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  const hasOutgoingRequest = (userId) => {
    return outgoingRequests.some(request => {
      // Handle cases where request.to might be null or undefined
      if (!request.to) return false;
      
      // Handle both populated objects and direct IDs
      const toId = typeof request.to === 'object' ? request.to._id : request.to;
      return toId === userId;
    });
  };

  const sendRequest = async (toUserId) => {
    if (isFriend(toUserId)) {
      Alert.alert('Already Friends', 'This user is already in your friends list');
      return;
    }

    if (hasOutgoingRequest(toUserId)) {
      Alert.alert('Request Already Sent', 'You have already sent a friend request to this user');
      return;
    }

    try {
      await api.post('/friends/request', { toUserId });
      Alert.alert('Request sent');
      
      // Update search results to show "sent"
      setResults(results.map(user => 
        user._id === toUserId 
          ? { ...user, requestSent: true }
          : user
      ));
      
      // Refresh outgoing requests to keep data in sync
      loadOutgoingRequests();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      console.log('Accepting request:', requestId);
      const response = await api.post('/friends/request/action', { requestId, action: 'accept' });
      console.log('Accept response:', response.data);
      Alert.alert('Friend request accepted');
      loadFriends();
      loadFriendRequests();
      loadOutgoingRequests();
    } catch (err) {
      console.error('Accept request error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error accepting request');
    }
  };

  const declineRequest = async (requestId) => {
    try {
      console.log('Declining request:', requestId);
      const response = await api.post('/friends/request/action', { requestId, action: 'reject' });
      console.log('Decline response:', response.data);
      Alert.alert('Friend request declined');
      loadFriendRequests();
    } catch (err) {
      console.error('Decline request error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Error declining request');
    }
  };

  const unfriendUser = async (friendId, friendName) => {
    Alert.alert(
      'Unfriend User',
      `Are you sure you want to remove ${friendName} from your friends list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== UNFRIEND DEBUG ===');
              console.log('User ID:', user?._id);
              console.log('Friend ID to unfriend:', friendId);
              console.log('API endpoint:', `/friends/unfriend/${friendId}`);
              console.log('Authorization header:', api.defaults.headers.common['Authorization']);
              
              const response = await api.delete(`/friends/unfriend/${friendId}`);
              console.log('Unfriend response:', response.data);
              console.log('Unfriend status:', response.status);
              
              Alert.alert('Success', `${friendName} has been removed from your friends list`);
              
              // Refresh the friends list
              await loadFriends();
              await loadOutgoingRequests();
              
              // Also update search results if the unfriended user is in the results
              setResults(results.map(user => 
                user._id === friendId 
                  ? { ...user, requestSent: false }
                  : user
              ));
              
              console.log('=== UNFRIEND COMPLETE ===');
            } catch (err) {
              console.error('=== UNFRIEND ERROR ===');
              console.error('Error object:', err);
              console.error('Error response:', err.response?.data);
              console.error('Error status:', err.response?.status);
              console.error('Error message:', err.message);
              
              Alert.alert(
                'Error', 
                err.response?.data?.message || err.message || 'Error removing friend'
              );
            }
          }
        }
      ]
    );
  };

  useEffect(() => { 
    loadFriends();
    loadFriendRequests();
    loadOutgoingRequests();
  }, []);

  const renderFriendRequest = ({ item }) => {
    console.log('Rendering friend request item:', item);
    
    const userName = item.from?.name || 
                    item.fromUser?.name || 
                    item.sender?.name || 
                    `User ${item.from || 'Unknown'}`;
    
    return (
      <View style={styles.requestRow}>
        <View>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <View style={styles.requestButtons}>
          <TouchableOpacity 
            style={[styles.btn, styles.acceptBtn]} 
            onPress={() => acceptRequest(item._id)}
          >
            <Text style={{ color: '#fff' }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.declineBtn]} 
            onPress={() => declineRequest(item._id)}
          >
            <Text style={{ color: '#fff' }}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendRow}>
      <TouchableOpacity 
        style={styles.friendInfo}
        onPress={() => navigation.navigate('Chat', { friend: item })}
      >
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.friendActions}>
        <TouchableOpacity 
          style={[styles.btn, styles.chatBtn]}
          onPress={() => navigation.navigate('Chat', { friend: item })}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.unfriendBtn]}
          onPress={() => {
            console.log('Unfriend button pressed for:', item);
            unfriendUser(item._id, item.name);
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Unfriend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.welcome}>Hello, {user?.name}</Text>
        <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Logout" onPress={logout} color="#ff5d5d" />
      </View>

      <View style={{ marginBottom: 10 }}>
        <TextInput 
          placeholder="Search name or email" 
          placeholderTextColor="#fff" 
          value={query} 
          onChangeText={setQuery} 
          style={styles.input} 
        />
        <Button title="Search" onPress={search} />
      </View>

      {results.length > 0 && (
        <>
          <Text style={styles.heading}>Search Results</Text>
          <FlatList
            data={results}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => {
              const isAlreadyFriend = isFriend(item._id);
              const isCurrentUser = item._id === user?._id;
              const hasPendingRequest = hasOutgoingRequest(item._id);
              const requestSentLocally = item.requestSent;
              const showAsSent = hasPendingRequest || requestSentLocally;
              
              return (
                <View style={styles.row}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    {isAlreadyFriend && (
                      <Text style={styles.friendTag}>✓ Friend</Text>
                    )}
                    {isCurrentUser && (
                      <Text style={styles.friendTag}>You</Text>
                    )}
                    {/* {showAsSent && !isAlreadyFriend && (
                      <Text style={styles.sentTag}>Request Sent</Text>
                    )} */}
                  </View>
                  {!isAlreadyFriend && !isCurrentUser && (
                    <TouchableOpacity 
                      style={[styles.btn, showAsSent && styles.disabledBtn]} 
                      onPress={() => sendRequest(item._id)}
                      disabled={showAsSent}
                    >
                      <Text style={{ color: '#fff' }}>
                        {showAsSent ? 'Sent' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            style={{ maxHeight: 150, marginBottom: 10 }}
          />
        </>
      )}

      {friendRequests.length > 0 && (
        <>
          <Text style={styles.heading}>Friend Requests ({friendRequests.length})</Text>
          <FlatList
            data={friendRequests}
            keyExtractor={(i) => i._id}
            renderItem={renderFriendRequest}
            style={{ maxHeight: 200, marginBottom: 10 }}
          />
        </>
      )}

      <Text style={styles.heading}>Friends ({friends.length})</Text>
      <FlatList
        data={friends}
        keyExtractor={(i) => i._id}
        renderItem={renderFriend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#0b0d12' },
  welcome: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#121621', color: '#fff', padding: 10, borderRadius: 8 },
  heading: { color: '#fff', fontSize: 16, marginTop: 12, marginBottom: 6 },
  row: { 
    backgroundColor: '#121621', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  requestRow: {
    backgroundColor: '#121621',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#4f8cff'
  },
  friendRow: {
    backgroundColor: '#121621',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  friendInfo: {
    flex: 1,
    marginRight: 12
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8
  },
  name: { color: '#fff' },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btn: { backgroundColor: '#4f8cff', padding: 8, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  requestButtons: {
    flexDirection: 'row',
    gap: 8
  },
  acceptBtn: {
    backgroundColor: '#4caf50'
  },
  chatBtn: {
    backgroundColor: '#4f8cff'
  },
  unfriendBtn: {
    backgroundColor: '#ff6b6b'
  },
  friendTag: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: 'bold'
  },
  sentTag: {
    color: '#ffa726',
    fontSize: 12,
    fontStyle: 'italic'
  },
  disabledBtn: {
    backgroundColor: '#666',
    opacity: 0.7
  },
  requestInfo: { 
    color: '#aaa', 
    fontSize: 12, 
    marginTop: 2 
  },
  declineBtn: {
    backgroundColor: '#f44336'
  }
});

export default FriendsScreen;