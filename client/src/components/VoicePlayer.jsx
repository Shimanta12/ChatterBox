import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const VoicePlayer = ({ audioUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
  const progressTimer = useRef(null);

  useEffect(() => {
    // Set up audio player listeners
    audioRecorderPlayer.current.addPlayBackListener((e) => {
      if (e.currentPosition === e.duration) {
        // Audio finished playing
        setIsPlaying(false);
        setCurrentPosition(0);
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
      } else {
        setCurrentPosition(e.currentPosition);
        setTotalDuration(e.duration);
      }
    });

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      audioRecorderPlayer.current.removePlayBackListener();
    };
  }, []);

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioRecorderPlayer.current.pausePlayer();
        setIsPlaying(false);
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
      } else {
        if (currentPosition === 0) {
          // Start from beginning
          await audioRecorderPlayer.current.startPlayer(audioUrl);
        } else {
          // Resume from current position
          await audioRecorderPlayer.current.resumePlayer();
        }
        setIsPlaying(true);
        
        // Start progress timer
        progressTimer.current = setInterval(() => {
          audioRecorderPlayer.current.getCurrentPosition((position) => {
            setCurrentPosition(position);
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    try {
      await audioRecorderPlayer.current.stopPlayer();
      setIsPlaying(false);
      setCurrentPosition(0);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentPosition / totalDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
        <Text style={styles.playText}>{isPlaying ? '⏸️' : '▶️'}</Text>
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration * 1000)}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
        <Text style={styles.stopText}>⏹️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f8cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playText: {
    fontSize: 16,
    color: '#fff',
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f8cff',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 10,
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default VoicePlayer;
