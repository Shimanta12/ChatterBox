// Audio recording configuration
export const AUDIO_CONFIG = {
  // Recording settings
  audioEncoder: 'aac', // Audio encoder type
  audioSource: 'mic', // Audio source (microphone)
  outputFormat: 'm4a', // Output file format
  sampleRate: 44100, // Sample rate in Hz
  numberOfChannels: 1, // Mono recording
  bitRate: 128000, // Bit rate in bits per second
  
  // File settings
  maxFileSize: 10 * 1024 * 1024, // 10MB max file size
  maxDuration: 300, // 5 minutes max recording duration
  
  // UI settings
  showTimer: true, // Show recording timer
  showWaveform: false, // Show audio waveform (future feature)
  
  // Playback settings
  autoPlay: false, // Auto-play received messages
  loopPlayback: false, // Loop audio playback
};

// Audio quality presets
export const AUDIO_QUALITY_PRESETS = {
  low: {
    sampleRate: 22050,
    bitRate: 64000,
    numberOfChannels: 1,
  },
  medium: {
    sampleRate: 44100,
    bitRate: 128000,
    numberOfChannels: 1,
  },
  high: {
    sampleRate: 48000,
    bitRate: 256000,
    numberOfChannels: 2,
  },
};

// File type mappings
export const AUDIO_FILE_TYPES = {
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
};

// Error messages
export const AUDIO_ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Microphone permission is required to record voice messages',
  RECORDING_FAILED: 'Failed to start recording. Please try again.',
  PLAYBACK_FAILED: 'Failed to play audio. Please try again.',
  FILE_TOO_LARGE: 'Audio file is too large. Maximum size is 10MB.',
  INVALID_FORMAT: 'Invalid audio format. Please use supported formats.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};
