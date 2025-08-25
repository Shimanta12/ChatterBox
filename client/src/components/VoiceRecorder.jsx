import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AudioRecorderPlayer, { AVEncoderAudioQualityIOSType, AVEncodingOption, AudioEncoderAndroidType, AudioSourceAndroidType } from 'react-native-audio-recorder-player';

const VoiceRecorder = ({ onSendVoice, isRecording, setIsRecording }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const recordingTimer = useRef(null);

  const startRecording = async () => {
    try {
      const result = await audioRecorderPlayer.current.startRecorder();
      setAudioFile(result);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();
      setIsRecording(false);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      setAudioFile(result);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const cancelRecording = async () => {
    try {
      await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();
      setIsRecording(false);
      setAudioFile(null);
      setRecordingTime(0);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  const sendVoiceMessage = () => {
    if (audioFile && recordingTime > 0) {
      onSendVoice(audioFile, recordingTime);
      setAudioFile(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Recording...</Text>
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.stopText}>■</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (audioFile) {
    return (
      <View style={styles.audioPreviewContainer}>
        <View style={styles.audioInfo}>
          <Text style={styles.audioText}>Voice Message</Text>
          <Text style={styles.audioDuration}>{formatTime(recordingTime)}</Text>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={sendVoiceMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
      <Text style={styles.recordText}>🎤</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  recordText: {
    fontSize: 18,
    color: '#fff',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  recordingInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordingTime: {
    color: '#fff',
    fontSize: 12,
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f8cff',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  audioInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  audioText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  audioDuration: {
    color: '#fff',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  sendText: {
    color: '#4f8cff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default VoiceRecorder;
