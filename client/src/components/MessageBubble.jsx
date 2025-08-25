import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';

const MessageBubble = ({ message, isMine, user }) => {
  const body = message.body ?? message.content ?? message.text;
  const time = message.createdAt ?? message.created_at ?? message.createdAt;
  
  return (
    <View style={[styles.container, isMine ? styles.mineContainer : styles.theirsContainer]}>
      {!isMine && user && (
        <Avatar user={user} size={32} style={styles.avatar} />
      )}
      <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
        {!isMine && user && (
          <Text style={styles.userName}>{user.name}</Text>
        )}
        <Text style={styles.text}>{body}</Text>
        <Text style={styles.time}>{new Date(time).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  mineContainer: {
    justifyContent: 'flex-end',
  },
  theirsContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: { 
    maxWidth: '70%', 
    padding: 10, 
    borderRadius: 12,
  },
  mine: { 
    backgroundColor: '#4f8cff',
    alignSelf: 'flex-end',
  },
  theirs: { 
    backgroundColor: '#2b2b2b',
    alignSelf: 'flex-start',
  },
  userName: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  text: { color: '#fff' },
  time: { color: '#e0e0e0', fontSize: 10, marginTop: 6, textAlign: 'right' }
});

export default MessageBubble;
