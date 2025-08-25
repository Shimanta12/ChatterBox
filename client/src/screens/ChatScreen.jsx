import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import api from '../utils/api';
import { initSocket, getSocket } from '../socket/socket';
import MessageBubble from '../components/MessageBubble';
import { useAuth } from '../context/AuthContext';

const ChatScreen = ({ route }) => {
  const { friend } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const friendId = friend._id ?? friend.id;

  const loadThread = async () => {
    try {
      const res = await api.get(`/messages/thread/${friendId}`);
      setMessages(res.data);
    } catch (err) {
      console.warn('loadThread', err.message || err);
    }
  };

  useEffect(() => {
    (async () => {
      await initSocket();
      const socket = getSocket();
      if (!socket) return;

      const onNew = (msg) => {
        if (String(msg.from) === String(friendId) || String(msg.to) === String(friendId)) {
          setMessages((m) => [...m, msg]);
        }
      };

      socket.on('message:new', onNew);

      await loadThread();

      return () => {
        socket.off('message:new', onNew);
      };
    })();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('message:send', { to: friendId, body: text });
      setMessages((m) => [...m, { _id: `tmp-${Date.now()}`, from: user._id || user.id, to: friendId, body: text, createdAt: new Date().toISOString(), delivered: false }]);
      setText('');
    } else {
      try {
        const { data } = await api.post('/messages/send', { to: friendId, body: text });
        setMessages((m) => [...m, data]);
        setText('');
      } catch (err) {
        console.warn('sendMessage error', err.message || err);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => {
            const isMine = String(item.from) === String(user._id || user.id);
            const messageUser = isMine ? user : friend;
            return (
              <MessageBubble 
                message={item} 
                isMine={isMine} 
                user={messageUser}
              />
            );
          }}
          contentContainerStyle={{ padding: 12 }}
        />
        <View style={styles.row}>
          <TextInput value={text} onChangeText={setText} placeholder="Type a message" style={styles.input} placeholderTextColor="#9aa0b4" />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0d12' },
  row: { flexDirection: 'row', padding: 8, gap: 8, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#121621', color: '#fff', padding: 12, borderRadius: 8, marginRight: 8 }
});

export default ChatScreen;
