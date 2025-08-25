# Avatar Functionality Setup Guide

## Overview
This guide explains how to set up the avatar functionality for the ChatterBox chat application.

## Server Setup

### 1. Install Dependencies
The following packages have been added to the server:
- `multer` - For handling file uploads
- `cloudinary` - For cloud image storage
- `multer-storage-cloudinary` - For integrating multer with cloudinary

### 2. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatterbox

# JWT
JWT_SECRET=your_jwt_secret_here

# Client Origin (for CORS)
CLIENT_ORIGIN=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Cloudinary Setup
1. Sign up for a free Cloudinary account at https://cloudinary.com/
2. Get your cloud name, API key, and API secret from your dashboard
3. Add these credentials to your `.env` file

## Client Setup

### 1. Install Dependencies
The following packages have been added to the client:
- `react-native-image-picker` - For selecting images from camera or gallery
- `react-native-image-crop-picker` - For image cropping (optional enhancement)

### 2. Android Permissions
Add the following permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 3. iOS Permissions
Add the following keys to `ios/YourApp/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take profile pictures</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select profile pictures</string>
```

## Features Implemented

### Server Side
- **Avatar Upload**: POST `/api/avatar/upload` - Upload new avatar image
- **Avatar Removal**: DELETE `/api/avatar/remove` - Remove current avatar
- **Avatar Retrieval**: GET `/api/avatar/me` - Get current user's avatar
- **Image Processing**: Automatic resizing to 300x300px with fill crop
- **Cloud Storage**: Images stored in Cloudinary with organized folder structure

### Client Side
- **Avatar Component**: Reusable component for displaying user avatars with fallback initials
- **Avatar Picker**: Component for selecting, uploading, and removing avatars
- **Profile Integration**: Avatar management integrated into ProfileScreen
- **Chat Integration**: User avatars displayed in chat messages
- **Friends List**: User avatars displayed in friends list and search results

## Usage

### Uploading an Avatar
1. Navigate to Profile screen
2. Tap the avatar or "Change Avatar" button
3. Choose between Camera or Photo Library
4. Select or take a photo
5. Image will be automatically uploaded and displayed

### Removing an Avatar
1. Navigate to Profile screen
2. Tap "Remove Avatar" button
3. Confirm the action
4. Avatar will be removed and initials will be displayed instead

### Viewing Avatars
- User avatars are automatically displayed throughout the app
- In chat messages, friend avatars are shown next to their messages
- In friends list, user avatars are displayed next to names
- Fallback initials are shown when no avatar is set

## Technical Details

### Image Processing
- Images are automatically resized to 300x300px
- Supported formats: JPG, JPEG, PNG, GIF
- Images are stored in Cloudinary's "chatterbox-avatars" folder
- Old avatars are automatically deleted when new ones are uploaded

### Security
- Avatar uploads require authentication
- File type validation on server side
- Image size limits enforced
- Secure file storage in Cloudinary

### Performance
- Images are optimized for mobile display
- Lazy loading of avatar images
- Efficient caching through Cloudinary CDN

## Troubleshooting

### Common Issues
1. **Permission Denied**: Ensure camera and storage permissions are granted
2. **Upload Failed**: Check Cloudinary credentials in .env file
3. **Image Not Displaying**: Verify image URL format and network connectivity
4. **App Crashes**: Ensure all dependencies are properly installed

### Debug Steps
1. Check server logs for upload errors
2. Verify Cloudinary configuration
3. Test image picker permissions
4. Check network connectivity for image loading

## Future Enhancements
- Image cropping before upload
- Multiple avatar options
- Avatar animation effects
- Group avatar support
- Avatar templates/themes
