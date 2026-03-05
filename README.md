# ChatterBox 💬

A cross-platform real-time chat application built with React Native and Node.js. ChatterBox supports friend management, live messaging with delivery and read receipts, typing indicators, and online presence — all over WebSockets.

---

## Tech Stack

**Client**
- React Native 0.81 (iOS & Android)
- React Navigation (Native Stack)
- Socket.IO Client
- Axios
- React Native Paper (UI components)
- AsyncStorage (token persistence)

**Server**
- Node.js + Express 5
- Socket.IO
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- Helmet, CORS, Morgan

---

## Features

- **Authentication** — Register and login with JWT-based session management
- **Friend System** — Send, receive, accept/reject friend requests; unfriend users
- **Real-time Messaging** — Instant message delivery over WebSockets
- **Delivery & Read Receipts** — Messages are marked as delivered when the recipient is online, and read when they open the conversation
- **Typing Indicators** — Live typing status broadcast to the other user
- **Online Presence** — Real-time online/offline status for all users

---

## Project Structure

```
ChatterBox/
├── client/                      # React Native app
│   ├── src/
│   │   ├── screens/             # LoginScreen, RegisterScreen, FriendsScreen, ChatScreen, ProfileScreen
│   │   ├── components/          # MessageBubble
│   │   ├── context/             # AuthContext (JWT + user state)
│   │   ├── navigation/          # AppNavigator (auth-gated stack)
│   │   ├── socket/              # Socket.IO client setup
│   │   └── utils/               # Axios API helper
│   └── App.jsx
│
└── server/                      # Node.js backend
    └── src/
        ├── config/              # MongoDB connection
        ├── controllers/         # auth, user, friend, message logic
        ├── middleware/          # JWT auth guard
        ├── models/              # User, Message, FriendRequest schemas
        ├── routes/              # REST API routes
        ├── socket/              # Socket.IO server + online registry
        └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- React Native environment set up ([official guide](https://reactnative.dev/docs/environment-setup))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ChatterBox.git
cd ChatterBox
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:8081
```

Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 3. Set up the client

```bash
cd client
npm install
```

Update the API base URL in `src/utils/api.js` to point to your running server (e.g., `http://10.0.2.2:5000` for Android emulator).

Run the app:

```bash
# Android
npm run android

# iOS
npm run ios
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/users` | ✅ | Search/list users |
| POST | `/api/friends/request` | ✅ | Send a friend request |
| GET | `/api/friends/requests` | ✅ | List pending friend requests |
| POST | `/api/friends/request/action` | ✅ | Accept or reject a request |
| GET | `/api/friends/list` | ✅ | Get friends list |
| DELETE | `/api/friends/unfriend/:friendId` | ✅ | Remove a friend |
| GET | `/api/messages/:userId` | ✅ | Fetch message history with a user |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send a message to another user |
| `message:new` | Server → Client | Receive a new incoming message |
| `message:ack` | Server → Client | Delivery confirmation for sent message |
| `message:read` | Client → Server | Mark messages from a user as read |
| `typing:start` | Client → Server | Notify the other user that you started typing |
| `typing:stop` | Client → Server | Notify the other user that you stopped typing |
| `presence:update` | Server → All | Broadcast a user's online/offline status change |

---

## Data Models

**User**
```
name, email, password, avatar, friends[], createdAt, updatedAt
```

**Message**
```
from (User), to (User), body, delivered, read, createdAt, updatedAt
```

**FriendRequest**
```
from (User), to (User), status (pending | accepted | rejected), createdAt, updatedAt
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins |

---

## License

This project is for academic purposes — Mobile Application Development course final project.
