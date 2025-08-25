# Voice Message Functionality Implementation

This document describes the implementation of voice message functionality in the ChatterBox application, similar to WhatsApp's voice messaging feature.

## Features

- **Voice Recording**: Users can record voice messages using a microphone button
- **Real-time Sending**: Voice messages are sent in real-time via WebSocket
- **Audio Playback**: Received voice messages can be played with progress bar
- **File Storage**: Audio files are stored on the server with proper organization
- **Message Types**: Support for both text and voice message types

## Frontend Components

### 1. VoiceRecorder Component (`client/src/components/VoiceRecorder.jsx`)
- Handles voice recording with start/stop functionality
- Shows recording timer and duration
- Provides preview before sending
- Integrates with the chat interface

### 2. VoicePlayer Component (`client/src/components/VoicePlayer.jsx`)
- Plays received voice messages
- Shows progress bar and time information
- Supports play/pause/stop controls
- Displays current playback position

### 3. Updated MessageBubble Component
- Displays both text and voice messages
- Integrates VoicePlayer for voice messages
- Shows voice message indicators

### 4. Updated ChatScreen
- Integrates VoiceRecorder component
- Handles voice message sending
- Supports both socket and REST API fallback

## Backend Implementation

### 1. Database Schema Updates
- Added `messageType` field (text/voice)
- Added `audioUrl` field for voice file paths
- Added `audioDuration` field for message length

### 2. File Upload Handling
- Uses Multer for audio file uploads
- Stores files in `uploads/audio/` directory
- Generates unique filenames
- Enforces file type and size limits

### 3. API Endpoints
- `POST /api/messages/send-voice` - Upload and send voice messages
- Updated `POST /api/messages/send` - Support for message types

### 4. WebSocket Updates
- Enhanced message handling for voice messages
- Real-time voice message delivery
- Support for voice message metadata

## File Structure

```
server/
├── uploads/
│   └── audio/          # Voice message storage
├── src/
│   ├── models/
│   │   └── Message.js  # Updated schema
│   ├── controllers/
│   │   └── messageController.js  # Voice message handling
│   ├── routes/
│   │   └── messageRoutes.js      # Voice message routes
│   └── socket/
│       └── index.js    # Enhanced WebSocket handling

client/
├── src/
│   ├── components/
│   │   ├── VoiceRecorder.jsx    # Recording interface
│   │   ├── VoicePlayer.jsx      # Playback interface
│   │   └── MessageBubble.jsx    # Updated message display
│   ├── screens/
│   │   └── ChatScreen.jsx       # Voice recording integration
│   └── utils/
│       └── api.js               # Audio URL helpers
```

## Dependencies

### Frontend
- `react-native-audio-recorder-player` - Audio recording and playback
- `react-native-permissions` - Microphone permissions
- `react-native-fs` - File system operations

### Backend
- `multer` - File upload handling
- `express.static` - Static file serving

## Usage

### Recording a Voice Message
1. Tap the microphone button (🎤) in the chat
2. Recording starts automatically
3. Tap the stop button (■) to finish recording
4. Review the recording and tap "Send" to send

### Playing a Voice Message
1. Tap the play button (▶️) on received voice messages
2. Use pause (⏸️) to pause playback
3. Use stop (⏹️) to stop and reset playback
4. Progress bar shows current position

## Configuration

### Audio File Settings
- **Format**: M4A (default)
- **Size Limit**: 10MB per file
- **Storage**: Local server storage (configurable for production)

### Permissions
- Microphone access required for recording
- Storage permissions for file access

## Production Considerations

### File Storage
- Consider using cloud storage (AWS S3, Google Cloud Storage)
- Implement CDN for faster audio delivery
- Add file compression for bandwidth optimization

### Security
- Validate file types and sizes
- Implement user authentication for file access
- Consider file encryption for sensitive content

### Performance
- Implement audio streaming for large files
- Add caching for frequently accessed audio
- Optimize database queries for message types

## Testing

Run the test script to verify functionality:
```bash
cd server
node test-voice.js
```

## Troubleshooting

### Common Issues
1. **Recording not working**: Check microphone permissions
2. **Audio not playing**: Verify file paths and server configuration
3. **File upload errors**: Check file size and format restrictions

### Debug Steps
1. Check server logs for upload errors
2. Verify file permissions in uploads directory
3. Test audio file accessibility via direct URL
4. Check WebSocket connection status

## Future Enhancements

- Voice message transcription
- Audio quality settings
- Voice message forwarding
- Voice message reactions
- Background audio playback
- Voice message search
