import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message, isMine }) => {
  const body = message.body ?? message.content ?? message.text;
  const time = message.createdAt ?? message.created_at ?? message.createdAt;
  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Text style={styles.text}>{body}</Text>
      <Text style={styles.time}>{new Date(time).toLocaleTimeString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginVertical: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#4f8cff' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#2b2b2b' },
  text: { color: '#fff' },
  time: { color: '#e0e0e0', fontSize: 10, marginTop: 6, textAlign: 'right' }
});

export default MessageBubble;
