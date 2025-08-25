import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VoicePlayer from './VoicePlayer';
import { getAudioUrl } from '../utils/api';

const MessageBubble = ({ message, isMine }) => {
  const body = message.body ?? message.content ?? message.text;
  const time = message.createdAt ?? message.created_at ?? message.createdAt;
  const messageType = message.messageType || 'text';
  const audioUrl = message.audioUrl ? getAudioUrl(message.audioUrl) : null;
  const audioDuration = message.audioDuration;

  const renderMessageContent = () => {
    if (messageType === 'voice' && audioUrl) {
      return (
        <View>
          <Text style={styles.voiceLabel}>🎤 Voice Message</Text>
          <VoicePlayer audioUrl={audioUrl} duration={audioDuration} />
        </View>
      );
    }
    
    return <Text style={styles.text}>{body}</Text>;
  };

  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      {renderMessageContent()}
      <Text style={styles.time}>{new Date(time).toLocaleTimeString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginVertical: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#4f8cff' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#2b2b2b' },
  text: { color: '#fff' },
  voiceLabel: { color: '#fff', fontSize: 12, marginBottom: 8, opacity: 0.8 },
  time: { color: '#e0e0e0', fontSize: 10, marginTop: 6, textAlign: 'right' }
});

export default MessageBubble;
